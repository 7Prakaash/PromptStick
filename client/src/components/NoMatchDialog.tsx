import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface NoMatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export default function NoMatchDialog({ isOpen, onClose, onRetry }: NoMatchDialogProps) {
  const handleRetry = () => {
    onClose();
    onRetry();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent data-testid="dialog-no-match">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle data-testid="text-dialog-title">Oops! Prompt Generation Failed</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base" data-testid="text-dialog-description">
            We couldn't find a matching template for your query.{' '}
            <button
              onClick={handleRetry}
              className="text-primary hover:underline font-medium"
              data-testid="button-retry-inline"
            >
              Try again with New Ideas!
            </button>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-close">
            Close
          </Button>
          <Button onClick={handleRetry} data-testid="button-retry">
            Try Again
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
