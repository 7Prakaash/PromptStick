import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LandingPage from "@/pages/LandingPage";
import GeneratorSelection from "@/pages/GeneratorSelection";
import GeneratorPage from "@/pages/GeneratorPage";
import SavedPrompts from "@/pages/SavedPrompts";
import Templates from "@/pages/Templates";
import TemplateDetail from "@/pages/TemplateDetail";
import NotFound from "@/pages/not-found";
import { getGeneratorPath } from "@/lib/routes";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/generators" component={GeneratorSelection} />
      
      {/* New generator routes */}
      <Route path="/text-prompt-generator">
        {() => <GeneratorPage type="text" />}
      </Route>
      <Route path="/image-prompt-generator">
        {() => <GeneratorPage type="image" />}
      </Route>
      <Route path="/video-prompt-generator">
        {() => <GeneratorPage type="video" />}
      </Route>
      
      {/* Legacy redirects */}
      <Route path="/generator/text">
        {() => <Redirect to={getGeneratorPath('text')} />}
      </Route>
      <Route path="/generator/image">
        {() => <Redirect to={getGeneratorPath('image')} />}
      </Route>
      <Route path="/generator/video">
        {() => <Redirect to={getGeneratorPath('video')} />}
      </Route>
      
      <Route path="/saved" component={SavedPrompts} />
      <Route path="/templates" component={Templates} />
      <Route path="/templates/:categoryId" component={TemplateDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background flex flex-col">
          <Header />
          <main className="flex-1">
            <Router />
          </main>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
