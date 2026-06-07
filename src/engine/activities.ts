import type { Activity } from '@/types'

export const ACTIVITIES: Activity[] = [
  {
    id: 'lottery',
    name: '幸运抽奖',
    description: '经典抽签活动，概率中等，奖励稳定',
    baseProbability: 0.6,
    baseReward: 100,
    riskLevel: 1,
    category: 'normal',
    icon: '🎰'
  },
  {
    id: 'jackpot',
    name: '大奖池',
    description: '高风险高回报，中奖率低但奖励丰厚',
    baseProbability: 0.25,
    baseReward: 350,
    riskLevel: 3,
    category: 'rare',
    icon: '💎'
  },
  {
    id: 'wheel',
    name: '幸运转盘',
    description: '热门项目，人多拥挤但奖励不错',
    baseProbability: 0.5,
    baseReward: 150,
    riskLevel: 2,
    category: 'popular',
    icon: '🎯'
  },
  {
    id: 'scratch',
    name: '刮刮乐',
    description: '小额高频，几乎不会空手而归',
    baseProbability: 0.85,
    baseReward: 60,
    riskLevel: 1,
    category: 'normal',
    icon: '🎫'
  },
  {
    id: 'race',
    name: '竞速挑战',
    description: '热门竞技项目，排队时间长',
    baseProbability: 0.45,
    baseReward: 200,
    riskLevel: 2,
    category: 'popular',
    icon: '🏎️'
  },
  {
    id: 'mystery',
    name: '神秘宝箱',
    description: '未知的惊喜，概率波动大',
    baseProbability: 0.4,
    baseReward: 180,
    riskLevel: 3,
    category: 'rare',
    icon: '📦'
  }
]

export function getRandomActivities(count: number = 4): Activity[] {
  const shuffled = [...ACTIVITIES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
