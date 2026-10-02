import { InboundLeadTransformer as T } from "../src/pipeline";

describe("InboundLeadTransformer", () => {
  test("normalizes 10-digit US phone numbers", () => {
    expect(T.normalizePhone("(813) 555-0199")).toBe("+18135550199");
  });
  test("normalizes 11-digit numbers starting with 1", () => {
    expect(T.normalizePhone("1-813-555-0199")).toBe("+18135550199");
  });
  test("rejects numbers that are not valid US numbers", () => {
    expect(T.normalizePhone("12345")).toBe("");
    expect(T.normalizePhone(undefined)).toBe("");
  });
  test("normalizes and validates email", () => {
    expect(T.normalizeEmail("  JANE.DOE@Example.com ")).toBe("jane.doe@example.com");
    expect(T.normalizeEmail("not-an-email")).toBe("");
  });
  test("high assets and near-term horizon is TIER_1_EXPEDITE", () => {
    const lead = T.processRecord({
      first_name: "Jane", last_name: "Doe", contact_email: "JANE.DOE@example.com",
      contact_phone: "813-555-0123", estimated_liquid_assets: "$350,000", time_horizon_years: 2,
    });
    expect(lead.email).toBe("jane.doe@example.com");
    expect(lead.phoneE164).toBe("+18135550123");
    expect(lead.leadScore).toBe(75);
    expect(lead.priorityTier).toBe("TIER_1_EXPEDITE");
  });
  test("tiny assets are DISQUALIFIED regardless of score", () => {
    const lead = T.processRecord({ estimated_liquid_assets: 10000, time_horizon_years: 1 });
    expect(lead.priorityTier).toBe("DISQUALIFIED");
  });
  test("mid assets and long horizon is nurture", () => {
    const lead = T.processRecord({ estimated_liquid_assets: 50000, time_horizon_years: 25 });
    expect(lead.priorityTier).toBe("TIER_3_NURTURE");
  });
  test("handles missing name", () => {
    expect(T.processRecord({}).fullName).toBe("Anonymous Lead");
  });
});
