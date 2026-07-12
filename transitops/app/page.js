import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Stats from "@/components/landing/Stats";
import WorkflowDemo from "@/components/landing/WorkflowDemo";
import Features from "@/components/landing/Features";
import RolesExplorer from "@/components/landing/RolesExplorer";
import TechStack from "@/components/landing/TechStack";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Stats />
        <WorkflowDemo />
        <Features />
        <RolesExplorer />
        <TechStack />
      </main>
      <Footer />
    </div>
  );
}

