import React from 'react'
import { assets } from '../assets/assets'

const Educator = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <h1 className="text-4xl font-bold text-center">Meet Our Educators</h1>
            <p className="mt-4 text-lg text-center">
                Our educators are industry experts dedicated to providing high-quality education and support to our learners.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Example Educator Card */}
                <div className="border rounded-lg p-4 shadow-md">
                    <img src="path/to/educator1.jpg" alt="Educator 1" className="w-full h-32 object-cover rounded-lg" />
                    <h3 className="font-bold text-lg mt-2">John Doe</h3>
                    <p className="mt-1">Expert in Web Development with over 10 years of experience.</p>
                </div>
                <div className="border rounded-lg p-4 shadow-md">
                    <img src="path/to/educator2.jpg" alt="Educator 2" className="w-full h-32 object-cover rounded-lg" />
                    <h3 className="font-bold text-lg mt-2">Jane Smith</h3>
                    <p className="mt-1">Data Scientist with a passion for teaching and mentoring.</p>
                </div>
                <div className="border rounded-lg p-4 shadow-md">
                    <img src="path/to/educator3.jpg" alt="Educator 3" className="w-full h-32 object-cover rounded-lg" />
                    <h3 className="font-bold text-lg mt-2">Emily Johnson</h3>
                    <p className="mt-1">Experienced in Digital Marketing and Content Creation.</p>
                </div>
            </div>
            <div className="mt-8 text-center">
                <h2 className="text-2xl font-bold">Join Our Team of Educators!</h2>
                <p className="mt-2">If you're passionate about teaching and want to make a difference, consider joining us!</p>
                <button className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700">
                    Apply Now
                </button>
            </div>
        </div>
    )
}

export default Educator