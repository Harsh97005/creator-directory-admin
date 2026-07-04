import { z } from "zod";
import { NICHES, STATUSES } from "@/types/creator";

export const creatorFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  niche: z.enum(NICHES, { message: "Select a niche" }),
  followerCount: z
    .number({ message: "Followers must be a number" })
    .min(0, "Followers cannot be negative"),
  engagementRate: z
    .number({ message: "Engagement rate must be a number" })
    .min(0, "Engagement rate must be at least 0")
    .max(100, "Engagement rate cannot exceed 100"),
  status: z.enum(STATUSES),
});

export type CreatorFormValues = z.infer<typeof creatorFormSchema>;

export const DEFAULT_CREATOR_FORM_VALUES: CreatorFormValues = {
  name: "",
  email: "",
  niche: "beauty",
  followerCount: 0,
  engagementRate: 0,
  status: "active",
};
