import React, { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteExpense } from "@/features/expenses/services/expenses";

const DeleteExpenseDialog = ({ open, onOpenChange, session, expense, onDeleted }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!expense?.id) {
      toast.error("No expense selected to delete.");
      return;
    }

    try {
      setIsDeleting(true);
      const result = await deleteExpense(expense.id, { userId: session?.user?.id });
      toast.success("Expense deleted");
      onDeleted?.(result?.data?.id || expense.id);
      onOpenChange?.(false);
    } catch (error) {
      toast.error(error?.message || "Unable to delete expense. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const expenseName = expense?.name || "this expense";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-linen dark:bg-card">
        <DialogHeader>
          <DialogTitle>Delete expense?</DialogTitle>
          <DialogDescription>
            This will permanently delete {expenseName}. You can’t undo this action.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="bg-linen hover:bg-linen-hover"
            onClick={() => onOpenChange?.(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-linen"
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

export default DeleteExpenseDialog;
