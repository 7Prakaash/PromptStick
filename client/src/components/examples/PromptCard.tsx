import PromptCard from '../PromptCard';

export default function PromptCardExample() {
  const samplePrompt = {
    id: '1',
    type: 'text' as const,
    query: 'Create a React component for a user profile card',
    generatedPrompt: 'You are an expert in React development. Create a reusable user profile card component...',
    llm: 'GPT-4',
    tone: 'professional',
    style: ['detailed', 'with-examples'],
    timestamp: Date.now(),
    isFavorite: false,
  };

  return (
    <div className="p-8 max-w-md">
      <PromptCard
        prompt={samplePrompt}
        onCopy={() => console.log('Copy triggered')}
        onDelete={() => console.log('Delete triggered')}
        onToggleFavorite={() => console.log('Toggle favorite triggered')}
      />
    </div>
  );
}
