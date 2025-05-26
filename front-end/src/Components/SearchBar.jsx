import React,{useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useUser} from "@clerk/clerk-react";

const SearchBar = () => {
  
  const {openSignIn} = useClerk();
  const {user} = useUser();
  const navigate = useNavigate();
  const checkLogIN = () => {
    if (!user) {
      openSignIn();
    } else {
      navigate('./course');
    }  
  };

  

  return (
    <div className=' md:h-14 h-12 flex items-center bg-white rounded-sm hover:scale-105 hover:transition duration-300 mt-3'>
      <button type='button' onClick={checkLogIN} className='bg-transparent rounded text-gray-500 text-center md:px-12 px-6 md:py-4 py-3'>View All Courses</button>
    </div>
  )
}

export default SearchBar
