import { InboundLeadTransformer as T } from "./pipeline";

describe("fractional time horizons", () => {
  test("scores decimal strings the same as equivalent numeric values", () => {
    const stringValue = T.processRecord({ estimated_liquid_assets: 100000, time_horizon_years: "0.5" });
    const numberValue = T.processRecord({ estimated_liquid_assets: 100000, time_horizon_years: 0.5 });

    expect(stringValue.timeHorizon).toBe(0.5);
    expect(stringValue.leadScore).toBe(numberValue.leadScore);
    expect(stringValue.priorityTier).toBe(numberValue.priorityTier);
  });
});
