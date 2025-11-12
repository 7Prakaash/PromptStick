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
        </div>
      </div>
    </div>
  );
}
