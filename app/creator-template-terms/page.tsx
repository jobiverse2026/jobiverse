import { LegalDocument, type LegalSection } from "@/components/legal/legal-document";
const sections:LegalSection[]=[
{title:"Creator declaration",content:<p>You confirm that the template is your original work or that you hold sufficient rights to offer it. Do not upload copied marketplace templates, confidential documents, unlicensed assets or personal data without authority.</p>},
{title:"No separate certificate required",content:<p>JobiVerse does not require a separate commercial-licence document when you genuinely created the template. Your versioned acceptance during upload is your declaration. Supporting evidence may be requested if ownership is disputed.</p>},
{title:"Rights granted to JobiVerse",content:<p>You retain ownership of original work and grant JobiVerse a non-exclusive licence to store, inspect, moderate, preview, promote, sell, deliver and technically adapt it only as needed to operate the marketplace.</p>},
{title:"Customer licence",content:<p>After verified payment, the customer receives a non-exclusive, non-transferable personal licence to edit the template and use resulting CVs for their own applications. The source template may not be resold, redistributed, sublicensed or added to a competing template library.</p>},
{title:"Compensation and moderation",content:<p>Eligible earnings follow the creator workspace payout workflow. JobiVerse may pause, reject or remove a template for quality, technical, ownership or infringement concerns. Approval is not a legal determination of ownership.</p>},
{title:"Complaints and version",content:<p>Rights complaints may be sent with evidence to jobiverse@outlook.com. Terms version: 2026-07-18-v1. Material changes may require fresh acceptance.</p>},
];
export default function CreatorTemplateTermsPage(){return <LegalDocument title="Creator Template Terms" description="Ownership declarations and customer licence boundaries for editable CV templates." sections={sections}/>;}
