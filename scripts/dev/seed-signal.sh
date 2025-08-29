#!/usr/bin/env bash
set -euo pipefail
PROJECT_ID="${1:-test-project}"
curl -sS -X POST http://localhost:5001/api/signals \
  -H "Content-Type: application/json" \
  -d "{
    \"projectId\":\"$PROJECT_ID\",
    \"title\":\"Dupe economy fueling budget beauty\",
    \"summary\":\"Creators normalize dupes; dupe content outperforms brand ads across channels.\",
    \"truth_chain\":{
      \"fact\":\"Dupe video mentions up 120% YoY.\",
      \"observation\":\"Audiences share dupes as a flex.\",
      \"insight\":\"Value signaling > brand loyalty.\",
      \"human_truth\":\"People want to feel smart, not sold to.\",
      \"cultural_moment\":\"Dupe economy is mainstream behavior.\"
    },
    \"strategic_moves\":[\"Lean into comparisons\",\"Price + value framing\"],
    \"cohorts\":[\"Gen-Z Beauty Dupers\",\"Budget Seekers\"],
    \"receipts\":[
      {\"quote\":\"$8 dupe outperforming $42 product\",\"url\":\"https://example.com/a\",\"timestamp\":\"2025-08-26T00:00:00Z\",\"source\":\"YouTube\"},
      {\"quote\":\"Thread shows 300+ dupe comments\",\"url\":\"https://example.com/b\",\"timestamp\":\"2025-08-26T00:00:00Z\",\"source\":\"Reddit\"}
    ],
    \"confidence\":0.82,
    \"why_surfaced\":\"Seen in 3 projects this week\",
    \"origin\":\"upload\",
    \"source_tag\":\"Upload\"
  }" | jq '{id, status, receipts_count}'