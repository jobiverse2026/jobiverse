"use client";

import { useEffect } from "react";

export function MarkMessagesRead({orderId}:{orderId:string}){useEffect(()=>{void fetch("/api/marketplace/messages/read",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId})})},[orderId]);return null}
