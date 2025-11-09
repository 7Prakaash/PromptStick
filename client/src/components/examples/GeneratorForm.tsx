import GeneratorForm from '../GeneratorForm';

export default function GeneratorFormExample() {
  const handleGenerate = (params: any) => {
    console.log('Generate triggered:', params);
  };

  return (
    <div className="p-8 max-w-2xl">
      <GeneratorForm type="text" onGenerate={handleGenerate} />
    </div>
  );
}
