import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-bold text-center">About EduVerse</h1>
      <p className="mt-4 text-lg text-center">
        EduVerse is dedicated to transforming the way you learn. Our platform offers a variety of courses designed to help you achieve your goals.
      </p>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="font-bold text-xl">Our Mission</h2>
          <p className="mt-2">To provide accessible, high-quality education to learners around the world.</p>
        </div>
        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="font-bold text-xl">Our Vision</h2>
          <p className="mt-2">To empower individuals through knowledge and skills for a better future.</p>
        </div>
      </div>

      {/* Additional Sections */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-center">Our History</h2>
        <p className="mt-2 text-lg text-center">
          Founded in 2021, EduVerse started as a small initiative to make quality education accessible to everyone. Over the years, we have grown into a comprehensive platform offering a wide range of courses.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-center">Meet Our Team</h2>
        <p className="mt-2 text-lg text-center">
          Our team consists of experienced educators, industry professionals, and passionate learners who are committed to providing the best learning experience.
        </p>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-center">Our Values</h2>
        <ul className="mt-2 list-disc list-inside text-lg text-center">
          <li>Integrity: We uphold the highest standards of integrity in all our actions.</li>
          <li>Innovation: We strive to innovate and improve our offerings continuously.</li>
          <li>Inclusivity: We believe in providing equal opportunities for all learners.</li>
        </ul>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold">Join Us Today!</h2>
        <p className="mt-2">Sign up now to access exclusive courses and resources that will help you achieve your learning goals.</p>
       
      </div>
    </div>
  )
}

export default About