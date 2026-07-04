import axios from "axios";
import type {
  Creator,
  CreatorInput,
  CreatorQueryParams,
  CreatorsResponse,
} from "@/types/creator";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** Strip undefined/empty values so query strings stay clean (?niche=all is never sent). */
function toQueryParams(params: CreatorQueryParams): Record<string, string | number> {
  const query: Record<string, string | number> = {
    page: params.page,
    limit: params.limit,
  };
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.order) query.order = params.order;
  if (params.niche && params.niche !== "all") query.niche = params.niche;
  if (params.minFollowers !== undefined) query.minFollowers = params.minFollowers;
  if (params.maxFollowers !== undefined) query.maxFollowers = params.maxFollowers;
  return query;
}

export const creatorService = {
  async getCreators(params: CreatorQueryParams): Promise<CreatorsResponse> {
    const { data } = await apiClient.get<CreatorsResponse>("/creators", {
      params: toQueryParams(params),
    });
    return data;
  },

  async getCreator(id: string): Promise<Creator> {
    const { data } = await apiClient.get<Creator>(`/creators/${id}`);
    return data;
  },

  async createCreator(input: CreatorInput): Promise<Creator> {
    const { data } = await apiClient.post<Creator>("/creators", input);
    return data;
  },

  async updateCreator(id: string, input: Partial<CreatorInput>): Promise<Creator> {
    const { data } = await apiClient.patch<Creator>(`/creators/${id}`, input);
    return data;
  },

  async deleteCreator(id: string): Promise<void> {
    await apiClient.delete(`/creators/${id}`);
  },
};
