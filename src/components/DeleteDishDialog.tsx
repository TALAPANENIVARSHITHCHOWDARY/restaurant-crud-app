import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Dish } from '@/types/dish';

interface DeleteDishDialogProps {
  dish: Dish | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteDishDialog = ({ dish, isOpen, onClose, onConfirm }: DeleteDishDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    if (!dish) return;
    
    setIsDeleting(true);
    try {
      await onConfirm(dish.id);
    } catch (error) {
      console.error('Error deleting dish:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent aria-describedby="delete-dialog-description">
        <AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <AlertDialogTitle>Delete Dish</AlertDialogTitle>
          </div>
          <AlertDialogDescription id="delete-dialog-description">
            Are you sure you want to delete <strong>{dish?.name}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};