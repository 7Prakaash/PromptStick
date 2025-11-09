import FeatureCard from '../FeatureCard';
import { Sparkles } from 'lucide-react';

export default function FeatureCardExample() {
  return (
    <div className="p-8 max-w-sm">
      <FeatureCard
        icon={Sparkles}
        title="Smart Generation"
        description="Generate optimized prompts tailored for different AI models with intelligent suggestions and best practices."
      />
    </div>
  );
}
