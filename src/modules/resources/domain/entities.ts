export type ResourceStatus = 'TO_READ' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED';

export interface Resource {
  id: string;
  userId: string;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  status: ResourceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedResource {
  id: string;
  title: string;
  url: string;
  description: string | null;
  category: string | null;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
}
