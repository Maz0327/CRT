import { Project, Capture, Moment, Brief, BriefDetail, Feed, User } from '../types/dto';

export const sampleUser: User = {
  id: 'user-1',
  email: 'strategist@example.com',
  name: 'Alex Chen',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
};

export const sampleProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Q1 Fashion Trends',
    description: 'Analyzing emerging fashion trends for spring collection',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 'proj-2',
    name: 'Gen Z Social Behavior',
    description: 'Understanding Gen Z engagement patterns across platforms',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
];

export const sampleCaptures: Capture[] = [
  {
    id: 'cap-1',
    projectId: 'proj-1',
    userId: 'user-1',
    title: 'Sustainable Fashion Movement on TikTok',
    content: 'Young creators showcasing thrift finds and upcycling techniques',
    platform: 'tiktok',
    url: 'https://tiktok.com/@sustainablestyle/video/123',
    tags: ['sustainability', 'fashion', 'genz', 'thrifting'],
    status: 'new',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
  },
  {
    id: 'cap-2',
    projectId: 'proj-1',
    userId: 'user-1',
    title: 'AI-Generated Fashion Design Tools',
    content: 'New tools enabling rapid prototyping of fashion items',
    platform: 'twitter',
    url: 'https://twitter.com/fashiontech/status/456',
    tags: ['ai', 'fashion', 'design', 'tools'],
    status: 'keep',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    createdAt: '2024-01-19T14:20:00Z',
    updatedAt: '2024-01-19T14:20:00Z',
  },
  {
    id: 'cap-3',
    projectId: 'proj-2',
    userId: 'user-1',
    title: 'BeReal Authenticity Trend',
    content: 'Gen Z preferring unfiltered, authentic social content',
    platform: 'instagram',
    url: 'https://instagram.com/p/authentic-content',
    tags: ['authenticity', 'genz', 'social', 'bereal'],
    status: 'keep',
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=300&fit=crop',
    createdAt: '2024-01-18T16:45:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
  },
];

export const sampleMoments: Moment[] = [
  {
    id: 'mom-1',
    title: 'Sustainable Fashion Movement',
    description: 'Growing awareness and adoption of sustainable fashion practices',
    intensity: 78,
    tags: ['sustainability', 'fashion', 'environment'],
    platforms: ['tiktok', 'instagram', 'youtube'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
  },
  {
    id: 'mom-2',
    title: 'AI Creative Tools Adoption',
    description: 'Rapid adoption of AI tools in creative workflows',
    intensity: 65,
    tags: ['ai', 'creativity', 'tools', 'productivity'],
    platforms: ['twitter', 'linkedin', 'youtube'],
    createdAt: '2024-01-12T00:00:00Z',
    updatedAt: '2024-01-19T15:30:00Z',
  },
];

export const sampleBriefs: Brief[] = [
  {
    id: 'brief-1',
    projectId: 'proj-1',
    title: 'Sustainable Fashion Strategy Brief',
    status: 'draft',
    tags: ['sustainability', 'fashion', 'strategy'],
    slideCount: 5,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-20T11:30:00Z',
  },
  {
    id: 'brief-2',
    projectId: 'proj-2',
    title: 'Gen Z Engagement Playbook',
    status: 'in_review',
    tags: ['genz', 'engagement', 'social'],
    slideCount: 8,
    createdAt: '2024-01-16T14:00:00Z',
    updatedAt: '2024-01-19T16:20:00Z',
  },
];

export const sampleBriefDetail: BriefDetail = {
  ...sampleBriefs[0],
  slides: [
    {
      id: 'slide-1',
      title: 'Executive Summary',
      blocks: [
        {
          id: 'block-1',
          type: 'text',
          x: 100,
          y: 100,
          w: 600,
          h: 80,
          text: 'Sustainable Fashion: The New Consumer Imperative',
          align: 'center',
          fontSize: 32,
          weight: 600,
        },
        {
          id: 'block-2',
          type: 'text',
          x: 100,
          y: 200,
          w: 600,
          h: 120,
          text: 'Gen Z consumers are driving a fundamental shift toward sustainable fashion practices, with 73% willing to pay more for sustainable products.',
          align: 'left',
          fontSize: 18,
          weight: 400,
        },
      ],
      captureRefs: ['cap-1'],
    },
    {
      id: 'slide-2',
      title: 'Key Insights',
      blocks: [
        {
          id: 'block-3',
          type: 'text',
          x: 50,
          y: 50,
          w: 300,
          h: 400,
          text: '• Thrifting is mainstream\n• Upcycling as creative expression\n• Transparency in supply chain\n• Quality over quantity mindset',
          align: 'left',
          fontSize: 16,
          weight: 400,
        },
        {
          id: 'block-4',
          type: 'image',
          x: 400,
          y: 50,
          w: 300,
          h: 200,
          src: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300&h=200&fit=crop',
          alt: 'Sustainable fashion example',
          sourceCaptureId: 'cap-1',
        },
        {
          id: 'block-5',
          type: 'note',
          x: 400,
          y: 270,
          w: 200,
          h: 100,
          text: 'Consider partnering with thrift influencers',
        },
      ],
      captureRefs: ['cap-1', 'cap-2'],
    },
  ],
};

export const sampleFeeds: Feed[] = [
  {
    id: 'feed-1',
    userId: 'user-1',
    projectId: 'proj-1',
    feedUrl: 'https://www.vogue.com/rss',
    title: 'Vogue Fashion News',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'feed-2',
    userId: 'user-1',
    projectId: 'proj-2',
    feedUrl: 'https://techcrunch.com/feed/',
    title: 'TechCrunch',
    isActive: false,
    createdAt: '2024-01-12T15:30:00Z',
    updatedAt: '2024-01-18T09:15:00Z',
  },
];

// Feature flag for using fixtures - set to true for development without backend
export const USE_FIXTURES = true;