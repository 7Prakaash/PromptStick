/**
 * TemplateDetail page
 * Displays all templates for a specific category
 */

import { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { templateCategories, type Template } from '@/data/templates';
import { ArrowLeft, Share2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { PromptTemplateDialog } from '@/components/PromptTemplateDialog';
import { useToast } from '@/hooks/use-toast';

export default function TemplateDetail() {
  const [, params] = useRoute('/templates/:categoryId');
  const [location, setLocation] = useLocation();
  const categoryId = params?.categoryId;
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const category = templateCategories.find(c => c.id === categoryId);

  // Check URL for template ID and auto-open dialog
  useEffect(() => {
    if (!category) return;
    
    const queryStart = location.indexOf('?');
    if (queryStart !== -1) {
      const templateId = location.substring(queryStart + 1);
      if (templateId) {
        const template = category.templates.find(t => t.id === templateId);
        if (template && !dialogOpen) {
          setSelectedTemplate(template);
          setDialogOpen(true);
        }
      }
    }
  }, [category, location, dialogOpen]);

  if (!category) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
            <Button onClick={() => setLocation('/templates')} data-testid="button-back-to-templates">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Templates
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = (LucideIcons as any)[category.icon] || LucideIcons.FileText;

  const handlePromptClick = (template: Template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
    // Add template ID to URL when opening dialog
    const currentPath = location.split('?')[0];
    setLocation(`${currentPath}?${template.id}`, { replace: true });
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    // Remove query params completely when dialog closes
    if (!open) {
      const currentPath = location.split('?')[0];
      setLocation(currentPath, { replace: true });
    }
  };

  const handleSavePrompt = (prompt: string) => {
    // Save to localStorage
    const savedPrompts = JSON.parse(localStorage.getItem('savedPrompts') || '[]');
    savedPrompts.push({
      id: Date.now().toString(),
      name: selectedTemplate?.name || 'Custom Prompt',
      prompt,
      type: selectedTemplate?.type || 'text',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('savedPrompts', JSON.stringify(savedPrompts));
  };

  const handleShareTemplate = (template: Template) => {
    const shareUrl = `${window.location.origin}/templates/${categoryId}?${template.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Template link copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen py-8" data-testid="page-template-detail">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => setLocation('/templates')}
            className="mb-6"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Templates
          </Button>

          {/* Category Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <IconComponent className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold" data-testid="text-category-name">
                  {category.name}
                </h1>
                <p className="text-muted-foreground mt-1" data-testid="text-category-description">
                  {category.description}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {category.templates.length} template{category.templates.length !== 1 ? 's' : ''} available
            </div>
          </div>

          {/* Templates List */}
          <div className="space-y-4">
            {category.templates.map((template) => (
              <Card 
                key={template.id} 
                className="p-6 hover-elevate" 
                data-testid={`card-template-${template.id}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold" data-testid="text-template-name">
                          {template.name}
                        </h3>
                        <Badge variant="outline" data-testid="badge-template-type">
                          {template.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground" data-testid="text-template-description">
                        {template.description}
                      </p>
                      {template.llm && (
                        <div className="text-xs text-muted-foreground">
                          Recommended: {template.llm}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleShareTemplate(template)}
                        data-testid={`button-share-${template.id}`}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handlePromptClick(template)}
                        data-testid={`button-use-${template.id}`}
                      >
                        Use Template
                      </Button>
                    </div>
                  </div>
                  
                  <div 
                    className="bg-muted/50 p-4 rounded-lg cursor-pointer hover-elevate transition-all"
                    onClick={() => handlePromptClick(template)}
                    data-testid={`div-prompt-preview-${template.id}`}
                  >
                    <p className="text-sm font-mono leading-relaxed whitespace-pre-wrap" data-testid="text-template-prompt">
                      {template.prompt}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Prompt Template Dialog */}
      <PromptTemplateDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        template={selectedTemplate}
        onSave={handleSavePrompt}
        categoryId={categoryId}
      />
    </div>
  );
}
