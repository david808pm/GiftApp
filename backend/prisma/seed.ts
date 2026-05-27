import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ── Role: ADMIN ────────────────────────────────────────────
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador general de GiftApp. Acceso completo.',
    },
  });
  console.log(`✅ Role created: ${adminRole.name}`);

  // ── Role: SUPER_ADMIN (future use) ─────────────────────────
  await prisma.role.upsert({
    where: { name: 'SUPER_ADMIN' },
    update: {},
    create: {
      name: 'SUPER_ADMIN',
      description: 'Super administrador. Acceso total y gestión de admins.',
    },
  });
  console.log('✅ Role created: SUPER_ADMIN');

  // ── Admin User ─────────────────────────────────────────────
  const seedEmail = process.env.ADMIN_SEED_EMAIL || 'admin@giftapp.com';
  const seedPassword = process.env.ADMIN_SEED_PASSWORD || 'Admin123!';
  const hashedPassword = await bcrypt.hash(seedPassword, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: seedEmail },
    update: {},
    create: {
      name: 'Admin Demo',
      email: seedEmail,
      password: hashedPassword,
      roleId: adminRole.id,
      isActive: true,
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // ── Example employee with shipping fields (uncomment to seed) ──
  // const exampleCampaign = await prisma.campaign.findFirst({ where: { deletedAt: null } });
  // if (exampleCampaign) {
  //   await prisma.employee.upsert({
  //     where: { campaignId_documentId: { campaignId: exampleCampaign.id, documentId: '12345678' } },
  //     update: {},
  //     create: {
  //       campaignId: exampleCampaign.id,
  //       fullName: 'Juan Pérez',
  //       documentId: '12345678',
  //       email: 'juan@example.com',
  //       phone: '+58 414-1234567',
  //       shippingAddress: 'Av. Principal, Edif. Centro, Piso 3',
  //       shippingCity: 'Caracas',
  //       status: 'PENDING',
  //     },
  //   });
  //   console.log('✅ Example employee with shipping fields seeded.');
  // }

  console.log('\n🎉 Seed completed.\n');
  console.log('   Login credentials:');
  console.log(`   Email:    ${seedEmail}`);
  console.log(`   Password: ${seedPassword}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
