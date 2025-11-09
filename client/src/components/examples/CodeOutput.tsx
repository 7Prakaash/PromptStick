import CodeOutput from '../CodeOutput';

export default function CodeOutputExample() {
  const samplePrompt = `You are an expert in React development. Maintain a professional and informative tone. Create a reusable button component that supports multiple variants and sizes.

Provide a comprehensive and detailed response with examples.

Break down your response into clear, numbered steps.

Format your response with clear headings and bullet points where appropriate.`;

  return (
    <div className="p-8 max-w-4xl">
      <CodeOutput
        prompt={samplePrompt}
        onSave={() => console.log('Save triggered')}
      />
    </div>
  );
}
