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

  /**
   * Parses an asset amount. Accepts numbers or strings such as "$250,000", "250k", "1.5m".
   * A trailing k/m multiplies by 1,000 / 1,000,000. Unparseable or negative input returns 0.
   */
  public static parseAssets(raw?: number | string): number {
    if (typeof raw === "number") return Number.isFinite(raw) && raw > 0 ? raw : 0;
    if (!raw) return 0;
    const match = raw.trim().toLowerCase().match(/^\$?\s*([0-9][0-9,]*\.?[0-9]*|\.[0-9]+)\s*([km])?$/);
    if (!match) return 0;
    const base = parseFloat(match[1].replace(/,/g, ""));
    if (Number.isNaN(base)) return 0;
    const mult = match[2] === "k" ? 1_000 : match[2] === "m" ? 1_000_000 : 1;
    return base * mult;
  }

  public static processRecord(payload: RawInboundPayload): NormalizedLead {
    const assets = this.parseAssets(payload.estimated_liquid_assets);
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
