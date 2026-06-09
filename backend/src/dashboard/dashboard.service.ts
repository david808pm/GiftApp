import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(user?: { role: string; companyId?: number }) {
    // Build base filters for company scoping
    const campaignFilter: Prisma.CampaignWhereInput = { deletedAt: null };
    const employeeFilter: Prisma.EmployeeWhereInput = { deletedAt: null };
    const beneficiaryFilter: Prisma.BeneficiaryWhereInput = { deletedAt: null };
    const giftFilter: Prisma.GiftWhereInput = { deletedAt: null };
    const supportFilter: Prisma.SupportRequestWhereInput = {};
    const selectionFilter: Prisma.SelectionWhereInput = {};

    // Apply company scoping for COMPANY_VIEWER
    if (user?.role === 'COMPANY_VIEWER') {
      if (!user.companyId) {
        throw new ForbiddenException('No tienes compañía asignada.');
      }
      campaignFilter.companyId = user.companyId;
      employeeFilter.campaign = { companyId: user.companyId };
      beneficiaryFilter.employee = { campaign: { companyId: user.companyId } };
      giftFilter.campaign = { companyId: user.companyId };
      supportFilter.campaign = { companyId: user.companyId };
      selectionFilter.campaign = { companyId: user.companyId };
    }

    const [
      campaignsAll,
      activeCampaigns,
      closedCampaigns,
      employeesAll,
      pendingEmployees,
      inProgressEmployees,
      confirmedEmployees,
      blockedEmployees,
      beneficiariesAll,
      giftsAll,
      activeGifts,
      inactiveGifts,
      stockSum,
      supportAll,
      openSupport,
      inReviewSupport,
      resolvedSupport,
      confirmedSelections,
      cancelledSelections,
    ] = await Promise.all([
      this.prisma.campaign.count({ where: campaignFilter }),
      this.prisma.campaign.count({ where: { ...campaignFilter, status: 'ACTIVE' } }),
      this.prisma.campaign.count({
        where: {
          ...campaignFilter,
          status: { in: ['CLOSED', 'ARCHIVED', 'PAUSED'] },
        },
      }),
      this.prisma.employee.count({ where: employeeFilter }),
      this.prisma.employee.count({ where: { ...employeeFilter, status: 'PENDING' } }),
      this.prisma.employee.count({ where: { ...employeeFilter, status: 'IN_PROGRESS' } }),
      this.prisma.employee.count({ where: { ...employeeFilter, status: 'CONFIRMED' } }),
      this.prisma.employee.count({ where: { ...employeeFilter, status: 'BLOCKED' } }),
      this.prisma.beneficiary.count({ where: beneficiaryFilter }),
      this.prisma.gift.count({ where: giftFilter }),
      this.prisma.gift.count({ where: { ...giftFilter, status: 'ACTIVE' } }),
      this.prisma.gift.count({ where: { ...giftFilter, status: 'INACTIVE' } }),
      this.prisma.gift.aggregate({
        where: giftFilter,
        _sum: { stock: true },
      }),
      this.prisma.supportRequest.count({ where: supportFilter }),
      this.prisma.supportRequest.count({ where: { ...supportFilter, status: 'OPEN' } }),
      this.prisma.supportRequest.count({ where: { ...supportFilter, status: 'IN_REVIEW' } }),
      this.prisma.supportRequest.count({ where: { ...supportFilter, status: 'RESOLVED' } }),
      this.prisma.selection.count({ where: { ...selectionFilter, status: 'CONFIRMED' } }),
      this.prisma.selection.count({ where: { ...selectionFilter, status: 'CANCELLED' } }),
    ]);

    return {
      campaigns: campaignsAll,
      activeCampaigns,
      closedCampaigns,
      employees: employeesAll,
      pendingEmployees,
      inProgressEmployees,
      confirmedEmployees,
      blockedEmployees,
      beneficiaries: beneficiariesAll,
      gifts: giftsAll,
      activeGifts,
      inactiveGifts,
      stock: stockSum._sum.stock || 0,
      supportRequests: supportAll,
      openSupportRequests: openSupport,
      inReviewSupportRequests: inReviewSupport,
      resolvedSupportRequests: resolvedSupport,
      selections: confirmedSelections,
      cancelledSelections,
    };
  }
}
