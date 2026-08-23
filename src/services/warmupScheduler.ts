import { AutomatedWarmupPlan, WarmupDaySchedule, WarmupPaceStrategy } from '../types';

/**
 * Generates an RFC-compliant, ISP-optimized exponential warmup curve for dedicated IPs and sending domains.
 */
export function generateWarmupSchedule(
  totalDays: number = 30,
  startingVolume: number = 500,
  targetVolume: number = 250000,
  strategy: WarmupPaceStrategy = 'balanced_30d',
  currentDay: number = 1
): WarmupDaySchedule[] {
  const schedule: WarmupDaySchedule[] = [];
  const now = new Date();

  // Exponential growth factor: targetVolume = startingVolume * (r ^ (totalDays - 1))
  const growthFactor = Math.pow(targetVolume / Math.max(1, startingVolume), 1 / Math.max(1, totalDays - 1));

  for (let day = 1; day <= totalDays; day++) {
    const dateObj = new Date(now);
    dateObj.setDate(dateObj.getDate() + (day - currentDay));
    const dateStr = dateObj.toISOString().split('T')[0];

    let limit = Math.round(startingVolume * Math.pow(growthFactor, day - 1));

    // Round neatly to human-friendly delivery increments
    if (limit > 10000) {
      limit = Math.round(limit / 1000) * 1000;
    } else if (limit > 1000) {
      limit = Math.round(limit / 500) * 500;
    } else if (limit > 100) {
      limit = Math.round(limit / 50) * 50;
    }

    const hourlySpeedLimit = Math.max(50, Math.round(limit / 8)); // 8-hour distribution window

    let status: WarmupDaySchedule['status'] = 'upcoming';
    let actualSent = 0;
    let bounceRate = 0.2;
    let complaintRate = 0.01;
    let deliverySuccessRate = 99.8;

    if (day < currentDay) {
      status = 'completed';
      actualSent = Math.round(limit * (0.92 + Math.random() * 0.07));
      bounceRate = +(0.15 + Math.random() * 0.4).toFixed(2);
      complaintRate = +(0.005 + Math.random() * 0.015).toFixed(3);
      deliverySuccessRate = +(100 - bounceRate - complaintRate).toFixed(2);
    } else if (day === currentDay) {
      status = 'active';
      actualSent = Math.round(limit * 0.68);
      bounceRate = 0.22;
      complaintRate = 0.008;
      deliverySuccessRate = 99.7;
    }

    // ISP Distribution ratios (Standard enterprise B2C/B2B blended mix)
    const ispAllocations = {
      gmail: Math.round(limit * 0.45),
      microsoft: Math.round(limit * 0.28),
      yahoo: Math.round(limit * 0.15),
      icloud: Math.round(limit * 0.07),
      corporate: Math.round(limit * 0.05),
    };

    schedule.push({
      dayNumber: day,
      date: dateStr,
      dailyLimit: limit,
      hourlySpeedLimit,
      actualSent,
      deliverySuccessRate,
      bounceRate,
      complaintRate,
      status,
      ispAllocations,
    });
  }

  return schedule;
}

export const INITIAL_WARMUP_PLANS: AutomatedWarmupPlan[] = [
  {
    id: 'plan_corp_aethermail',
    name: 'Corporate Primary IP Ramp',
    targetDomain: 'mail.aethermail.net',
    ipPoolId: 'pool_corp',
    ipAddresses: ['198.51.100.41', '198.51.100.42', '198.51.100.43'],
    strategy: 'balanced_30d',
    totalDays: 30,
    currentDay: 19,
    startDate: '2026-08-04T00:00:00Z',
    targetDailyVolume: 250000,
    startingDailyVolume: 500,
    autoThrottleOnBounce: true,
    maxBounceThresholdPercent: 2.0,
    autoPauseOnSpam: true,
    status: 'running',
    overallReputationScore: 98,
    createdAt: '2026-08-04T00:00:00Z',
    updatedAt: '2026-08-23T00:00:00Z',
    schedule: generateWarmupSchedule(30, 500, 250000, 'balanced_30d', 19),
  },
  {
    id: 'plan_marketing_cluster',
    name: 'Promotional Dedicated Cluster Ramp',
    targetDomain: 'news.aethermail.net',
    ipPoolId: 'pool_marketing',
    ipAddresses: ['198.51.100.88', '198.51.100.89'],
    strategy: 'conservative_45d',
    totalDays: 45,
    currentDay: 12,
    startDate: '2026-08-11T00:00:00Z',
    targetDailyVolume: 500000,
    startingDailyVolume: 250,
    autoThrottleOnBounce: true,
    maxBounceThresholdPercent: 1.5,
    autoPauseOnSpam: true,
    status: 'running',
    overallReputationScore: 94,
    createdAt: '2026-08-11T00:00:00Z',
    updatedAt: '2026-08-23T00:00:00Z',
    schedule: generateWarmupSchedule(45, 250, 500000, 'conservative_45d', 12),
  },
];
