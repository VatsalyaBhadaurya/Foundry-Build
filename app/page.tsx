import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";
import { WhatCanBeBuilt } from "@/components/WhatCanBeBuilt";
import { Vision, FounderNote } from "@/components/Vision";
import { Pricing } from "@/components/Pricing";
import { Waitlist } from "@/components/Waitlist";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <WhatCanBeBuilt />
        <Vision />
        <FounderNote />
        <Pricing />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
