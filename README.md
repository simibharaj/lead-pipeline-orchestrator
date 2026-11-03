# Lead Pipeline Orchestrator (demo)

A small TypeScript module that takes a messy inbound lead payload (like a web form or webhook) and turns it into a clean, scored record ready for a CRM queue.

## What it does
- Normalizes US phone numbers to E.164 (`+18135550199`), and returns empty for anything that is not a valid US number instead of guessing
- Trims, lowercases and validates emails
- Parses assets and time horizon from numbers or strings like `"$350,000"`
- Scores each lead from 0 to 100 with transparent rules and assigns a priority tier (`TIER_1_EXPEDITE`, `TIER_2_STANDARD`, `TIER_3_NURTURE`, `DISQUALIFIED`)

## Scoring rules

The demo score adds one asset contribution and one time-horizon contribution. These example weights are transparent demo rules, not tuned on real data.

| Liquid assets | Points |
| --- | ---: |
| $500,000 or more | 50 |
| $250,000 to under $500,000 | 35 |
| $100,000 to under $250,000 | 20 |
| Under $100,000 | 5 |

| Time horizon | Points |
| --- | ---: |
| More than 0 through 3 years | 40 |
| More than 3 through 7 years | 25 |
| More than 7 through 15 years | 15 |
| 0 or less, or more than 15 years | 5 |

The tier is chosen after adding those points, with this precedence:

1. Liquid assets under $25,000: `DISQUALIFIED`, regardless of score.
2. Score of 75 or more: `TIER_1_EXPEDITE`.
3. Score of 45 or more: `TIER_2_STANDARD`.
4. Otherwise: `TIER_3_NURTURE`.

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
