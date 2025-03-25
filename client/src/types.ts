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
  currentStreak: number;
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
  category: string;
  categoryColor: string;
  scores: MemberScores;
  metrics: MemberMetrics;
}

export interface KeyMetrics {
  totalMembers: number;
  newMembers: number;
  atRiskMembers: number;
  churnRate: number;
}

export interface CategoryDistribution {
  Advocate: number;
  'All Star': number;
  Average: number;
  'At Risk': number;
}

export interface DashboardData {
  members: Member[];
  keyMetrics: KeyMetrics;
  categoryDistribution: CategoryDistribution;
}
