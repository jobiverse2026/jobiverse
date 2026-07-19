"use client";

import { useEffect } from "react";
export function MarkSupportRead({conversationId}:{conversationId:string}){useEffect(()=>{void fetch("/api/messages/support/read",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({conversationId})})},[conversationId]);return null}
