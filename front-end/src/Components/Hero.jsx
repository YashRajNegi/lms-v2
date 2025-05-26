import React from 'react'
import { assets } from '../assets/assets'
import SearchBar from './SearchBar'

const Hero = () => {
  return (

    <div className='flex flex-col items-center justify-center w-full md:pt-46 pt-20 px-7 md:px-0 space-y-7 text-center   md:pb-48 pb-24' style={{ backgroundImage: `url(${assets.BG_Home})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>

      
      <h1 className='lg:text-[48px] text-[32px] relative font-bold text-gray-200 max-w-5xl mx-auto'>Transform the way you learn with next-gen <span className='text-blue-700'>E - Learning!</span><img src={assets.Sketch} alt="Sketch" className='md:block hidden absolute top-15 right-60 w-28'/></h1>

      <p className='md:block hidden text-gray-400 max-w-2xl mx-auto'>Experience AI-powered learning that’s smart, interactive, and tailored to help you achieve your goals anytime, anywhere!</p>

      <p className='md:hidden text-gray-400 max-w-sm mx-auto'>Experience AI-powered learning that’s smart, interactive, and tailored to help you achieve your goals anytime, anywhere!</p>
      
      <SearchBar />
      
    </div>
  )
}

export default Hero