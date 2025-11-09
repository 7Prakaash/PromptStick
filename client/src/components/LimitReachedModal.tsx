/**
 * LimitReachedModal component
 * Modal shown when user reaches their usage limit
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'daily' | 'monthly';
}

export default function LimitReachedModal({ isOpen, onClose, limitType }: LimitReachedModalProps) {
  const messages = {
    daily: {
      title: 'Daily Limit Reached',
      description: 'You\'ve reached your daily limit of 50 prompts. Your limit will reset tomorrow at midnight.',
    },
    monthly: {
      title: 'Monthly Limit Reached',
      description: 'You\'ve reached your monthly limit of 500 prompts. Your limit will reset on the 1st of next month.',
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent data-testid="modal-limit-reached">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle data-testid="text-modal-title">{messages[limitType].title}</DialogTitle>
          </div>
          <DialogDescription data-testid="text-modal-description">
            {messages[limitType].description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="p-4 rounded-lg bg-muted/50 border">
            <p className="text-sm font-medium mb-2">What you can do:</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Review and use your saved prompts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Browse templates for inspiration</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Wait for your limit to reset</span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full" data-testid="button-close">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
