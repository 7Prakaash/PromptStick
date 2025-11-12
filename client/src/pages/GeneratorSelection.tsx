/**
 * Generator Selection Page
 * Choose between Text, Image, or Video prompt generators
 */

import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Image, Video, ArrowRight } from 'lucide-react';
import { getGeneratorPath } from '@/lib/routes';

export default function GeneratorSelection() {
  const generators = [
    {
      type: 'text' as const,
      icon: FileText,
      title: 'Text Prompts',
      description: 'Generate optimized prompts for GPT, Claude, and other text-based AI models',
      features: ['Tone selection', 'Style customization', 'Multiple LLM support'],
      path: getGeneratorPath('text'),
    },
    {
      type: 'image' as const,
      icon: Image,
      title: 'Image Prompts',
      description: 'Create detailed prompts for DALL-E, Midjourney, Stable Diffusion and more',
      features: ['Art style presets', 'Quality enhancers', 'Model-specific optimization'],
      path: getGeneratorPath('image'),
    },
    {
      type: 'video' as const,
      icon: Video,
      title: 'Video Prompts',
      description: 'Plan video content with structured prompts for scripts and storyboards',
      features: ['Format templates', 'Scene descriptions', 'Production notes'],
      path: getGeneratorPath('video'),
    },
  ];

  return (
    <div className="min-h-screen py-12" data-testid="page-generator-selection">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-page-title">
              Choose Your Generator
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-page-description">
              Select the type of AI prompt you want to generate
            </p>
          </div>

          {/* Generator Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {generators.map((generator) => {
              const Icon = generator.icon;
              
              return (
                <Card
                  key={generator.type}
                  className="p-6 flex flex-col hover-elevate transition-all"
                  data-testid={`card-generator-${generator.type}`}
                >
                  <div className="flex-1 space-y-4">
                    {/* Icon */}
                    <div className="p-3 rounded-lg bg-primary/10 w-fit">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h2 className="text-xl font-semibold mb-2" data-testid="text-generator-title">
                        {generator.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        {generator.description}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2">
                      {generator.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-primary mt-0.5">•</span>
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link href={generator.path}>
                    <Button className="w-full mt-6" data-testid={`button-start-${generator.type}`}>
                      Start Generating
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
