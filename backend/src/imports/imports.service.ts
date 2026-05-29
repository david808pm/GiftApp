import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';

interface ImportRow {
  campaignSlug: string;
  employeeDocumentId: string;
  employeeFullName: string;
  employeeEmail?: string;
  employeePhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  beneficiaryFullName: string;
  beneficiaryAge: number;
  beneficiaryGender: string;
}

interface ImportError {
  row: number;
  message: string;
}

interface ImportWarning {
  row: number;
  message: string;
}

export interface ImportResult {
  totalRows: number;
  employeesCreated: number;
  employeesUpdated: number;
  beneficiariesCreated: number;
  skippedRows: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

const EXPECTED_HEADERS = [
  'campaignSlug',
  'employeeDocumentId',
  'employeeFullName',
  'employeeEmail',
  'employeePhone',
  'shippingAddress',
  'shippingCity',
  'beneficiaryFullName',
  'beneficiaryAge',
  'beneficiaryGender',
];

function normalizeGender(raw: string): string | null {
  const v = raw.trim().toLowerCase();
  if (v === 'male' || v === 'masculino' || v === 'm') return 'male';
  if (v === 'female' || v === 'femenino' || v === 'f') return 'female';
  return null;
}

@Injectable()
export class ImportsService {
  constructor(private readonly prisma: PrismaService) {}

  async importEmployeesBeneficiaries(
    file: Express.Multer.File,
    adminUserId: number,
  ): Promise<ImportResult> {
    if (!file) {
      throw new BadRequestException('El archivo es obligatorio.');
    }

    if (!file.originalname.toLowerCase().endsWith('.xlsx')) {
      throw new BadRequestException('El archivo debe ser un Excel (.xlsx).');
    }

    // ── 1. Parse workbook ──────────────────────────────────
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('El archivo Excel no contiene hojas.');
    }
    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(
      sheet,
      { defval: '' },
    );

    if (rawRows.length === 0) {
      return {
        totalRows: 0,
        employeesCreated: 0,
        employeesUpdated: 0,
        beneficiariesCreated: 0,
        skippedRows: 0,
        errors: [],
        warnings: [],
      };
    }

    // ── 2. Validate headers ────────────────────────────────
    const fileHeaders = Object.keys(rawRows[0]).map((h) => h.trim());
    const missingHeaders = EXPECTED_HEADERS.filter(
      (h) => !fileHeaders.includes(h),
    );
    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `El archivo Excel debe contener las columnas esperadas. Faltan: ${missingHeaders.join(', ')}.`,
      );
    }

    // ── 3. First pass: validate & normalize all rows ───────
    const errors: ImportError[] = [];
    const validRows: (ImportRow & { excelRow: number })[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const excelRow = i + 2; // header is row 1
      const r = rawRows[i];

      const campaignSlug = String(r['campaignSlug'] ?? '').trim();
      const employeeDocumentId = String(r['employeeDocumentId'] ?? '').trim();
      const employeeFullName = String(r['employeeFullName'] ?? '').trim();
      const employeeEmail =
        String(r['employeeEmail'] ?? '').trim().toLowerCase() || undefined;
      const employeePhone =
        String(r['employeePhone'] ?? '').trim() || undefined;
      const shippingAddress =
        String(r['shippingAddress'] ?? '').trim() || undefined;
      const shippingCity =
        String(r['shippingCity'] ?? '').trim() || undefined;
      const beneficiaryFullName = String(
        r['beneficiaryFullName'] ?? '',
      ).trim();
      const beneficiaryAgeRaw = r['beneficiaryAge'];
      const beneficiaryGenderRaw = String(
        r['beneficiaryGender'] ?? '',
      ).trim();

      // Required validations
      if (!campaignSlug) {
        errors.push({
          row: excelRow,
          message: 'El campaignSlug es obligatorio.',
        });
        continue;
      }
      if (!employeeDocumentId) {
        errors.push({
          row: excelRow,
          message: 'El employeeDocumentId es obligatorio.',
        });
        continue;
      }
      if (!employeeFullName) {
        errors.push({
          row: excelRow,
          message: 'El employeeFullName es obligatorio.',
        });
        continue;
      }
      if (!beneficiaryFullName) {
        errors.push({
          row: excelRow,
          message: 'El beneficiaryFullName es obligatorio.',
        });
        continue;
      }

      const ageNum = Number(beneficiaryAgeRaw);
      if (
        !Number.isInteger(ageNum) ||
        ageNum < 0 ||
        ageNum > 13
      ) {
        errors.push({
          row: excelRow,
          message: 'La edad del beneficiario debe ser un número entero entre 0 y 13.',
        });
        continue;
      }
      const beneficiaryAge = ageNum;

      const beneficiaryGender = normalizeGender(beneficiaryGenderRaw);
      if (!beneficiaryGender) {
        errors.push({
          row: excelRow,
          message:
            'El género del beneficiario debe ser male/female (o masculino/femenino).',
        });
        continue;
      }

      validRows.push({
        excelRow,
        campaignSlug,
        employeeDocumentId,
        employeeFullName,
        employeeEmail,
        employeePhone,
        shippingAddress,
        shippingCity,
        beneficiaryFullName,
        beneficiaryAge,
        beneficiaryGender,
      });
    }

    // ── 4. Preload campaigns by slug ───────────────────────
    const slugs = [...new Set(validRows.map((r) => r.campaignSlug))];
    const campaigns = await this.prisma.campaign.findMany({
      where: { slug: { in: slugs }, deletedAt: null },
      select: { id: true, slug: true },
    });
    const campaignBySlug = new Map<string, number>();
    for (const c of campaigns) {
      campaignBySlug.set(c.slug, c.id);
    }

    // Remove rows whose campaign doesn't exist
    const rowsWithCampaign: (ImportRow & {
      excelRow: number;
      campaignId: number;
    })[] = [];
    for (const row of validRows) {
      const cid = campaignBySlug.get(row.campaignSlug);
      if (!cid) {
        errors.push({
          row: row.excelRow,
          message: `La campaña "${row.campaignSlug}" no existe o fue eliminada.`,
        });
        continue;
      }
      rowsWithCampaign.push({ ...row, campaignId: cid });
    }

    // ── 5. Group by (campaignId, employeeDocumentId) ───────
    const groupKey = (cid: number, doc: string) => `${cid}::${doc}`;
    const groups = new Map<
      string,
      {
        campaignId: number;
        documentId: string;
        employeeFullName: string;
        employeeEmail?: string;
        employeePhone?: string;
        shippingAddress?: string;
        shippingCity?: string;
        rows: (ImportRow & { excelRow: number; campaignId: number })[];
      }
    >();

    for (const row of rowsWithCampaign) {
      const key = groupKey(row.campaignId, row.employeeDocumentId);
      const existing = groups.get(key);
      if (existing) {
        existing.rows.push(row);
      } else {
        groups.set(key, {
          campaignId: row.campaignId,
          documentId: row.employeeDocumentId,
          employeeFullName: row.employeeFullName,
          employeeEmail: row.employeeEmail,
          employeePhone: row.employeePhone,
          shippingAddress: row.shippingAddress,
          shippingCity: row.shippingCity,
          rows: [row],
        });
      }
    }

    // ── 6. Process each employee group ─────────────────────
    let employeesCreated = 0;
    let employeesUpdated = 0;
    let beneficiariesCreated = 0;
    let skippedRows = 0;
    const warnings: ImportWarning[] = [];

    for (const [, group] of groups) {
      // Find employee by campaignId + documentId
      let employee = await this.prisma.employee.findUnique({
        where: {
          campaignId_documentId: {
            campaignId: group.campaignId,
            documentId: group.documentId,
          },
        },
      });

      if (employee) {
        if (employee.status === 'CONFIRMED') {
          // Skip all rows for this confirmed employee
          for (const r of group.rows) {
            warnings.push({
              row: r.excelRow,
              message:
                'El empleado ya estaba confirmado y no fue actualizado.',
            });
            skippedRows++;
          }
          continue;
        }

        // Update safe fields (only if different)
        const updateData: Record<string, unknown> = {};
        if (employee.fullName !== group.employeeFullName) {
          updateData.fullName = group.employeeFullName;
        }
        if (group.employeeEmail !== undefined) {
          const target = group.employeeEmail || null;
          if ((employee.email ?? null) !== target) {
            updateData.email = target;
          }
        }
        if (group.employeePhone !== undefined) {
          const target = group.employeePhone || null;
          if ((employee.phone ?? null) !== target) {
            updateData.phone = target;
          }
        }
        if (group.shippingAddress !== undefined) {
          const target = group.shippingAddress || null;
          if ((employee.shippingAddress ?? null) !== target) {
            updateData.shippingAddress = target;
          }
        }
        if (group.shippingCity !== undefined) {
          const target = group.shippingCity || null;
          if ((employee.shippingCity ?? null) !== target) {
            updateData.shippingCity = target;
          }
        }

        if (Object.keys(updateData).length > 0) {
          await this.prisma.employee.update({
            where: { id: employee.id },
            data: {
              ...updateData,
              updatedById: adminUserId,
            },
          });
          employeesUpdated++;
        }
      } else {
        // Create new employee
        employee = await this.prisma.employee.create({
          data: {
            campaignId: group.campaignId,
            documentId: group.documentId,
            fullName: group.employeeFullName,
            email: group.employeeEmail || null,
            phone: group.employeePhone || null,
            shippingAddress: group.shippingAddress || null,
            shippingCity: group.shippingCity || null,
            status: 'PENDING',
            createdById: adminUserId,
          },
        });
        employeesCreated++;
      }

      // ── Process beneficiaries for this employee ──────────
      // Fetch existing beneficiaries for duplicate check
      const existingBeneficiaries =
        await this.prisma.beneficiary.findMany({
          where: { employeeId: employee.id, deletedAt: null },
          select: { fullName: true, age: true, gender: true },
        });

      const existingSet = new Set(
        existingBeneficiaries.map(
          (b) => `${b.fullName}::${b.age}::${b.gender}`,
        ),
      );

      for (const row of group.rows) {
        const dupKey = `${row.beneficiaryFullName}::${row.beneficiaryAge}::${row.beneficiaryGender}`;
        if (existingSet.has(dupKey)) {
          warnings.push({
            row: row.excelRow,
            message: `El beneficiario "${row.beneficiaryFullName}" (${row.beneficiaryAge}, ${row.beneficiaryGender}) ya existe para este empleado.`,
          });
          skippedRows++;
          continue;
        }

        await this.prisma.beneficiary.create({
          data: {
            employeeId: employee.id,
            fullName: row.beneficiaryFullName,
            age: row.beneficiaryAge,
            gender: row.beneficiaryGender as 'male' | 'female',
            createdById: adminUserId,
          },
        });
        beneficiariesCreated++;
        existingSet.add(dupKey);
      }
    }

    return {
      totalRows: rawRows.length,
      employeesCreated,
      employeesUpdated,
      beneficiariesCreated,
      skippedRows,
      errors,
      warnings,
    };
  }
}
