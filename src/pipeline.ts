import { RawInboundPayload, NormalizedLead, PriorityTier } from "./types";
import { randomUUID } from "crypto";

export class InboundLeadTransformer {
  /** Normalizes US phone numbers to E.164. Returns "" when the number is not a valid US number. */
  public static normalizePhone(rawPhone?: string): string {
    if (!rawPhone) return "";
    const digits = rawPhone.replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return "";
  }

  /** Trims, lowercases and validates an email. Returns "" when invalid. */
  public static normalizeEmail(rawEmail?: string): string {
    if (!rawEmail) return "";
    const cleaned = rawEmail.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned) ? cleaned : "";
  }

  /** Rule-based score (0-100) from asset size and time horizon. */
  public static scoreLead(assets: number, horizon: number): { score: number; tier: PriorityTier } {
    let score = 0;
    if (assets >= 500000) score += 50;
    else if (assets >= 250000) score += 35;
    else if (assets >= 100000) score += 20;
    else score += 5;

    if (horizon > 0 && horizon <= 3) score += 40;
    else if (horizon > 3 && horizon <= 7) score += 25;
    else if (horizon > 7 && horizon <= 15) score += 15;
    else score += 5;

    let tier: PriorityTier = "TIER_3_NURTURE";
    if (assets < 25000) tier = "DISQUALIFIED";
    else if (score >= 75) tier = "TIER_1_EXPEDITE";
    else if (score >= 45) tier = "TIER_2_STANDARD";
    return { score, tier };
  }

  public static processRecord(payload: RawInboundPayload): NormalizedLead {
    const assets =
      typeof payload.estimated_liquid_assets === "string"
        ? parseFloat(payload.estimated_liquid_assets.replace(/[^0-9.-]+/g, "")) || 0
        : payload.estimated_liquid_assets || 0;
    const horizon =
      typeof payload.time_horizon_years === "string"
        ? parseInt(payload.time_horizon_years, 10) || 0
        : payload.time_horizon_years || 0;

    const { score, tier } = this.scoreLead(assets, horizon);
    const fullName = `${(payload.first_name || "").trim()} ${(payload.last_name || "").trim()}`.trim();
    return {
      id: randomUUID(),
      fullName: fullName || "Anonymous Lead",
      email: this.normalizeEmail(payload.contact_email),
      phoneE164: this.normalizePhone(payload.contact_phone),
      liquidAssets: assets,
      timeHorizon: horizon,
      leadScore: score,
      priorityTier: tier,
      processedAt: new Date().toISOString(),
    };
  }
}
