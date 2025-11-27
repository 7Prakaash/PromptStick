/**
 * Templates Page
 * Browse and use pre-built prompt templates
 */

import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { templateCategories } from '@/data/templates';
import { getTemplatePath } from '@/lib/routes';
import * as LucideIcons from 'lucide-react';

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
          <Card className="mt-12 p-8 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/10" data-testid="card-seo-summary">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <LucideIcons.Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold" data-testid="text-seo-title">
                  Why Use AI Prompt Templates?
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Save Time with Ready-Made Prompts</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our curated collection of AI prompt templates helps you skip the trial-and-error process. 
                    Each template is crafted by prompt engineering experts to deliver consistent, high-quality 
                    results across popular AI models like ChatGPT, Claude, DALL-E, and Midjourney.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Boost Your Productivity</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Whether you're creating content for marketing, developing code, designing visuals, or 
                    producing educational materials, our templates provide the perfect starting point. 
                    Customize variables like tone, audience, and format to match your exact needs.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  <strong>PromptStick Template Library</strong> offers {templateCategories.length} categories 
                  with {templateCategories.reduce((acc, cat) => acc + cat.templates.length, 0)}+ professional 
                  templates for text generation, image creation, video production, and more. Start creating 
                  better AI outputs today.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
