"use client";
import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { BookingQuiz } from "@/components/booking/BookingQuiz";

type ContextValue={openBookingQuiz:()=>void;openBookingQuizAt:(step:number)=>void;closeBookingQuiz:()=>void;isOpen:boolean};
const Context=createContext<ContextValue|null>(null);
export function BookingQuizProvider({children}:{children:ReactNode}){
  const [isOpen,setOpen]=useState(false); const opener=useRef<HTMLElement|null>(null);
  const [startStep,setStartStep]=useState<number|null>(null);
  const openBookingQuiz=()=>{opener.current=document.activeElement as HTMLElement;setStartStep(null);setOpen(true)};
  const openBookingQuizAt=(step:number)=>{opener.current=document.activeElement as HTMLElement;setStartStep(step);setOpen(true)};
  const closeBookingQuiz=()=>{setOpen(false);setTimeout(()=>opener.current?.focus(),0)};
  return <Context.Provider value={{openBookingQuiz,openBookingQuizAt,closeBookingQuiz,isOpen}}>{children}<BookingQuiz open={isOpen} startStep={startStep} onClose={closeBookingQuiz}/></Context.Provider>;
}
export function useBookingQuiz(){const value=useContext(Context);if(!value)throw new Error("useBookingQuiz must be used inside BookingQuizProvider");return value;}
