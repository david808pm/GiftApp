import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
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
      this.prisma.campaign.count({ where: { deletedAt: null } }),
      this.prisma.campaign.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      this.prisma.campaign.count({
        where: {
          deletedAt: null,
          status: { in: ['CLOSED', 'ARCHIVED', 'PAUSED'] },
        },
      }),
      this.prisma.employee.count({ where: { deletedAt: null } }),
      this.prisma.employee.count({ where: { deletedAt: null, status: 'PENDING' } }),
      this.prisma.employee.count({ where: { deletedAt: null, status: 'IN_PROGRESS' } }),
      this.prisma.employee.count({ where: { deletedAt: null, status: 'CONFIRMED' } }),
      this.prisma.employee.count({ where: { deletedAt: null, status: 'BLOCKED' } }),
      this.prisma.beneficiary.count({ where: { deletedAt: null } }),
      this.prisma.gift.count({ where: { deletedAt: null } }),
      this.prisma.gift.count({ where: { deletedAt: null, status: 'ACTIVE' } }),
      this.prisma.gift.count({ where: { deletedAt: null, status: 'INACTIVE' } }),
      this.prisma.gift.aggregate({
        where: { deletedAt: null },
        _sum: { stock: true },
      }),
      this.prisma.supportRequest.count(),
      this.prisma.supportRequest.count({ where: { status: 'OPEN' } }),
      this.prisma.supportRequest.count({ where: { status: 'IN_REVIEW' } }),
      this.prisma.supportRequest.count({ where: { status: 'RESOLVED' } }),
      this.prisma.selection.count({ where: { status: 'CONFIRMED' } }),
      this.prisma.selection.count({ where: { status: 'CANCELLED' } }),
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
