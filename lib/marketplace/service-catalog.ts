export type ServiceAudience = "student" | "professional" | "employer" | "creator";
export type DeliveryMode = "human" | "ai" | "hybrid";

export type ServiceProvider = {
  name: string;
  title: string;
  rating: number;
  completedOrders: number;
  startingPrice: number;
  delivery: string;
  verified: boolean;
  listingId?: string;
  priceLabel?: string;
  isJobiVerse?: boolean;
  logoUrl?: string;
  ratingCount?: number;
  reputation?: string;
  isFeatured?: boolean;
  fitReason?: string | null;
  relevantExperience?: string | null;
};

export type MarketplaceService = {
  slug: string;
  title: string;
  description: string;
  audiences: ServiceAudience[];
  modes: DeliveryMode[];
  expertCount: number;
  startingPrice: number;
  aiStatus: "available" | "coming-soon";
  providers: ServiceProvider[];
};

const providers = {
  career: { name: "Shama Ansari", title: "Career Guidance Specialist", rating: 4.9, completedOrders: 86, startingPrice: 299, delivery: "45 min session", verified: true },
  resume: { name: "Aslam Ansari", title: "Resume & Profile Expert", rating: 4.8, completedOrders: 124, startingPrice: 149, delivery: "Within 24 hours", verified: true },
  interview: { name: "JobiVerse Expert Network", title: "Interview Coach", rating: 4.9, completedOrders: 73, startingPrice: 299, delivery: "60 min session", verified: true },
  hiring: { name: "JobiVerse Hiring Desk", title: "Recruitment Consultant", rating: 4.9, completedOrders: 48, startingPrice: 999, delivery: "Consultation", verified: true },
};

export const marketplaceServices: MarketplaceService[] = [
  { slug:"career-guidance",title:"Career Guidance",description:"Personalized direction, role selection and practical career planning.",audiences:["student","professional"],modes:["human","ai","hybrid"],expertCount:6,startingPrice:299,aiStatus:"coming-soon",providers:[providers.career] },
  { slug:"resume-builder",title:"Resume & CV Services",description:"Build, improve and optimize an ATS-ready professional resume.",audiences:["student","professional"],modes:["human","ai","hybrid"],expertCount:9,startingPrice:149,aiStatus:"coming-soon",providers:[providers.resume] },
  { slug:"cv-templates",title:"Editable CV Templates",description:"Explore original, professionally designed CV templates you can edit and personalize.",audiences:["student","professional"],modes:["human"],expertCount:0,startingPrice:0,aiStatus:"coming-soon",providers:[] },
  { slug:"interview-preparation",title:"Interview Preparation",description:"Role-specific mock interviews with structured, actionable feedback.",audiences:["student","professional"],modes:["human","ai","hybrid"],expertCount:7,startingPrice:299,aiStatus:"coming-soon",providers:[providers.interview] },
  { slug:"skill-roadmaps",title:"Skill Roadmaps",description:"A focused learning roadmap aligned with the role you want.",audiences:["student","professional"],modes:["human","ai"],expertCount:5,startingPrice:499,aiStatus:"coming-soon",providers:[providers.career] },
  { slug:"linkedin-optimization",title:"LinkedIn Optimization",description:"Improve positioning, discoverability and professional credibility.",audiences:["professional"],modes:["human","ai","hybrid"],expertCount:4,startingPrice:299,aiStatus:"coming-soon",providers:[providers.resume] },
  { slug:"portfolio-building",title:"Portfolio Building",description:"Present projects, achievements and expertise through a premium portfolio.",audiences:["student","professional"],modes:["human","hybrid"],expertCount:5,startingPrice:499,aiStatus:"coming-soon",providers:[providers.resume] },
  { slug:"employability-check",title:"Employability Check",description:"Understand current readiness and the most valuable next improvements.",audiences:["student"],modes:["human","ai","hybrid"],expertCount:4,startingPrice:299,aiStatus:"coming-soon",providers:[providers.career] },
  { slug:"job-description-writing",title:"Job Description Writing",description:"Clear, market-ready job descriptions designed to attract suitable talent.",audiences:["employer"],modes:["human","ai","hybrid"],expertCount:3,startingPrice:499,aiStatus:"coming-soon",providers:[providers.hiring] },
  { slug:"hiring-consultation",title:"Hiring Consultation",description:"Expert support for requirements, process design and talent strategy.",audiences:["employer"],modes:["human","hybrid"],expertCount:4,startingPrice:999,aiStatus:"coming-soon",providers:[providers.hiring] },
  { slug:"candidate-screening",title:"Candidate Screening",description:"Structured profile evaluation aligned with role requirements.",audiences:["employer"],modes:["human","ai","hybrid"],expertCount:4,startingPrice:499,aiStatus:"coming-soon",providers:[providers.hiring] },
  { slug:"sell-cv-templates",title:"Sell CV Templates",description:"Publish original editable CV designs for JobiVerse customers.",audiences:["creator"],modes:["human"],expertCount:0,startingPrice:0,aiStatus:"coming-soon",providers:[] },
  { slug:"career-mentorship",title:"Career Mentorship",description:"Offer or book structured one-to-one industry mentorship.",audiences:["student","professional","creator"],modes:["human"],expertCount:8,startingPrice:499,aiStatus:"coming-soon",providers:[providers.career] },
];

export function getMarketplaceService(slug: string) {
  return marketplaceServices.find(service => service.slug === slug);
}
