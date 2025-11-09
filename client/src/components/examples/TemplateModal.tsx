import { useState } from 'react';
import TemplateModal from '../TemplateModal';
import { Button } from '@/components/ui/button';

export default function TemplateModalExample() {
  const [isOpen, setIsOpen] = useState(false);

  const sampleTemplates = [
    {
      id: 'blog-post',
      name: 'Blog Post Generator',
      description: 'Create engaging blog posts on any topic',
      prompt: 'Write a comprehensive blog post about [TOPIC]...',
      type: 'text' as const,
      llm: 'GPT-4'
    }
  ];

  return (
    <div className="p-8">
      <Button onClick={() => setIsOpen(true)}>Open Template Modal</Button>
      <TemplateModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        templates={sampleTemplates}
        categoryName="Content Writing"
      />
    </div>
  );
}
