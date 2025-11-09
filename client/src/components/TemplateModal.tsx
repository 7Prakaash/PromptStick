/**
 * TemplateModal component
 * Modal displaying templates for a category
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Template } from '@/data/templates';
import { useLocation } from 'wouter';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: Template[];
  categoryName: string;
}

export default function TemplateModal({ isOpen, onClose, templates, categoryName }: TemplateModalProps) {
  const [, setLocation] = useLocation();

  const handleUseTemplate = (template: Template) => {
    console.log('Using template:', template);
    
    // Navigate to appropriate generator with template data
    const typeMap: Record<string, string> = {
      text: '/generator/text',
      image: '/generator/image',
      video: '/generator/video',
    };
    
    // Store template in sessionStorage for the generator to pick up
    sessionStorage.setItem('template', JSON.stringify(template));
    
    setLocation(typeMap[template.type]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" data-testid="modal-templates">
        <DialogHeader>
          <DialogTitle data-testid="text-modal-title">{categoryName}</DialogTitle>
          <DialogDescription data-testid="text-modal-description">
            Choose a template to get started quickly
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-4 hover-elevate" data-testid={`card-template-${template.id}`}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold" data-testid="text-template-name">{template.name}</h4>
                      <Badge variant="outline" data-testid="badge-template-type">{template.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground" data-testid="text-template-description">
                      {template.description}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                    data-testid={`button-use-${template.id}`}
                  >
                    Use Template
                  </Button>
                </div>
                
                {template.llm && (
                  <div className="text-xs text-muted-foreground">
                    Recommended: {template.llm}
                  </div>
                )}
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs font-mono leading-relaxed" data-testid="text-template-prompt">
                    {template.prompt}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
