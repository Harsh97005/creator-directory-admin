export const NICHES = [
  "beauty",
  "fitness",
  "travel",
  "food",
  "tech",
  "fashion",
] as const;

export type Niche = (typeof NICHES)[number];

export const STATUSES = ["active", "inactive"] as const;

export type CreatorStatus = (typeof STATUSES)[number];

export interface Creator {
  id: string;
  name: string;
  niche: Niche;
  followerCount: number;
  engagementRate: number;
  email: string;
  status: CreatorStatus;
  createdAt: string;
}

/** Fields the API accepts for create/update. `id` and `createdAt` are server-assigned. */
export type CreatorInput = Omit<Creator, "id" | "createdAt">;

export type SortableField = "followerCount" | "engagementRate" | "name" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface CreatorFilters {
  niche?: Niche | "all";
  minFollowers?: number;
  maxFollowers?: number;
}

export interface CreatorQueryParams extends CreatorFilters {
  page: number;
  limit: number;
  sortBy?: SortableField;
  order?: SortOrder;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type CreatorsResponse = PaginatedResponse<Creator>;
