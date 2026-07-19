import { PageHeader } from "@/components/common/page-header";

import {
  Mail,
  Phone,
  MapPin,
  Building2,
  UserRound,
  MessageCircle,
} from "lucide-react";
import { InstagramIcon, LinkedInIcon } from "@/components/common/social-icons";


const contactCards = [
  {
    title: "Office",
    value: "Mumbai, India",
    icon: MapPin,
  },

  {
    title: "WhatsApp",
    value: "+91 7738832231",
    icon: MessageCircle,
  },

  {
    title: "Email",
    value: "jobiverse@outlook.com",
    icon: Mail,
  },
];



export default function ContactPage() {


  return (

    <main className="min-h-screen bg-white text-black">





      <PageHeader

        eyebrow="Contact JobiVerse"

        title="Let's Build Something Great Together."

        description="
        Whether you are hiring talent or searching for your next opportunity,
        our team is ready to help.
        "

      />






      {/* Contact Cards */}

      <section className="py-24">


        <div className="mx-auto max-w-7xl px-6 lg:px-8">


          <div className="grid gap-6 md:grid-cols-3">


            {contactCards.map((item)=>{


              const Icon = item.icon;


              return (

                <div

                  key={item.title}

                  className="
                  rounded-3xl
                  border
                  border-zinc-200
                  p-8
                  transition
                  hover:-translate-y-2
                  hover:shadow-xl
                  "

                >


                  <div
                    className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-black
                    text-white
                    "
                  >

                    <Icon className="h-7 w-7"/>

                  </div>



                  <h3 className="mt-6 text-xl font-semibold">

                    {item.title}

                  </h3>



                  <p className="mt-3 text-zinc-600">

                    {item.value}

                  </p>


                </div>

              );


            })}


          </div>


        </div>


      </section>








      {/* Enquiry */}

      <section className="border-t border-zinc-200 bg-zinc-50 py-24">


        <div className="mx-auto max-w-6xl px-6 lg:px-8">


          <div className="grid gap-8 md:grid-cols-2">



            <div
              className="
              rounded-3xl
              border
              border-zinc-200
              bg-white
              p-10
              "
            >


              <Building2 className="h-10 w-10"/>


              <h2 className="mt-6 text-3xl font-bold">

                Hiring Talent?

              </h2>


              <p className="mt-4 text-zinc-600">

                Share your hiring requirements and our recruitment
                experts will help you find the right candidates.

              </p>



              <button
                className="
                mt-8
                rounded-xl
                bg-black
                px-6
                py-3
                text-white
                transition
                hover:bg-zinc-800
                "
              >

                Submit Requirement

              </button>


            </div>







            <div
              className="
              rounded-3xl
              bg-black
              p-10
              text-white
              "
            >


              <UserRound className="h-10 w-10"/>


              <h2 className="mt-6 text-3xl font-bold">

                Looking For Opportunities?

              </h2>


              <p className="mt-4 text-zinc-400">

                Create your profile and discover career opportunities
                with JobiVerse.

              </p>



              <button
                className="
                mt-8
                rounded-xl
                bg-white
                px-6
                py-3
                text-black
                transition
                hover:bg-zinc-200
                "
              >

                Create Profile

              </button>


            </div>


          </div>


        </div>


      </section>








      {/* Social Connect */}

      <section className="py-20 text-center">


        <div className="mx-auto max-w-3xl px-6">


          <h2 className="text-3xl font-bold">

            Connect With JobiVerse

          </h2>



          <p className="mt-4 text-zinc-600">

            Follow our journey and stay updated with hiring insights.

          </p>





          <div className="mt-8 flex flex-wrap justify-center gap-4">


            <a

              href="https://www.linkedin.com/in/jobiverse"

              target="_blank"

              aria-label="JobiVerse on LinkedIn"

              className="
              inline-flex
              items-center
              gap-3
              rounded-xl
              border
              border-zinc-300
              px-6
              py-3
              transition
              hover:bg-black
              hover:text-white
              "

            >

              <span className="font-bold">
                in
              </span>


              <LinkedInIcon className="h-5 w-5" /> LinkedIn


            </a>





            <a

              href="https://wa.me/917738832231"

              target="_blank"

              className="
              inline-flex
              items-center
              gap-3
              rounded-xl
              bg-black
              px-6
              py-3
              text-white
              transition
              hover:bg-zinc-800
              "

            >

              <MessageCircle className="h-5 w-5"/>

              WhatsApp


            </a>





            <a

              href="https://www.instagram.com/jobiverse__/?utm_source=ig_web_button_share_sheet"

              target="_blank"

              aria-label="JobiVerse on Instagram"

              className="
              inline-flex
              items-center
              gap-3
              rounded-xl
              border
              border-zinc-300
              px-6
              py-3
              transition
              hover:bg-black
              hover:text-white
              "
            
            >

             <span className="text-lg">
              <InstagramIcon className="h-5 w-5" />
</span>


            </a>



          </div>


        </div>


      </section>







    </main>

  );

}
