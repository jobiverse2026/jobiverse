import { Hero } from "@/components/home/hero";
import { Ecosystem } from "@/components/home/ecosystem";
import { WhyJobiverse } from "@/components/home/why-jobiverse";
import { Services } from "@/components/home/services";
import { Industries } from "@/components/home/industries";
import { AIFuture } from "@/components/home/ai-future";
import { Trust } from "@/components/home/trust";
import { FinalCTA } from "@/components/home/final-cta";
import { ExploreJobiVerse } from "@/components/home/explore-jobiverse";
import IntroAnimation from "@/components/intro/intro-animation";


export default function Home() {

  return (

    <main className="jv-universe min-h-screen text-black">

      <IntroAnimation />




      <Hero />


      <Ecosystem />

      <ExploreJobiVerse />


      <WhyJobiverse />


      <Services />


      <Industries />


      <AIFuture />


      <Trust />


      <FinalCTA />




    </main>

  );

}
