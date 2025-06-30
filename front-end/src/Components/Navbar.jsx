import React, { useState, useEffect, useRef } from 'react';
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const searchInputRef = useRef(null);

    useEffect(() => {
        const currentPath = location.pathname;
        if (currentPath === "/") setActive("home");
        else if (currentPath === "/course") setActive("course");
        else if (currentPath === "/educator") setActive("educator");
        else if (currentPath === "/about") setActive("about");
        else if (currentPath === "/contact") setActive("contact");
        setMobileMenuOpen(false); // Close mobile menu on route change
        setMobileSearchOpen(false); // Close search on route change
    }, [location.pathname]);

    useEffect(() => {
        if (mobileSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [mobileSearchOpen]);

    const handleNavigation = (path, tab) => {
        setActive(tab);
        navigate(path);
        setMobileMenuOpen(false); // Close mobile menu after navigation
        setMobileSearchOpen(false); // Close search after navigation
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
            setMobileMenuOpen(false);
            setMobileSearchOpen(false);
        }
    };

    // Click outside to close mobile search
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setMobileSearchOpen(false);
            }
        }
        if (mobileSearchOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileSearchOpen]);

    return (
        <div className="bg-white shadow-md sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Mobile Navbar */}
                <div className="flex md:hidden justify-between items-center h-16 relative">
                    {/* Hamburger */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-purple-600 focus:outline-none"
                        aria-label="Toggle menu"
                    >
                        <svg className="h-7 w-7" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                    {/* Logo Centered */}
                    <div className="flex-1 flex justify-center absolute left-0 right-0 pointer-events-none">
                        <div className="flex items-center space-x-2 pointer-events-auto cursor-pointer" onClick={() => handleNavigation("/", "home")}> 
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xl font-bold">E</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                                E-learning
                            </span>
                        </div>
                    </div>
                    {/* Search Icon & User */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-purple-600 focus:outline-none"
                            aria-label="Search"
                        >
                            {/* Search icon */}
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" strokeWidth="2" />
                            </svg>
                        </button>
                        {user ? (
                            <div className="ml-1"><UserButton /></div>
                        ) : (
                            <button 
                                onClick={() => openSignIn()} 
                                className="ml-1 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-full"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                    {/* Mobile Search Dropdown */}
                    {mobileSearchOpen && (
                        <div className="absolute top-16 left-0 w-full bg-white shadow-lg z-50 px-4 py-3 flex items-center animate-slide-down">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search courses..."
                                className="w-full px-4 py-2 text-base border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleSearch}
                            />
                        </div>
                    )}
                </div>
                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white shadow-lg rounded-b-lg py-4 px-2 flex flex-col space-y-2 animate-slide-down">
                        <button onClick={() => handleNavigation("/", "home")} className={`text-base font-medium text-left px-4 py-2 rounded ${active === "home" ? "text-purple-600" : "text-gray-700 hover:text-purple-600"}`}>Home</button>
                        <button onClick={() => user ? handleNavigation("/course", "course") : handleNavigation("/courses", "course")} className={`text-base font-medium text-left px-4 py-2 rounded ${active === "course" ? "text-purple-600" : "text-gray-700 hover:text-purple-600"}`}>Courses</button>
                        <button onClick={() => handleNavigation("/educator", "educator")} className={`text-base font-medium text-left px-4 py-2 rounded ${active === "educator" ? "text-purple-600" : "text-gray-700 hover:text-purple-600"}`}>Educator</button>
                        <button onClick={() => handleNavigation("/about", "about")} className={`text-base font-medium text-left px-4 py-2 rounded ${active === "about" ? "text-purple-600" : "text-gray-700 hover:text-purple-600"}`}>About</button>
                        <button onClick={() => handleNavigation("/contact", "contact")} className={`text-base font-medium text-left px-4 py-2 rounded ${active === "contact" ? "text-purple-600" : "text-gray-700 hover:text-purple-600"}`}>Contact</button>
                    </div>
                )}
                {/* Desktop Navbar */}
                <div className="hidden md:flex items-center h-16 justify-between">
                    {/* Logo and Brand */}
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavigation("/", "home")}> 
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xl font-bold">E</span>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                            E-learning
                        </span>
                    </div>
                    {/* Desktop Navigation */}
                    <div className="flex items-center space-x-8">
                        <button 
                            onClick={() => handleNavigation("/", "home")}
                            className={`text-sm font-medium transition-colors duration-200 ${active === "home" ? "text-purple-600" : "text-gray-600 hover:text-purple-600"}`}
                        >
                            Home
                        </button>
                        <button 
                            onClick={() => user ? handleNavigation("/course", "course") : handleNavigation("/courses", "course")}
                            className={`text-sm font-medium transition-colors duration-200 ${active === "course" ? "text-purple-600" : "text-gray-600 hover:text-purple-600"}`}
                        >
                            Courses
                        </button>
                        <button 
                            onClick={() => handleNavigation("/educator", "educator")}
                            className={`text-sm font-medium transition-colors duration-200 ${active === "educator" ? "text-purple-600" : "text-gray-600 hover:text-purple-600"}`}
                        >
                            Educator
                        </button>
                        <button 
                            onClick={() => handleNavigation("/about", "about")}
                            className={`text-sm font-medium transition-colors duration-200 ${active === "about" ? "text-purple-600" : "text-gray-600 hover:text-purple-600"}`}
                        >
                            About
                        </button>
                        <button 
                            onClick={() => handleNavigation("/contact", "contact")}
                            className={`text-sm font-medium transition-colors duration-200 ${active === "contact" ? "text-purple-600" : "text-gray-600 hover:text-purple-600"}`}
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
                </div>
            </nav>
        </div>
    );
};

export default Navbar;

