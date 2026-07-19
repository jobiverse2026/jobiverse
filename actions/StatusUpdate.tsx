"use client";


import { updateCandidateStatus }
from "@/actions/candidate-status";

import { useState } from "react";


export default function StatusUpdate({
id,
currentStatus
}:{
id:string;
currentStatus:string;
}){


const [loading,setLoading]=useState(false);



async function changeStatus(
e:React.ChangeEvent<HTMLSelectElement>
){


setLoading(true);


await updateCandidateStatus(
id,
e.target.value
);


window.location.reload();


}



return (

<select
defaultValue={currentStatus}
disabled={loading}
onChange={changeStatus}
className="
rounded-xl
border
px-4
py-2
"
>


<option>
Submitted
</option>


<option>
Screening
</option>


<option>
Client Submitted
</option>


<option>
Interview
</option>


<option>
Selected
</option>


<option>
Rejected
</option>


</select>

);


}