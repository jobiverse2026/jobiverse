"use client";

import {
  useEffect,
  useState
} from "react";

import { motion } from "framer-motion";


export default function CursorGlow() {


  const [position,setPosition] =
  useState({
    x:0,
    y:0,
  });



  useEffect(()=>{


    function handleMouseMove(
      event:MouseEvent
    ){

      setPosition({

        x:event.clientX,

        y:event.clientY,

      });

    }



    window.addEventListener(
      "mousemove",
      handleMouseMove
    );



    return ()=>{

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );

    };


  },[]);



  return (

    <motion.div

      animate={{

        x:
        position.x - 250,

        y:
        position.y - 250,

      }}


      transition={{

        type:"spring",

        damping:40,

        stiffness:120,

        mass:0.8

      }}


      className="
      pointer-events-none
      fixed
      left-0
      top-0
      z-0
      h-[500px]
      w-[500px]
      rounded-full
      bg-blue-400/10
      blur-[120px]
      "

    />

  );

}