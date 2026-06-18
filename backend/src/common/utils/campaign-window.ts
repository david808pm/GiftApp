import { ForbiddenException } from '@nestjs/common';

/**
 * Enforces the campaign's selection window. A campaign may be ACTIVE but still
 * be outside its [startsAt, endsAt] range, in which case employees must not be
 * able to log in or confirm selections.
 */
export function assertCampaignWindowOpen(campaign: {
  startsAt: Date | null;
  endsAt: Date | null;
}): void {
  const now = new Date();
  if (campaign.startsAt && now < campaign.startsAt) {
    throw new ForbiddenException('La campaña aún no ha comenzado.');
  }
  if (campaign.endsAt && now > campaign.endsAt) {
    throw new ForbiddenException('El plazo de selección ha finalizado.');
  }
}
