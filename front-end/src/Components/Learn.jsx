import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";


const Learn = () => {
    const navigate  = useNavigate();
    const {openSignIn} = useClerk();
    const {user} = useUser();
    const checkLogIN = () => {
        if (user) {
            navigate("/course");
        } else {
            openSignIn();
        }
    };
    const Learnmore=()=>{
        navigate("/about");
    }
    return (
        <div className='w-full block items-center md:pt-30 sm:pt-24 pt-12 md:pb-6 sm:pb-12 pb-3'>

            <h1 className='md:text-[32px] text-xl text-gray-800 font-bold tracking-wide'>Learn anything, anytime, anywhere</h1>
            <p className='md:text-lg text-sm md:px-0 px-16 mt-4'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi amet voluptatum id.</p>
            <div className='flex flex-wrap justify-center items-center md:gap-4 gap-1 md:mt-10 mt-6 md:mb-32 mb-20'>
                <button onClick={checkLogIN} className='text-sm text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br font-medium rounded-lg md:px-12 md:py-4 px-6 py-2'>Get Started</button>
                <button onClick={Learnmore} className='flex flex-wrap justify-center items-center rounded-md  hover:bg-gray-200/60 gap-1.5 md:px-8 md:py-3.75 px-4 py-2'>Learn More <img className='h-5' src={assets.RightArrow} alt="Arrow"/></button>

            </div>

        </div>
    )
}

export default Learn