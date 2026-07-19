"use client";

import { Services } from "@/components/home/services";
import { HowWeWork } from "@/components/services/how-we-work";
import { EmployerBenefits } from "@/components/services/employer-benefits";
import { CandidateBenefits } from "@/components/services/candidate-benefits";



export default function ServicesClient() {


  return (

    <>

      <Services />

      <HowWeWork />

      <EmployerBenefits />

      <CandidateBenefits />

    </>

  );


}