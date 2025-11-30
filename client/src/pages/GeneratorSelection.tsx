/**
 * Generator Selection Page
 * Choose between Text, Image, or Video prompt generators
 */

import { Link } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Image, Video, ArrowRight } from 'lucide-react';
import { getGeneratorPath } from '@/lib/routes';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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

          {/* SEO Summary Section */}
          <div className="mt-12 border-t pt-8">
            <Card 
              className="p-6 md:p-8" 
              data-testid="card-seo-summary"
            >
              <h2 className="text-xl font-bold mb-4" data-testid="text-seo-title">
                Why use an AI prompt generator?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  This page gives you an overview of our <strong>AI prompt generators</strong> designed to help you create optimized prompts 
                  for text, image, and video generation. The quality of your AI outputs depends entirely on the quality of your prompts.
                </p>
                <p>
                  Our generators support popular AI models including <strong>GPT-4</strong>, <strong>Claude</strong>, <strong>DALL-E</strong>, 
                  <strong> Midjourney</strong>, and <strong>Stable Diffusion</strong>. Each generator includes options for tone, style, 
                  and model-specific optimization to help you achieve <strong>professional results</strong>.
                </p>
                <p>
                  Whether you're writing blog posts, generating marketing copy, or creating stunning AI artwork, PromptStick helps you 
                  craft perfectly structured prompts. Looking for ready-made solutions? Check out our{' '}
                  <a href="/templates" className="text-primary hover:underline" data-testid="link-templates">template library</a>{' '}
                  for pre-built prompts you can use instantly.
                </p>
              </div>
            </Card>
          </div>

          {/* FAQ Section */}
          <section className="mt-12" data-testid="section-faq">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="bg-card rounded-lg border">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="faq-0" className="px-6" data-testid="faq-0">
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="font-medium">What is an AI prompt generator?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    An AI prompt generator is a tool that helps you create optimized instructions for AI models like ChatGPT, Claude, DALL-E, and Midjourney. 
                    Instead of writing prompts from scratch, our generator structures your ideas into effective prompts that get better results from AI.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-1" className="px-6" data-testid="faq-1">
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="font-medium">Which generator should I choose?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Choose based on your content type: use the Text Generator for written content like blog posts, emails, and marketing copy. 
                    The Image Generator is for creating prompts for AI art tools like DALL-E and Midjourney. 
                    The Video Generator helps structure prompts for AI video tools like Runway and Pika.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2" className="px-6" data-testid="faq-2">
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="font-medium">How do I use the generated prompts?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    After generating a prompt, simply copy it using the copy button and paste it directly into your preferred AI tool. 
                    The prompts are optimized for the specific AI model you selected, so they work immediately without additional editing.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3" className="px-6" data-testid="faq-3">
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="font-medium">Can I save my generated prompts?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Yes, you can save any generated prompt to your personal library. Organize them into folders, mark favorites, 
                    and access them anytime from the Saved Prompts section for quick reuse.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-4" className="px-6" data-testid="faq-4">
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="font-medium">Is there a limit to how many prompts I can generate?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Free users have a daily limit of 5 prompts and a monthly limit of 50 prompts. 
                    This resets automatically, giving you consistent access to all three generators.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            {/* FAQ Schema.org JSON-LD for SEO */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  "mainEntity": [
                    {
                      "@type": "Question",
                      "name": "What is an AI prompt generator?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "An AI prompt generator is a tool that helps you create optimized instructions for AI models like ChatGPT, Claude, DALL-E, and Midjourney. Instead of writing prompts from scratch, our generator structures your ideas into effective prompts that get better results from AI."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Which generator should I choose?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Choose based on your content type: use the Text Generator for written content like blog posts, emails, and marketing copy. The Image Generator is for creating prompts for AI art tools like DALL-E and Midjourney. The Video Generator helps structure prompts for AI video tools like Runway and Pika."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How do I use the generated prompts?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "After generating a prompt, simply copy it using the copy button and paste it directly into your preferred AI tool. The prompts are optimized for the specific AI model you selected, so they work immediately without additional editing."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Can I save my generated prompts?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, you can save any generated prompt to your personal library. Organize them into folders, mark favorites, and access them anytime from the Saved Prompts section for quick reuse."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Is there a limit to how many prompts I can generate?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Free users have a daily limit of 5 prompts and a monthly limit of 50 prompts. This resets automatically, giving you consistent access to all three generators."
                      }
                    }
                  ]
                }),
              }}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
