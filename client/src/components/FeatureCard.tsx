/**
 * FeatureCard component
 * Displays a single feature with icon, title, and description
 */

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="p-6 hover-elevate transition-all duration-200" data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex flex-col items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Icon className="h-8 w-8 text-primary" data-testid="icon-feature" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold" data-testid="text-feature-title">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-feature-description">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
