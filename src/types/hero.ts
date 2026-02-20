export interface Skill {
  skillName: string;
  cooldown: number[];
  cost: number[];
  skillDesc: string;
  skillImg: string;
}

export interface Skin {
  skinName: string;
  skinImg?: string; // Old format (camp)
  skinCover?: string; // New format (world)
  skinImage?: string; // New format (world)
  skinImage2?: string; // New format (world)
  skinSeries?: string; // New format (world)
  skinLink?: string; // New format (world)
}

export interface HeroRelation {
  name: string;
  thumbnail: string;
  description: string;
  url: string;
}

export interface HeroStats {
  winRate: string;
  pickRate: string;
  banRate: string;
  tier: string;
}

export interface HeroWorld {
  region: string;
  identity: string;
  energy: string;
  height?: string;
}

export interface Hero {
  title: string;
  name: string;
  heroId: number;
  role: string;
  lane: string;
  icon: string;
  skill: Skill[];
  skins: Skin[];
  survivalPercentage: string;
  attackPercentage: string;
  abilityPercentage: string;
  difficultyPercentage: string;
  emblems: any[];
  emblemTips: string;
  bestPartners: Record<string, HeroRelation>;
  suppressingHeroes: Record<string, HeroRelation>;
  suppressedHeroes: Record<string, HeroRelation>;
  stats: HeroStats;
  world: HeroWorld;
}

export interface ApiResponse {
  main: Record<string, Hero>;
}

export type HeroRole = 'Tank' | 'Fighter' | 'Assassin' | 'Mage' | 'Marksman' | 'Support';

export type TierRank = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

export interface HeroFilter {
  role?: HeroRole | 'All';
  lane?: string | 'All';
  tier?: TierRank | 'All';
  search?: string;
}

export interface HeroSortOption {
  field: 'name' | 'winRate' | 'pickRate' | 'banRate' | 'tier';
  order: 'asc' | 'desc';
}
