"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateCreator } from "@/hooks/useCreateCreator";
import { useUpdateCreator } from "@/hooks/useUpdateCreator";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  creatorFormSchema,
  DEFAULT_CREATOR_FORM_VALUES,
  type CreatorFormValues,
} from "@/lib/validation";
import { NICHES, STATUSES, type Creator } from "@/types/creator";

interface CreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing an existing creator; absent when creating a new one. */
  creator?: Creator | null;
}

const NICHE_LABELS: Record<(typeof NICHES)[number], string> = {
  beauty: "Beauty",
  fitness: "Fitness",
  travel: "Travel",
  food: "Food",
  tech: "Tech",
  fashion: "Fashion",
};

export function CreatorDialog({ open, onOpenChange, creator }: CreatorDialogProps) {
  const isEditing = Boolean(creator);
  const createMutation = useCreateCreator();
  const updateMutation = useUpdateCreator();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreatorFormValues>({
    resolver: zodResolver(creatorFormSchema),
    defaultValues: DEFAULT_CREATOR_FORM_VALUES,
  });

  // Repopulate the form whenever the dialog opens for a different creator (or a fresh create).
  useEffect(() => {
    if (!open) return;
    reset(
      creator
        ? {
            name: creator.name,
            email: creator.email,
            niche: creator.niche,
            followerCount: creator.followerCount,
            engagementRate: creator.engagementRate,
            status: creator.status,
          }
        : DEFAULT_CREATOR_FORM_VALUES
    );
  }, [open, creator, reset]);

  const nicheValue = watch("niche");
  const statusValue = watch("status");

  const onSubmit = (values: CreatorFormValues) => {
    if (isEditing && creator) {
      updateMutation.mutate(
        { id: creator.id, input: values },
        {
          onSuccess: () => {
            toast.success(`${values.name} updated`);
            onOpenChange(false);
          },
          onError: (error) => {
            toast.error(getApiErrorMessage(error, "Couldn't update creator."));
          },
        }
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast.success(`${values.name} added`);
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, "Couldn't add creator."));
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit creator" : "Add creator"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this creator's details."
              : "Add a new creator to the directory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} aria-invalid={Boolean(errors.name)} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="niche">Niche</Label>
              <Select
                value={nicheValue}
                onValueChange={(value) => setValue("niche", value as CreatorFormValues["niche"], { shouldValidate: true })}
              >
                <SelectTrigger id="niche">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map((n) => (
                    <SelectItem key={n} value={n}>
                      {NICHE_LABELS[n]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.niche && <p className="text-xs text-destructive">{errors.niche.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusValue}
                onValueChange={(value) => setValue("status", value as CreatorFormValues["status"], { shouldValidate: true })}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === "active" ? "Active" : "Inactive"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="followerCount">Followers</Label>
              <Input
                id="followerCount"
                type="number"
                min={0}
                {...register("followerCount", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.followerCount)}
              />
              {errors.followerCount && (
                <p className="text-xs text-destructive">{errors.followerCount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="engagementRate">Engagement (%)</Label>
              <Input
                id="engagementRate"
                type="number"
                min={0}
                max={100}
                step="0.1"
                {...register("engagementRate", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.engagementRate)}
              />
              {errors.engagementRate && (
                <p className="text-xs text-destructive">{errors.engagementRate.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Add creator"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
