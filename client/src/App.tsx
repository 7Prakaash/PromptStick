import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import LandingPage from "@/pages/LandingPage";
import GeneratorSelection from "@/pages/GeneratorSelection";
import GeneratorPage from "@/pages/GeneratorPage";
import SavedPrompts from "@/pages/SavedPrompts";
import Templates from "@/pages/Templates";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/generators" component={GeneratorSelection} />
      <Route path="/generator/:type" component={GeneratorPage} />
      <Route path="/saved" component={SavedPrompts} />
      <Route path="/templates" component={Templates} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
