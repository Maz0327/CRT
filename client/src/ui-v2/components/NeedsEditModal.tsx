import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

type NeedsEditModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (notes: string) => void;
  signalTitle: string;
};

export function NeedsEditModal({ open, onClose, onSubmit, signalTitle }: NeedsEditModalProps) {
  const [notes, setNotes] = useState("");

  const handleSubmit = () => {
    onSubmit(notes.trim());
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Signal Needs Edit</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Signal:</Label>
            <p className="text-sm mt-1 text-foreground">{signalTitle}</p>
          </div>
          
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="What needs to be improved? (e.g., 'Add more receipts', 'Clarify summary', 'Update strategic moves')"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 text-sm"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Mark as Needs Edit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}