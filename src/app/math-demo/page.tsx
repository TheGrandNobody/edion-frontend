import MainContainer from "@/components/MainContainer";
import LaTeXEditor from "@/components/Editor/LaTeXEditor";

const MathDemoPage = () => {
  return (
    <MainContainer>
      <div className="w-full max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">LaTeX Math Editor</h1>
        <LaTeXEditor />
      </div>
    </MainContainer>
  );
};

export default MathDemoPage; 