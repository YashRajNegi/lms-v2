import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import { useNavigate, useLocation } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";

const Navbar = () => {
    const { openSignIn } = useClerk();
    const { user } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    const [active, setActive] = useState("");
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const currentPath = location.pathname;
        if (currentPath === "/") setActive("home");
        else if (currentPath === "/course") setActive("course");
        else if (currentPath === "/educator") setActive("educator");
        else if (currentPath === "/about") setActive("about");
        else if (currentPath === "/contact") setActive("contact");
    }, [location.pathname]);

    const handleNavigation = (path, tab) => {
        setActive(tab);
        navigate(path);
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <div className="bg-white shadow-md sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavigation("/", "home")}>
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl font-bold">E</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                            EduVerse
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button 
                            onClick={() => handleNavigation("/", "home")} 
                            className={`text-sm font-medium transition-colors duration-200 ${
                                active === "home" 
                                ? "text-purple-600" 
                                : "text-gray-600 hover:text-purple-600"
                            }`}
                        >
                            Home
                        </button>

                        <button 
                            onClick={() => user ? handleNavigation("/course", "course") : handleNavigation("/courses", "course")} 
                            className={`text-sm font-medium transition-colors duration-200 ${
                                active === "course" 
                                ? "text-purple-600" 
                                : "text-gray-600 hover:text-purple-600"
                            }`}
                        >
                            Courses
                        </button>

                        <button 
                            onClick={() => handleNavigation("/educator", "educator")} 
                            className={`text-sm font-medium transition-colors duration-200 ${
                                active === "educator" 
                                ? "text-purple-600" 
                                : "text-gray-600 hover:text-purple-600"
                            }`}
                        >
                            Educator
                        </button>

                        <button 
                            onClick={() => handleNavigation("/about", "about")} 
                            className={`text-sm font-medium transition-colors duration-200 ${
                                active === "about" 
                                ? "text-purple-600" 
                                : "text-gray-600 hover:text-purple-600"
                            }`}
                        >
                            About
                        </button>

                        <button 
                            onClick={() => handleNavigation("/contact", "contact")} 
                            className={`text-sm font-medium transition-colors duration-200 ${
                                active === "contact" 
                                ? "text-purple-600" 
                                : "text-gray-600 hover:text-purple-600"
                            }`}
                        >
                            Contact
                        </button>

                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search courses..."
                                className="w-48 px-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleSearch}
                            />
                        </div>

                        {/* Auth Button */}
                        {user ? (
                            <UserButton />
                        ) : (
                            <button 
                                onClick={() => openSignIn()} 
                                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-full hover:from-purple-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                Sign In
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        {user ? (
                            <UserButton />
                        ) : (
                            <button 
                                onClick={() => openSignIn()} 
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
