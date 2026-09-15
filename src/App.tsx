import { LazyMotion } from "motion/react";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { Hero } from "./sections/Hero";
import { StackSimulator } from "./sections/StackSimulator";
import { PromptPlayground } from "./sections/PromptPlayground";
import { Portfolio } from "./sections/Portfolio";
import { Skills } from "./sections/Skills";
import { Contact } from "./sections/Contact";
import { Play } from "./sections/Play";

// Chargées dans un chunk séparé : les primitives animées restent utilisables
// (statiques le temps du fetch) sans alourdir le bundle initial.
const loadMotionFeatures = () => import("./lib/motionFeatures").then((mod) => mod.default);

export default function App() {
  return (
    <LazyMotion features={loadMotionFeatures} strict>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <Hero />
          <StackSimulator />
          <PromptPlayground />
          <Portfolio />
          <Skills />
          <Contact />
          <Play />
        </main>
        <Footer />
      </div>
    </LazyMotion>
  );
}
