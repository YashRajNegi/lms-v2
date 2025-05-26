import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/clerk-react";

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <h3 className="font-bold text-lg">About EduVerse</h3>
                        <p className="mt-2 text-sm">
                            EduVerse is dedicated to transforming the way you learn. Our platform offers a variety of courses designed to help you achieve your goals.
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Quick Links</h3>
                        <ul className="mt-2 space-y-1">
                            <li><a href="/" className="text-gray-400 hover:text-white">Home</a></li>
                            <li><a href="/courses" className="text-gray-400 hover:text-white">Courses</a></li>
                            <li><a href="/about" className="text-gray-400 hover:text-white">About</a></li>
                            <li><a href="/contact" className="text-gray-400 hover:text-white">Contact</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">Subscribe to Our Newsletter</h3>
                        <p className="mt-2 text-sm">Stay updated with the latest courses and offers.</p>
                        <form className="mt-2">
                            <input type="email" placeholder="Enter your email" className="px-2 py-1 rounded-l-md" />
                            <button type="submit" className="bg-purple-600 text-white px-4 py-1 rounded-r-md hover:bg-purple-700">Subscribe</button>
                        </form>
                    </div>
                </div>
                <div className="mt-6 border-t border-gray-700 pt-4 text-center">
                    <p className="text-sm">&copy; {new Date().getFullYear()} EduVerse. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer