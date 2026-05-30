export type JourneyStepStatus = 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';

export interface JourneyStep {
  id: string;
  journeyId: string;
  title: string;
  description: string | null;
  url: string | null;
  instructor: string | null;
  difficulty: number;
  xpReward: number;
  order: number;
  status: JourneyStepStatus;
}

export interface Journey {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface JourneyWithSteps extends Journey {
  steps: JourneyStep[];
}

export interface SerializedJourneyStep {
  id: string;
  journeyId: string;
  title: string;
  description: string | null;
  url: string | null;
  instructor: string | null;
  difficulty: number;
  xpReward: number;
  order: number;
  status: JourneyStepStatus;
}

export interface SerializedJourney {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  steps: SerializedJourneyStep[];
}
