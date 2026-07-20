"use client";

import Link from "next/link";

import {
  Mail,
  Phone,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { InstagramIcon, LinkedInIcon, WhatsAppIcon } from "@/components/common/social-icons";



const companyLinks = [
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Services",
    href: "/services",
  },
  {
    name: "Pricing",
    href: "/pricing",
  },
  {
    name: "Why JobiVerse",
    href: "/why-jobiverse",
  },
  {
    name: "Industries",
    href: "/industries",
  },
  {
    name: "Careers",
    href: "/career-services",
  },
  {
    name: "Earn with JobiVerse",
    href: "/earn-with-jobiverse",
  },
  {
    name: "Events & Workshops",
    href: "/events",
  },
  {
    name: "Contact",
    href: "/contact",
  },
];



const employerLinks = [
  {
    name: "Hire Talent",
    href: "/employers",
  },
  {
    name: "Submit Requirement",
    href: "/employers/requirements/new",
  },
  {
    name: "Employer Login",
    href: "/login/employer",
  },
];



const candidateLinks = [
  {
    name: "Find Jobs",
    href: "/candidates",
  },
  {
    name: "Career Services",
    href: "/career-services",
  },
  {
    name: "Candidate Login",
    href: "/login/candidate",
  },
  {
    name: "Students & Graduates",
    href: "/students",
  },
  {
    name: "Campus Partnerships",
    href: "/campus-partnerships",
  },
];



const legalLinks = [
  {
    name: "Privacy Policy",
    href: "/privacy-policy",
  },
  {
    name: "Terms & Conditions",
    href: "/terms",
  },
  {
    name: "Refund Policy",
    href: "/refund-policy",
  },
];





export function Footer() {


  return (


    <footer className="jv-noise relative overflow-hidden border-t border-white/10 bg-[radial-gradient(circle_at_12%_15%,rgba(255,255,255,.12),transparent_24rem),linear-gradient(135deg,#09090b,#27272a_58%,#3f3f46)] text-white">

      <div aria-hidden="true" className="absolute -right-48 top-12 h-[520px] w-[820px] rotate-6 rounded-[50%] border border-white/10" />
      <div aria-hidden="true" className="absolute -right-24 top-32 h-[350px] w-[650px] -rotate-3 rounded-[50%] border border-white/[.07]" />


      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8">


        <div className="grid gap-12 lg:grid-cols-6">



          {/* Brand */}


          <div className="lg:col-span-2">


            <h2 className="bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
              JobiVerse
            </h2>



            <p className="mt-4 text-lg text-zinc-300">

              One intelligent hiring universe.


            </p>




            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">

              India's next generation hiring ecosystem
              connecting companies, candidates and technology.

            </p>




            <div className="mt-8 space-y-4 text-sm text-zinc-400">



              <div className="flex items-center gap-3">

                <MapPin className="h-4 w-4"/>

                Mumbai, India

              </div>





              <div className="flex items-center gap-3">

                <Phone className="h-4 w-4"/>

                +91 7738832231

              </div>





              <div className="flex items-center gap-3">

                <Mail className="h-4 w-4"/>

                jobiverse@outlook.com

              </div>


            </div>


          </div>






          <FooterColumn
            title="Company"
            links={companyLinks}
          />



          <FooterColumn
            title="Employers"
            links={employerLinks}
          />



          <FooterColumn
            title="Professionals"
            links={candidateLinks}
          />



          <FooterColumn
            title="Legal"
            links={legalLinks}
          />



        </div>









        {/* Bottom */}


        <div

          className="
          mt-16
          flex
          flex-col
          gap-6
          border-t
          border-zinc-800
          pt-8
          md:flex-row
          md:items-center
          md:justify-between
          "

        >



          <p className="text-sm text-zinc-500">


            © {new Date().getFullYear()} JobiVerse.
            All rights reserved.


          </p>






          {/* Social Icons */}


          <div className="flex items-center gap-4">





            {/* LinkedIn */}


            <Link

              href="https://www.linkedin.com/in/jobiverse"

              target="_blank"

              aria-label="JobiVerse on LinkedIn"

              className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-zinc-700
              text-zinc-400
              transition
              hover:border-white
              hover:text-white
              "

            >

              <LinkedInIcon className="h-4 w-4" />


            </Link>








            {/* WhatsApp */}


            <Link

              href="https://wa.me/917738832231"

              target="_blank"

              aria-label="Chat with JobiVerse on WhatsApp"

              className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-zinc-700
              text-zinc-400
              transition
              hover:border-white
              hover:text-white
              "

            >

              <WhatsAppIcon className="h-4 w-4"/>


            </Link>








            {/* Instagram */}


            <Link

              href="https://www.instagram.com/jobiverse__/?utm_source=ig_web_button_share_sheet"

              target="_blank"

              aria-label="JobiVerse on Instagram"

              className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-zinc-700
              text-zinc-400
              transition
              hover:border-white
              hover:text-white
              "

            >

              <InstagramIcon className="h-4 w-4" />


            </Link>








            {/* Email */}


            <Link

              href="mailto:jobiverse@outlook.com"

              aria-label="Email JobiVerse on Outlook"

              className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              border
              border-zinc-700
              text-zinc-400
              transition
              hover:border-white
              hover:text-white
              "

            >

              <Mail className="h-4 w-4"/>


            </Link>




          </div>


        </div>


      </div>


    </footer>


  );


}







function FooterColumn({

  title,

  links,

}: {

  title:string;

  links:{
    name:string;
    href:string;
  }[];

}) {


  return (

    <div>


      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">

        {title}

      </h3>




      <ul className="mt-5 space-y-3">


        {links.map((link)=>(


          <li key={link.name}>


            <Link

              href={link.href}

              className="
              group
              flex
              items-center
              gap-1
              text-sm
              text-zinc-400
              transition
              hover:text-white
              "

            >

              {link.name}



              <ArrowUpRight

                className="
                h-3
                w-3
                opacity-0
                transition
                group-hover:opacity-100
                "

              />


            </Link>


          </li>


        ))}


      </ul>


    </div>

  );

}
