"use client";

import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteCreator } from "@/hooks/useDeleteCreator";
import { getApiErrorMessage } from "@/lib/api-error";
import type { Creator } from "@/types/creator";

interface DeleteDialogProps {
  creator: Creator | null;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDialog({ creator, onOpenChange }: DeleteDialogProps) {
  const deleteMutation = useDeleteCreator();

  const handleDelete = () => {
    if (!creator) return;
    deleteMutation.mutate(creator.id, {
      onSuccess: () => {
        toast.success(`${creator.name} deleted`);
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Couldn't delete creator."));
      },
    });
  };

  return (
    <AlertDialog open={Boolean(creator)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {creator?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the creator from the directory. This can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
