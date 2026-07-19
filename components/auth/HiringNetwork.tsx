"use client";

import { motion } from "framer-motion";


const nodes = [
  {
    name: "Mumbai",
    x: "20%",
    y: "35%",
  },
  {
    name: "Career Services",
    x: "70%",
    y: "20%",
  },
  {
    name: "Hiring",
    x: "35%",
    y: "75%",
  },
  {
    name: "Onboarding",
    x: "75%",
    y: "70%",
  },
  {
    name: "Career Growth",
    x: "50%",
    y: "45%",
  },
];


const connections = [
  {
    from: 0,
    to: 4,
  },
  {
    from: 4,
    to: 1,
  },
  {
    from: 4,
    to: 2,
  },
  {
    from: 4,
    to: 3,
  },
];


export default function HiringNetwork() {


  return (

    <div
      className="
      pointer-events-none
      absolute
      inset-0
      overflow-hidden
      opacity-30
      "
    >


      <svg
        className="
        absolute
        inset-0
        h-full
        w-full
        "
      >


        {
          connections.map(
            (connection,index)=>{


              const start =
              nodes[connection.from];


              const end =
              nodes[connection.to];


              return (

                <motion.line

                  key={index}

                  x1={start.x}
                  y1={start.y}

                  x2={end.x}
                  y2={end.y}

                  stroke="rgba(59,130,246,0.35)"

                  strokeWidth="1"

                  initial={{
                    opacity:0
                  }}

                  animate={{
                    opacity:[
                      0.2,
                      0.8,
                      0.2
                    ]
                  }}

                  transition={{
                    duration:3,
                    repeat:Infinity,
                    delay:index * 0.5
                  }}

                />

              );


            }

          )
        }


      </svg>





      {
        nodes.map(
          (node,index)=>(

            <motion.div

              key={index}

              style={{
                left:node.x,
                top:node.y
              }}

              animate={{
                scale:[
                  1,
                  1.2,
                  1
                ],

                opacity:[
                  0.5,
                  1,
                  0.5
                ]
              }}

              transition={{
                duration:4,
                repeat:Infinity,
                delay:index*0.4
              }}

              className="
              absolute
              flex
              items-center
              gap-2
              "
            >

              <span
                className="
                h-3
                w-3
                rounded-full
                bg-blue-500
                shadow-lg
                shadow-blue-500/50
                "
              />


              <span
                className="
                hidden
                text-xs
                font-medium
                text-zinc-500
                md:block
                "
              >
                {node.name}
              </span>


            </motion.div>

          )

        )
      }



    </div>

  );

}