import { formatTierSummary, parseLeadBatch } from "../src/cli";

const demoLead = {
  first_name: "Jane",
  last_name: "Doe",
  contact_email: "jane.doe@example.com",
  contact_phone: "555-0101",
  estimated_liquid_assets: "350k",
  time_horizon_years: 2,
};

describe("lead scoring CLI helpers", () => {
  test("parses a JSON array of lead payloads", () => {
    expect(parseLeadBatch(JSON.stringify([demoLead]))).toEqual([demoLead]);
  });

  test("rejects invalid JSON, a non-array root, and non-object entries", () => {
    expect(() => parseLeadBatch("{" )).toThrow("Input must be valid JSON.");
    expect(() => parseLeadBatch(JSON.stringify(demoLead))).toThrow("array of lead objects");
    expect(() => parseLeadBatch(JSON.stringify([null]))).toThrow("Lead 1 must be an object");
  });

  test("rejects values with invalid field types", () => {
    expect(() => parseLeadBatch(JSON.stringify([{ contact_email: 42 }]))).toThrow("contact_email must be a string");
    expect(() => parseLeadBatch(JSON.stringify([{ estimated_liquid_assets: {} }]))).toThrow("estimated_liquid_assets must be a number or string");
  });

  test("prints tier and score without names or contact details", () => {
    const output = formatTierSummary([demoLead]);
    expect(output).toBe("Lead 1: TIER_1_EXPEDITE (score 75)");
    expect(output).not.toContain("Jane");
    expect(output).not.toContain("example.com");
    expect(output).not.toContain("555-0101");
  });

  test("reports an empty batch clearly", () => {
    expect(formatTierSummary([])).toBe("No leads found.");
  });
});
