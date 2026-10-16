# Lead Pipeline Orchestrator (demo)

A small TypeScript module that takes a messy inbound lead payload (like a web form or webhook) and turns it into a clean, scored record ready for a CRM queue.

## What it does
- Normalizes US phone numbers to E.164 (`+18135550199`), and returns empty for anything that is not a valid US number instead of guessing
- Trims, lowercases and validates emails
- Parses assets and time horizon from numbers or strings like `"$350,000"`
- Scores each lead from 0 to 100 with transparent rules and assigns a priority tier (`TIER_1_EXPEDITE`, `TIER_2_STANDARD`, `TIER_3_NURTURE`, `DISQUALIFIED`)

## Run it
```
npm install
npm test
```

To score a JSON file containing an array of lead payloads:

```sh
npm run score-leads -- leads.json
```

Example `leads.json` (fake demo data):

```json
[
  {
    "first_name": "Jane",
    "last_name": "Doe",
    "contact_email": "jane.doe@example.com",
    "contact_phone": "555-0101",
    "estimated_liquid_assets": "350k",
    "time_horizon_years": 2
  }
]
```

The CLI prints only each row's tier and score, not names or contact details. The input is processed locally and is not uploaded.

## Notes
- A demo built to show the pattern: validate at the boundary, keep rules readable, test the edge cases. Thresholds are examples, not tuned on real data.
- No real leads, clients, or credentials are in this repo.
