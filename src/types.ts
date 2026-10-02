export interface RawInboundPayload {
  first_name?: string;
  last_name?: string;
  contact_email?: string;
  contact_phone?: string;
  estimated_liquid_assets?: number | string;
  time_horizon_years?: number | string;
  risk_tolerance_raw?: string;
  source_channel?: string;
  metadata?: Record<string, unknown>;
}

export type PriorityTier = "TIER_1_EXPEDITE" | "TIER_2_STANDARD" | "TIER_3_NURTURE" | "DISQUALIFIED";

export interface NormalizedLead {
  id: string;
  fullName: string;
  email: string;
  phoneE164: string;
  liquidAssets: number;
  timeHorizon: number;
  priorityTier: PriorityTier;
  leadScore: number;
  processedAt: string;
}
