import type { Metadata, Viewport } from "next";
import { Suspense } from "react";

import "./globals.css";

import AuthProvider from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/navbar";
import LogoutSuccessNotice from "@/components/auth/LogoutSuccessNotice";
import { GlobalFooter } from "@/components/layout/global-footer";
import { GlobalMessagesButton } from "@/components/messages/global-messages-button";
import { AttachmentNameEnhancer } from "@/components/forms/attachment-name-enhancer";
import { GlobalActionSuccess } from "@/components/forms/global-action-success";
import { ConsentManager } from "@/components/privacy/consent-manager";
import { WebVitals } from "@/components/analytics/web-vitals";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { MilestoneCelebration } from "@/components/motion/milestone-celebration";
import { GlobalMotionLayer } from "@/components/motion/global-motion-layer";


export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jobiverse.in"
  ),
  title: {
    default: "JobiVerse - India's Hiring & Career Platform",
    template: "%s | JobiVerse",
  },
  description:
    "Technology-driven hiring, career growth and expert services across India. Every Hire. Every Career. One Universe.",
  applicationName:"JobiVerse",
  manifest:"/manifest.webmanifest",
  appleWebApp:{capable:true,title:"JobiVerse",statusBarStyle:"black-translucent"},
  formatDetection:{telephone:false},
  keywords:["recruitment company India","IT recruitment","non-IT hiring","career services","resume services","HR technology","Mumbai recruitment"],
  authors:[{name:"JobiVerse"}],
  creator:"JobiVerse",
  publisher:"JobiVerse",
  alternates:{canonical:"/"},
  openGraph:{type:"website",locale:"en_IN",siteName:"JobiVerse",url:"/",title:"JobiVerse - India's Hiring & Career Platform",description:"Recruitment expertise, career services and intelligent HR technology for employers, professionals and students."},
  twitter:{card:"summary",title:"JobiVerse - India's Hiring & Career Platform",description:"Every Hire. Every Career. One Universe."},
  robots:{index:true,follow:true,googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}},
};


export const viewport: Viewport = {
  themeColor: "#18181b",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en-IN" data-scroll-behavior="smooth">
      <body>
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:"JobiVerse",legalName:"MOHAMMAD AMIR MOHAMMAD ASLAM ANSARI",url:process.env.NEXT_PUBLIC_SITE_URL??"https://jobiverse.in",logo:`${process.env.NEXT_PUBLIC_SITE_URL??"https://jobiverse.in"}/images/branding/jobiverse-logo.webp`,email:"jobiverse@outlook.com",telephone:"+91-7738832231",address:{"@type":"PostalAddress",streetAddress:"Room No. 25, Plot No. 70, Malad (W)",addressLocality:"Mumbai",addressRegion:"Maharashtra",postalCode:"400095",addressCountry:"IN"},sameAs:["https://www.linkedin.com/in/jobiverse","https://www.instagram.com/jobiverse__/","https://www.facebook.com/profile.php?id=61592181941812","https://www.youtube.com/@Jobiverse2026"],description:"Indian recruitment and HR technology platform supporting employers, professionals, students and service creators."})}}/>
        <AuthProvider>
          <Navbar />
          <LogoutSuccessNotice />
          <GlobalMessagesButton />
          <AttachmentNameEnhancer />
          <Suspense fallback={null}><GlobalActionSuccess /><MilestoneCelebration /></Suspense>
          <ConsentManager />
          <WebVitals />
          <PwaRegister />
          <GlobalMotionLayer />
          <div id="main-content" tabIndex={-1}>{children}</div>
          <GlobalFooter />
        </AuthProvider>
      </body>
    </html>
  );

}
