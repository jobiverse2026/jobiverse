import { UniverseFeatureShowcase } from "@/components/universe/universe-feature-showcase";
import { CustomPortalCta } from "@/components/employer/custom-portal/CustomPortalCta";

export default function EmployersPage() {
  return <><UniverseFeatureShowcase universe="employer" /><div className="bg-[#f8f6fa] px-5 pb-24 sm:px-8"><div className="mx-auto max-w-[1400px]"><CustomPortalCta /></div></div></>;
}
