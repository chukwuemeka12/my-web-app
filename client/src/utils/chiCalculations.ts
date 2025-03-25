import { MemberMetrics, MemberScores } from '../types';

export function calculateRecencyScore(lastVisitDate: string): number {
  const today = new Date();
  const lastVisit = new Date(lastVisitDate);
  const daysSinceLastVisit = Math.floor((today.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastVisit <= 7) return 100;
  if (daysSinceLastVisit <= 30) return Math.max(0, 100 - ((daysSinceLastVisit - 7) * 2.5));
  if (daysSinceLastVisit <= 90) return Math.max(0, 50 - ((daysSinceLastVisit - 30) * 0.5));
  return 0;
}

export function calculateEngagementScore(metrics: MemberMetrics): number {
  const points = metrics.totalContributions + 
                (metrics.publishedPosts * 5) + 
                (metrics.comments * 3) +
                (metrics.cheers * 1) +
                (metrics.votes * 1) +
                (metrics.shares * 2);
                
  return Math.min(100, points / 5);
}

export function calculateConsumptionScore(metrics: MemberMetrics): number {
  const points = metrics.postClicks + 
                (metrics.lessonsStarted * 3) + 
                (metrics.lessonsCompleted * 5) +
                (metrics.coursesStarted * 10) +
                (metrics.coursesCompleted * 20);
                
  return Math.min(100, points / 5);
}

export function calculateParticipationScore(metrics: MemberMetrics): number {
  const points = (metrics.rsvps * 5) + 
                (metrics.messagesSent * 1) + 
                (metrics.comments * 2) +
                (metrics.cheers * 1);
                
  return Math.min(100, points / 2);
}

export function calculateStreakScore(currentStreak: number, maxStreak: number): number {
  const points = (currentStreak * 10) + (maxStreak * 5);
  return Math.min(100, points * 2);
}

export function calculateCHIScore(scores: MemberScores): number {
  return Math.round(
    (scores.recency * 0.35) + 
    (scores.engagement * 0.25) + 
    (scores.consumption * 0.20) + 
    (scores.participation * 0.15) + 
    (scores.streak * 0.05)
  );
}

export function determineCategory(chiScore: number): {
  category: 'Advocate' | 'All Star' | 'Average' | 'At-Risk';
  color: string;
} {
  if (chiScore >= 90) return { category: 'Advocate', color: '#8A2BE2' };
  if (chiScore >= 70) return { category: 'All Star', color: '#4CAF50' };
  if (chiScore >= 40) return { category: 'Average', color: '#FFC107' };
  return { category: 'At-Risk', color: '#F44336' };
}
