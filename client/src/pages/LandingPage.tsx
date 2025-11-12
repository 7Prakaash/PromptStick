/**
 * Landing Page
 * Hero section, features, and CTA for PromptStick
 */

import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import FeatureCard from '@/components/FeatureCard';
import { Sparkles, FileText, Image, Video, FolderOpen, BarChart3, BookTemplate } from 'lucide-react';
import heroImage from '@assets/generated_images/AI_prompt_generation_hero_64865157.png';
import { getGeneratorPath } from '@/lib/routes';

export default function LandingPage() {
  const features = [
    {
      icon: FileText,
      title: 'Text Prompts',
      description: 'Generate optimized prompts for GPT, Claude, and other text models with tone and style customization.',
    },
    {
      icon: Image,
      title: 'Image Prompts',
      description: 'Create detailed prompts for DALL-E, Midjourney, and Stable Diffusion with style presets.',
    },
    {
      icon: Video,
      title: 'Video Prompts',
      description: 'Plan video content with structured prompts for scripts, storyboards, and production.',
    },
    {
      icon: FolderOpen,
      title: 'Organized Library',
      description: 'Save, organize, and manage your prompts in custom folders with drag-and-drop support.',
    },
    {
      icon: BarChart3,
      title: 'Usage Tracking',
      description: 'Monitor your prompt generation with daily and monthly usage statistics.',
    },
    {
      icon: BookTemplate,
      title: 'Template Library',
      description: 'Jump-start your work with pre-built templates for common use cases and workflows.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Choose Your Type',
      description: 'Select text, image, or video prompt generator based on your needs.',
    },
    {
      number: '02',
      title: 'Customize & Generate',
      description: 'Input your query, select tone and style, then generate an optimized prompt.',
    },
    {
      number: '03',
      title: 'Save & Organize',
      description: 'Save prompts to your library, organize in folders, and reuse anytime.',
    },
  ];

  return (
    <div className="min-h-screen" data-testid="page-landing">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="space-y-6 py-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI Prompt Generator</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight" data-testid="text-hero-title">
                Generate Better
                <span className="block text-primary mt-2">AI Prompts</span>
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg" data-testid="text-hero-subtitle">
                Create optimized prompts for text, image, and video AI models. Save, organize, and reuse your best prompts with PromptStick.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href={getGeneratorPath('text')}>
                  <Button size="lg" className="text-lg px-8" data-testid="button-cta-primary">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Generating
                  </Button>
                </Link>
                <Link href="/templates">
                  <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-cta-secondary">
                    <BookTemplate className="mr-2 h-5 w-5" />
                    View Templates
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={heroImage}
                  alt="AI Prompt Generation Visualization"
                  className="w-full h-auto"
                  data-testid="img-hero"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-features-title">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground">
              Powerful features to help you create, manage, and optimize your AI prompts
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-how-title">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative" data-testid={`step-${index + 1}`}>
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-primary/20">{step.number}</div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold" data-testid="text-cta-title">
              Ready to Generate Better Prompts?
            </h2>
            <p className="text-lg text-muted-foreground">
              Start creating optimized AI prompts today. No signup required.
            </p>
            <Link href="/generator/text">
              <Button size="lg" className="text-lg px-8" data-testid="button-cta-final">
                <Sparkles className="mr-2 h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
