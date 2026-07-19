"use client";

import { motion } from "framer-motion";


const particles = [
  {
    size: 6,
    left: "10%",
    top: "20%",
    duration: 8,
    delay: 0,
  },
  {
    size: 4,
    left: "25%",
    top: "70%",
    duration: 10,
    delay: 1,
  },
  {
    size: 8,
    left: "45%",
    top: "30%",
    duration: 12,
    delay: 2,
  },
  {
    size: 5,
    left: "65%",
    top: "75%",
    duration: 9,
    delay: 1.5,
  },
  {
    size: 7,
    left: "80%",
    top: "25%",
    duration: 11,
    delay: 3,
  },
  {
    size: 4,
    left: "90%",
    top: "60%",
    duration: 7,
    delay: 0.5,
  },
  {
    size: 6,
    left: "35%",
    top: "90%",
    duration: 13,
    delay: 2.5,
  },
  {
    size: 5,
    left: "55%",
    top: "10%",
    duration: 10,
    delay: 1,
  },
];


export default function FloatingParticles() {


  return (

    <div
      className="
      pointer-events-none
      absolute
      inset-0
      overflow-hidden
      "
    >

      {
        particles.map(
          (particle,index)=>(

          <motion.div

            key={index}


            initial={{
              opacity:0,
            }}


            animate={{

              y:[
                0,
                -40,
                20,
                0
              ],

              x:[
                0,
                20,
                -20,
                0
              ],

              opacity:[
                0.2,
                0.8,
                0.4,
                0.2
              ],

            }}


            transition={{

              duration:
              particle.duration,

              delay:
              particle.delay,

              repeat:
              Infinity,

              ease:
              "easeInOut"

            }}


            style={{

              width:
              particle.size,

              height:
              particle.size,

              left:
              particle.left,

              top:
              particle.top,

            }}


            className="
            absolute
            rounded-full
            bg-blue-500/40
            blur-[1px]
            "

          />

        ))
      }


    </div>

  );

}