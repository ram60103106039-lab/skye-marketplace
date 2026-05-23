import type { UserProfile } from './supabase';

const BACKEND_WEBHOOK_URL = 'YOUR_N8N_WEBHOOK_URL_HERE';

export type WebhookPayload = {
  event_type: 'CLIENT_REQUEST_DELEGATION';
  timestamp: string;
  user_profile: {
    user_id: string;
    role: string;
    location: string;
    max_walk_time_mins: number;
    payment_range: { min: number; max: number };
    skills_interests: string[];
  };
  request_details: {
    raw_message: string;
    extracted_topic: string;
    gig_type: 'post' | 'search';
    category: string;
    title: string;
    content: string;
    pay_min: number;
    pay_max: number;
    campus_location: string;
    is_remote: boolean;
    gig_id: string;
  };
};

export type WebhookMatch = {
  id: string;
  matched_user_name: string;
  matched_user_id: string;
  match_score: number;
  title: string;
  category: string;
  pay_min: number;
  pay_max: number;
  campus_location: string;
  walk_time_mins: number;
  description: string;
  match_reasons: string[];
};

export type MatchingStep = {
  label: string;
  detail: string;
  durationMs: number;
};

export type WebhookResponse = {
  success: boolean;
  matches: WebhookMatch[];
  matchingSteps?: MatchingStep[];
  message?: string;
};

export async function sendWebhookRequest(
  payload: WebhookPayload,
  signal?: AbortSignal
): Promise<WebhookResponse> {
  if (BACKEND_WEBHOOK_URL === 'YOUR_N8N_WEBHOOK_URL_HERE') {
    await new Promise((r) => setTimeout(r, 800));
    return generateMockMatches(payload);
  }

  const response = await fetch(BACKEND_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
  }

  return response.json() as Promise<WebhookResponse>;
}

export function buildWebhookPayload(
  profile: UserProfile,
  rawMessage: string,
  gigDetails: {
    gig_id: string;
    gig_type: 'post' | 'search';
    category: string;
    title: string;
    content: string;
    pay_min: number;
    pay_max: number;
    campus_location: string;
    is_remote: boolean;
    extracted_topic: string;
  }
): WebhookPayload {
  return {
    event_type: 'CLIENT_REQUEST_DELEGATION',
    timestamp: new Date().toISOString(),
    user_profile: {
      user_id: profile.user_id,
      role: profile.role,
      location: profile.campus_location,
      max_walk_time_mins: profile.max_walk_time_mins,
      payment_range: { min: profile.pay_min, max: profile.pay_max },
      skills_interests: profile.skills_interests,
    },
    request_details: {
      raw_message: rawMessage,
      extracted_topic: gigDetails.extracted_topic,
      gig_type: gigDetails.gig_type,
      category: gigDetails.category,
      title: gigDetails.title,
      content: gigDetails.content,
      pay_min: gigDetails.pay_min,
      pay_max: gigDetails.pay_max,
      campus_location: gigDetails.campus_location,
      is_remote: gigDetails.is_remote,
      gig_id: gigDetails.gig_id,
    },
  };
}

const MOCK_CANDIDATES: Array<{
  name: string;
  skills: string[];
  avatar: string;
  bio: string;
  rating: number;
  completedGigs: number;
}> = [
  {
    name: 'Alex Chen',
    skills: ['Tutoring & Academic Help', 'Tech Support & Repairs', 'Programming', 'Statistics'],
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    bio: 'CS junior, 4.0 GPA. Tutored 30+ students in calculus and Python.',
    rating: 4.9,
    completedGigs: 47,
  },
  {
    name: 'Jordan Smith',
    skills: ['Furniture Assembly & Moving', 'Cleaning & Organization', 'Event Help & Setup'],
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    bio: 'Athletic, reliable. Helped 20+ families move on campus.',
    rating: 4.8,
    completedGigs: 31,
  },
  {
    name: 'Maya Patel',
    skills: ['Photography & Videography', 'Graphic Design & Creative Work', 'Event Help & Setup'],
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    bio: 'Fine Arts junior with pro camera gear. Portraits, events, reels.',
    rating: 5.0,
    completedGigs: 62,
  },
  {
    name: 'Liam Torres',
    skills: ['Garage & Vehicle Maintenance', 'Tech Support & Repairs', 'Laundry & Errands'],
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    bio: 'Mechanical engineering student. Cars, bikes, and gadgets.',
    rating: 4.7,
    completedGigs: 28,
  },
  {
    name: 'Priya Rao',
    skills: ['Tutoring & Academic Help', 'Food & Grocery Runs', 'Pet Care', 'Laundry & Errands'],
    avatar: 'https://images.pexels.com/photos/1137511/pexels-photo-1137511.jpeg',
    bio: 'Pre-med, great with pets and people. Reliable and always on time.',
    rating: 4.9,
    completedGigs: 55,
  },
  {
    name: 'Sam Rivera',
    skills: ['Graphic Design & Creative Work', 'Photography & Videography', 'Web Development'],
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
    bio: 'Design/CS double major. Logos, sites, reels — all in 24h.',
    rating: 4.8,
    completedGigs: 39,
  },
  {
    name: 'Taylor Brooks',
    skills: ['Food & Grocery Runs', 'Event Help & Setup', 'Cleaning & Organization'],
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    bio: 'Hospitality major. Professional event staff and grocery runs.',
    rating: 4.6,
    completedGigs: 22,
  },
  {
    name: 'Devon Kim',
    skills: ['Tech Support & Repairs', 'Programming', 'Graphic Design & Creative Work'],
    avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    bio: 'Full-stack dev. Can fix your laptop, build your app, design your poster.',
    rating: 4.9,
    completedGigs: 71,
  },
];

const CAMPUS_LOCS = [
  'East Hall',
  'North Campus',
  'Student Union',
  'Main Library',
  'Engineering Quad',
  'South Dorms',
  'Science Complex',
  'Athletic Center',
];

function computeMatchScore(candidate: (typeof MOCK_CANDIDATES)[0], category: string): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 50;

  if (candidate.skills.includes(category)) {
    score += 30;
    reasons.push(`Exact skill match: ${category}`);
  } else if (candidate.skills.some((s) => s.toLowerCase().includes(category.split(' ')[0].toLowerCase()))) {
    score += 15;
    reasons.push('Partial skill overlap');
  }

  if (candidate.rating >= 4.9) {
    score += 8;
    reasons.push(`Top-rated (${candidate.rating} stars)`);
  } else if (candidate.rating >= 4.7) {
    score += 4;
    reasons.push(`Highly rated (${candidate.rating} stars)`);
  }

  if (candidate.completedGigs >= 50) {
    score += 7;
    reasons.push(`${candidate.completedGigs} gigs completed`);
  } else if (candidate.completedGigs >= 25) {
    score += 3;
    reasons.push(`${candidate.completedGigs} gigs completed`);
  }

  score += Math.floor(Math.random() * 6) - 2;

  return { score: Math.min(Math.max(score, 55), 99), reasons };
}

export const MATCHING_STEPS: MatchingStep[] = [
  { label: 'Parsing request semantics', detail: 'Extracting category, location & pay vectors', durationMs: 700 },
  { label: 'Scanning candidate pool', detail: 'Filtering 312 active campus workers by availability', durationMs: 900 },
  { label: 'Computing skill alignment', detail: 'Running weighted cosine similarity on skill tags', durationMs: 800 },
  { label: 'Applying proximity filter', detail: 'Ranking by walk time & campus zone', durationMs: 600 },
  { label: 'Scoring & ranking matches', detail: 'Finalising match scores with reputation weighting', durationMs: 700 },
];

function generateMockMatches(payload: WebhookPayload): WebhookResponse {
  const category = payload.request_details.category;
  const payMin = payload.request_details.pay_min || 15;
  const payMax = payload.request_details.pay_max || 50;

  const scored = MOCK_CANDIDATES.map((c, i) => {
    const { score, reasons } = computeMatchScore(c, category);
    return {
      id: crypto.randomUUID(),
      matched_user_name: c.name,
      matched_user_id: crypto.randomUUID(),
      match_score: score,
      title: payload.request_details.title || category,
      category,
      pay_min: payMin,
      pay_max: payMax,
      campus_location: CAMPUS_LOCS[i % CAMPUS_LOCS.length],
      walk_time_mins: Math.floor(Math.random() * 14) + 2,
      description: c.bio,
      match_reasons: reasons,
    };
  });

  scored.sort((a, b) => b.match_score - a.match_score);

  return {
    success: true,
    matches: scored.slice(0, 4),
    matchingSteps: MATCHING_STEPS,
  };
}

// Pre-seeded sample gigs for the Browse tab
export const SAMPLE_GIGS = [
  {
    id: 'sample-1',
    title: 'AP Calculus Tutor Needed',
    category: 'Tutoring & Academic Help',
    pay_min: 25,
    pay_max: 40,
    campus_location: 'Main Library',
    status: 'open' as const,
    type: 'post' as const,
    description: 'Need help with AP Calc BC before finals. 2hrs/week.',
    poster_name: 'Riley J.',
    walk_time_mins: 5,
  },
  {
    id: 'sample-2',
    title: 'Dorm Room Deep Clean',
    category: 'Cleaning & Organization',
    pay_min: 30,
    pay_max: 50,
    campus_location: 'South Dorms',
    status: 'open' as const,
    type: 'post' as const,
    description: 'Moving out at end of semester. Need full room clean & organized.',
    poster_name: 'Chris M.',
    walk_time_mins: 8,
  },
  {
    id: 'sample-3',
    title: 'IKEA Shelf Assembly',
    category: 'Furniture Assembly & Moving',
    pay_min: 20,
    pay_max: 35,
    campus_location: 'East Hall',
    status: 'open' as const,
    type: 'post' as const,
    description: 'KALLAX shelf, Billy bookcase — need assembly within 24hrs.',
    poster_name: 'Zara K.',
    walk_time_mins: 3,
  },
  {
    id: 'sample-4',
    title: 'Headshots for LinkedIn',
    category: 'Photography & Videography',
    pay_min: 40,
    pay_max: 60,
    campus_location: 'Engineering Quad',
    status: 'open' as const,
    type: 'post' as const,
    description: 'Professional headshots for LinkedIn & job apps. 1hr shoot + editing.',
    poster_name: 'Marcus T.',
    walk_time_mins: 10,
  },
  {
    id: 'sample-5',
    title: 'MacBook Won\'t Start',
    category: 'Tech Support & Repairs',
    pay_min: 20,
    pay_max: 45,
    campus_location: 'Student Union',
    status: 'open' as const,
    type: 'post' as const,
    description: 'MacBook Pro 2021 stuck on Apple logo. Need diagnosis + fix today.',
    poster_name: 'Aisha P.',
    walk_time_mins: 7,
  },
  {
    id: 'sample-6',
    title: 'Dog Walker — 3x/week',
    category: 'Pet Care',
    pay_min: 15,
    pay_max: 25,
    campus_location: 'North Campus',
    status: 'open' as const,
    type: 'post' as const,
    description: 'Golden Retriever, super friendly. 30 min walk, Mon/Wed/Fri.',
    poster_name: 'Finn O.',
    walk_time_mins: 12,
  },
  {
    id: 'sample-7',
    title: 'Event Decor Setup — Saturday',
    category: 'Event Help & Setup',
    pay_min: 18,
    pay_max: 28,
    campus_location: 'Athletic Center',
    status: 'open' as const,
    type: 'post' as const,
    description: 'Student org gala. Need 3hrs setup help, 5–8pm Saturday.',
    poster_name: 'Priya S.',
    walk_time_mins: 15,
  },
  {
    id: 'sample-8',
    title: 'Logo Design for Club',
    category: 'Graphic Design & Creative Work',
    pay_min: 35,
    pay_max: 70,
    campus_location: 'Remote',
    status: 'open' as const,
    type: 'post' as const,
    description: 'New robotics club needs logo + color palette. Files in SVG + PNG.',
    poster_name: 'Dana W.',
    walk_time_mins: 0,
  },
  {
    id: 'sample-9',
    title: 'Grocery Run — Trader Joe\'s',
    category: 'Food & Grocery Runs',
    pay_min: 12,
    pay_max: 20,
    campus_location: 'Science Complex',
    status: 'open' as const,
    type: 'post' as const,
    description: 'Need $80 grocery run + delivery to room 304. List provided.',
    poster_name: 'Jesse L.',
    walk_time_mins: 6,
  },
  {
    id: 'sample-10',
    title: 'Oil Change + Tire Check',
    category: 'Garage & Vehicle Maintenance',
    pay_min: 30,
    pay_max: 55,
    campus_location: 'North Campus Parking',
    status: 'open' as const,
    type: 'post' as const,
    description: '2019 Honda Civic. Bring your own tools, supplies covered.',
    poster_name: 'Noah B.',
    walk_time_mins: 9,
  },
];
