export interface MemberMetrics {
  postClicks: number;
  totalContributions: number;
  visits: number;
  publishedPosts: number;
  comments: number;
  cheers: number;
  votes: number;
  rsvps: number;
  shares: number;
  messagesSent: number;
  coursesStarted: number;
  coursesCompleted: number;
  lessonsStarted: number;
  lessonsCompleted: number;
}

export interface MemberScores {
  recency: number;
  engagement: number;
  consumption: number;
  participation: number;
  streak: number;
}

export interface Member {
  name: string;
  role: string;
  joinDate: string;
  lastVisit: string;
  currentStreak: number;
  maxStreak: number;
  chiScore: number;
  category: 'Advocate' | 'All Star' | 'Average' | 'At-Risk';
  categoryColor: string;
  scores: MemberScores;
  metrics: MemberMetrics;
}

export interface DashboardData {
  keyMetrics: {
    name: string;
    value: number;
  }[];
  categoryDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  members: Member[];
}

export const CategoryColors = {
  Advocate: '#8A2BE2',
  'All Star': '#4CAF50',
  Average: '#FFC107',
  'At-Risk': '#F44336',
} as const;
