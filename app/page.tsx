import IntroAnimation from "@/components/intro/intro-animation";
import { UniverseHome } from "@/components/home/universe-home";

export default function Home() {
  return (
    <main className="jv-universe min-h-screen text-black">
      <IntroAnimation />
      <UniverseHome />
    </main>
  );
}
