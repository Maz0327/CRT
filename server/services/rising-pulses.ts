import { many, one } from "../lib/db";

export interface RisingPulseRecord {
  id: string;
  project_id: string;
  term: string;
  rationale: string | null;
  receipts: Array<{
    quote: string;
    url: string;
    source: string;
    timestamp: string;
  }>;
  confidence: number | null;
  surfaced_at: string;
}

export interface RisingPulseCreateInput {
  projectId: string;
  term: string;
  rationale?: string;
  receipts?: Array<{
    quote: string;
    url: string;
    source: string;
    timestamp: string;
  }>;
  confidence?: number;
}

export async function listRisingPulses(projectId: string): Promise<RisingPulseRecord[]> {
  // For now, return mock data until detection logic is added
  const mockPulses: RisingPulseRecord[] = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      project_id: projectId,
      term: 'AI Authenticity',
      rationale: 'Growing discussion around authentic vs AI-generated content across social platforms',
      receipts: [
        {
          quote: 'I prefer content that feels genuinely human',
          url: 'https://example.com/post1',
          source: 'Twitter',
          timestamp: '2025-09-04T10:00:00Z'
        },
        {
          quote: 'AI content is fine but label it please',
          url: 'https://example.com/post2',
          source: 'LinkedIn',
          timestamp: '2025-09-04T11:00:00Z'
        }
      ],
      confidence: 0.78,
      surfaced_at: '2025-09-04T12:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      project_id: projectId,
      term: 'Remote Work Fatigue',
      rationale: 'Increasing mentions of burnout and desire for hybrid work arrangements',
      receipts: [
        {
          quote: 'Need more in-person collaboration time',
          url: 'https://example.com/post3',
          source: 'Slack',
          timestamp: '2025-09-04T09:00:00Z'
        }
      ],
      confidence: 0.65,
      surfaced_at: '2025-09-04T11:30:00Z'
    }
  ];

  return mockPulses;
}

export async function getRisingPulse(id: string): Promise<RisingPulseRecord | null> {
  // For now, return mock data until detection logic is added
  const mockPulse: RisingPulseRecord = {
    id,
    project_id: 'mock-project-id',
    term: 'AI Authenticity',
    rationale: 'Growing discussion around authentic vs AI-generated content across social platforms. Users are expressing preferences for transparency and clear labeling of AI-generated content while still appreciating its utility.',
    receipts: [
      {
        quote: 'I prefer content that feels genuinely human, but AI tools are helpful for drafts',
        url: 'https://example.com/post1',
        source: 'Twitter',
        timestamp: '2025-09-04T10:00:00Z'
      },
      {
        quote: 'AI content is fine but label it please - transparency matters',
        url: 'https://example.com/post2',
        source: 'LinkedIn',
        timestamp: '2025-09-04T11:00:00Z'
      },
      {
        quote: 'The best AI content feels human but saves time',
        url: 'https://example.com/post3',
        source: 'Reddit',
        timestamp: '2025-09-04T12:00:00Z'
      }
    ],
    confidence: 0.78,
    surfaced_at: '2025-09-04T12:00:00Z'
  };

  return mockPulse;
}

export async function createRisingPulse(userId: string, input: RisingPulseCreateInput): Promise<RisingPulseRecord> {
  if (!input.projectId) throw new Error("projectId required");
  if (!input.term || input.term.length > 100) throw new Error("term required (<=100 chars)");
  if (input.rationale && input.rationale.length > 1000) throw new Error("rationale too long (<=1000 chars)");

  const row = await one<RisingPulseRecord>(
    `
    insert into public.rising_pulses (
      project_id, term, rationale, receipts, confidence
    )
    values (
      $1, $2, $3, $4, $5
    )
    returning *
    `,
    [
      input.projectId,
      input.term,
      input.rationale ?? null,
      JSON.stringify(input.receipts ?? []),
      input.confidence ?? null,
    ]
  );
  return row;
}