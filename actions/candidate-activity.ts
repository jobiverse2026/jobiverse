"use server";


import { requireRole } from "@/lib/auth/authorization";



export async function createCandidateActivity(
candidateId:string,
action:string,
description:string
){


const { supabase, user } = await requireRole(["admin", "recruiter"]);



const {
error
}=await supabase

.from("candidate_activities")

.insert({

candidate_id:candidateId,

actor_id:user.id,

action,

description

});



if(error){

throw new Error(
error.message
);

}


}
