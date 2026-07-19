import { PageHeader } from "@/components/common/page-header";

import { Story } from "@/components/about/story";
import { Experience } from "@/components/about/experience";
import { Values } from "@/components/about/values";
import { FounderMessage } from "@/components/about/founder-message";


export default function AboutPage() {

  return (

    <main className="min-h-screen bg-white text-black">



      <PageHeader

        eyebrow="About JobiVerse"

        title="Building The Future Of Hiring."

        description="
        JobiVerse is evolving from a recruitment company into a complete
        HR technology platform designed to connect businesses and talent.
        "

      />


      <Story />


      <Experience />


      <Values />


      <FounderMessage />



      <section className="border-t border-zinc-200 bg-black py-24 text-center text-white">

        <div className="mx-auto max-w-4xl px-6 lg:px-8">


          <h2 className="text-4xl font-bold sm:text-5xl">

            Let's Build The Future
            <br />
            Of Hiring Together.

          </h2>


          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">

            Whether you are hiring talent or searching for your next
            opportunity, JobiVerse is here to help.

          </p>


        </div>

      </section>



    </main>

  );

}
