import { InboundLeadTransformer as T } from "./src/pipeline";

describe("documented scoring rules", () => {
  it.each([
    { assets: 500000, expectedScore: 55 },
    { assets: 499999, expectedScore: 40 },
    { assets: 250000, expectedScore: 40 },
    { assets: 249999, expectedScore: 25 },
    { assets: 100000, expectedScore: 25 },
    { assets: 99999, expectedScore: 10 },
  ])("applies the documented asset band for $assets", ({ assets, expectedScore }) => {
    // A zero-year horizon contributes five points.
    expect(T.scoreLead(assets, 0).score).toBe(expectedScore);
  });

  it.each([
    { horizon: 1, expectedScore: 45 },
    { horizon: 3, expectedScore: 45 },
    { horizon: 4, expectedScore: 30 },
    { horizon: 7, expectedScore: 30 },
    { horizon: 8, expectedScore: 20 },
    { horizon: 15, expectedScore: 20 },
    { horizon: 16, expectedScore: 10 },
    { horizon: 0, expectedScore: 10 },
    { horizon: -1, expectedScore: 10 },
  ])("applies the documented time-horizon band for $horizon years", ({ horizon, expectedScore }) => {
    // Zero assets contribute five points.
    expect(T.scoreLead(0, horizon).score).toBe(expectedScore);
  });

  it.each([
    { assets: 24999, horizon: 1, expectedTier: "DISQUALIFIED" },
    { assets: 25000, horizon: 1, expectedTier: "TIER_2_STANDARD" },
    { assets: 250000, horizon: 1, expectedTier: "TIER_1_EXPEDITE" },
    { assets: 250000, horizon: 0, expectedTier: "TIER_3_NURTURE" },
  ])("applies tier precedence for $assets assets and $horizon years", ({ assets, horizon, expectedTier }) => {
    expect(T.scoreLead(assets, horizon).tier).toBe(expectedTier);
  });
});
