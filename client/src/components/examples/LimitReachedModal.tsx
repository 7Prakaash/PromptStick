import { useState } from 'react';
import LimitReachedModal from '../LimitReachedModal';
import { Button } from '@/components/ui/button';

export default function LimitReachedModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>Open Limit Modal</Button>
      <LimitReachedModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        limitType="daily"
      />
    </div>
  );
}
