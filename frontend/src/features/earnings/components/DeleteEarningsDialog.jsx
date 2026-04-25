import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { deleteEarning } from "@/features/earnings/services/earnings";

const DeleteEarningsDialog = ({ open, onOpenChange, session, earning, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!earning?.id) {
      toast.error("No earning selected to delete.");
      return;
    }

    try {
      setIsDeleting(true);
      const result = await deleteEarning(earning.id, { userId: session?.user?.id, projectId: earning.projectId });
      toast.success("Earning deleted");
      onDeleted?.(result?.data?.id || earning.id);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to delete earning. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const earningName = earning?.name || "this earning";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete earning?</DialogTitle>
          <DialogDescription>
            This will permanently delete {earningName}. You can't undo this action.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteEarningsDialog;
