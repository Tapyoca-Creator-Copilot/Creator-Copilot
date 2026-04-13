import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ArchiveProjectDialog = ({ open, onOpenChange, projectName, isArchiving, onConfirm }) => {
  const displayName = projectName || "this project";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card dark:bg-card">
        <DialogHeader>
          <DialogTitle>Archive project?</DialogTitle>
          <DialogDescription>
            {`This project will be archived, not deleted. You can always find it later in Archived Projects.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isArchiving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"     
            onClick={onConfirm}
            disabled={isArchiving}
          >
            {isArchiving ? "Archiving..." : "Archive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveProjectDialog;