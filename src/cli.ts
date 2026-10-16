import { readFileSync } from "fs";
import { InboundLeadTransformer } from "./pipeline";
import { RawInboundPayload } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parse and minimally validate a JSON array of lead payloads without exposing input values. */
export function parseLeadBatch(json: string): RawInboundPayload[] {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error("Input must be valid JSON.");
  }

  if (!Array.isArray(value)) {
    throw new Error("Input JSON must be an array of lead objects.");
  }

  return value.map((item, index) => {
    if (!isRecord(item)) {
      throw new Error(`Lead ${index + 1} must be an object.`);
    }

    for (const field of ["first_name", "last_name", "contact_email", "contact_phone"] as const) {
      if (item[field] !== undefined && typeof item[field] !== "string") {
        throw new Error(`Lead ${index + 1}: ${field} must be a string.`);
      }
    }
    for (const field of ["estimated_liquid_assets", "time_horizon_years"] as const) {
      if (item[field] !== undefined && typeof item[field] !== "string" && typeof item[field] !== "number") {
        throw new Error(`Lead ${index + 1}: ${field} must be a number or string.`);
      }
    }

    return item as RawInboundPayload;
  });
}

/** Return only an ordinal, score and tier; never print names or contact details. */
export function formatTierSummary(payloads: RawInboundPayload[]): string {
  if (payloads.length === 0) return "No leads found.";
  return payloads
    .map((payload, index) => {
      const lead = InboundLeadTransformer.processRecord(payload);
      return `Lead ${index + 1}: ${lead.priorityTier} (score ${lead.leadScore})`;
    })
    .join("\n");
}

export function main(args: string[] = process.argv.slice(2)): void {
  if (args.length !== 1) {
    console.error("Usage: npm run score-leads -- <input.json>");
    process.exitCode = 1;
    return;
  }

  let json: string;
  try {
    json = readFileSync(args[0], "utf8");
  } catch {
    console.error("Could not read input file.");
    process.exitCode = 1;
    return;
  }

  try {
    console.log(formatTierSummary(parseLeadBatch(json)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Could not process input file.");
    process.exitCode = 1;
  }
}

if (require.main === module) main();
