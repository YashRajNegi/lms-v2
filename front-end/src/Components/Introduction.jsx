import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";


const Introduction = () => {

  const {openSignIn} = useClerk();
  const navigate = useNavigate();
  const {user} = useUser();
  const checkLogIN = () => {
      if (user) {
          Course();
      } else {
          openSignIn();
      }
  };
    
  const Course = () =>{
      navigate("/course");
  }

  return (
    <div className='w-full pt-16 pb-6 md:px-18 px-6'>
        <div className='max-w-full flex flex-col md:flex-row justify-between items-center shadow-lg gap-12 bg-gray-50 border border-gray-300 md:py-20 py-10 md:px-20 px-8'>
          <div className='w-full md:w-1/2'>
            <video className="w-full h-auto rounded-lg object-cover" autoPlay loop muted playsInline>
              <source src={assets.Intro} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className='w-full md:w-1/2'>
            <h1 className='text-blue-700 underline md:underline-offset-20 underline-offset-12 font-extrabold lg:text-6xl text-4xl text-center'>E - Learning</h1>
            <p className='text-center text-lg md:mt-12 mt-8 text-gray-700'>It has the power to transform your life, equipping you with the skills and knowledge to unlock new opportunities and achieve your full potential.</p>
            <button onClick={checkLogIN} className="text-sm md:mt-8 mt-6 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br text-white md:px-12 md:py-4 px-8 py-2.5 rounded-lg hover:bg-red-600 transition">Get Started</button>
          </div>
        </div>
    </div>
  )
}

export default Introduction