/**
 * Templates Page
 * Browse and use pre-built prompt templates
 */

import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { templateCategories } from '@/data/templates';
import { getTemplatePath } from '@/lib/routes';
import * as LucideIcons from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Templates() {
  const [, setLocation] = useLocation();

  const handleCategoryClick = (categoryId: string) => {
    setLocation(getTemplatePath(categoryId));
  };

  return (
    <div className="min-h-screen py-8" data-testid="page-templates">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="text-page-title">
              Template Library
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-description">
              Browse pre-built templates for common AI use cases
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templateCategories.map((category) => {
              // Dynamically get the icon component
              const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.FileText;
              
              return (
                <Card
                  key={category.id}
                  className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-all"
                  onClick={() => handleCategoryClick(category.id)}
                  data-testid={`card-category-${category.id}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {category.templates.length} templates
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2" data-testid="text-category-name">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground" data-testid="text-category-description">
                        {category.description}
                      </p>
                    </div>
                  </div>
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
                Why use AI prompt templates?
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  This page gives you an overview of our <strong>AI prompt template library</strong> designed to help you generate high-quality content faster. 
                  Browse through {templateCategories.length} categories with {templateCategories.reduce((acc, cat) => acc + cat.templates.length, 0)}+ ready-to-use templates 
                  for text, image, and video generation.
                </p>
                <p>
                  Our templates are optimized for popular AI models including <strong>GPT-4</strong>, <strong>Claude</strong>, <strong>DALL-E</strong>, and <strong>Midjourney</strong>. 
                  Each template includes customizable variables so you can adjust tone, style, and format to match your specific needs.
                </p>
                <p>
                  Whether you're creating blog posts, marketing copy, or stunning visuals, PromptStick helps you <strong>save time</strong> and achieve consistent, professional results. 
                  Click any category above to explore templates or visit our{' '}
                  <a href="/generators" className="text-primary hover:underline" data-testid="link-generators">prompt generators</a>{' '}
                  to create custom prompts from scratch.
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
                    <span className="font-medium">What are AI prompt templates?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    AI prompt templates are pre-built, optimized instructions designed for specific use cases like blog writing, marketing copy, or image generation. 
                    They save you time by providing a proven structure you can customize with your own details instead of writing prompts from scratch.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-1" className="px-6" data-testid="faq-1">
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="font-medium">How do I use a template?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Click on any category to browse available templates, then select one to customize. 
                    Fill in the variables like topic, tone, and audience, then copy the generated prompt directly into your preferred AI tool like ChatGPT or Midjourney.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-2" className="px-6" data-testid="faq-2">
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="font-medium">Can I customize the templates?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Yes, every template includes customizable variables. You can adjust the topic, tone, target audience, format, and other parameters. 
                    The template structure ensures your customizations still produce high-quality, effective prompts.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-3" className="px-6" data-testid="faq-3">
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="font-medium">Which AI models work with these templates?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Our templates are optimized for all major AI models including ChatGPT (GPT-4, GPT-3.5), Claude, Gemini, DALL-E, Midjourney, and Stable Diffusion. 
                    Each template shows the recommended AI model for best results.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="faq-4" className="px-6" data-testid="faq-4">
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="font-medium">What's the difference between templates and generators?</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5">
                    Templates are pre-built prompts for specific use cases that you customize with variables. Generators let you create prompts from scratch by describing what you need. 
                    Use templates when you want quick, proven structures; use generators for unique, custom requirements.
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
                      "name": "What are AI prompt templates?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "AI prompt templates are pre-built, optimized instructions designed for specific use cases like blog writing, marketing copy, or image generation. They save you time by providing a proven structure you can customize with your own details instead of writing prompts from scratch."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "How do I use a template?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Click on any category to browse available templates, then select one to customize. Fill in the variables like topic, tone, and audience, then copy the generated prompt directly into your preferred AI tool like ChatGPT or Midjourney."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Can I customize the templates?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes, every template includes customizable variables. You can adjust the topic, tone, target audience, format, and other parameters. The template structure ensures your customizations still produce high-quality, effective prompts."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "Which AI models work with these templates?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Our templates are optimized for all major AI models including ChatGPT (GPT-4, GPT-3.5), Claude, Gemini, DALL-E, Midjourney, and Stable Diffusion. Each template shows the recommended AI model for best results."
                      }
                    },
                    {
                      "@type": "Question",
                      "name": "What's the difference between templates and generators?",
                      "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Templates are pre-built prompts for specific use cases that you customize with variables. Generators let you create prompts from scratch by describing what you need. Use templates when you want quick, proven structures; use generators for unique, custom requirements."
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
