import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/logo2.png" 
                alt="EezyTask Logo" 
                className="w-8 h-8 mr-3"
              />
              <span className="text-xl font-bold text-black font-bungee">EezyTask</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-black transition-colors duration-200 font-medium font-oswald">
                Home
              </a>
              <a href="#features" className="text-gray-700 hover:text-black transition-colors duration-200 font-medium font-oswald">
                Features
              </a>
              <a href="#about" className="text-gray-700 hover:text-black transition-colors duration-200 font-medium font-oswald">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-black transition-colors duration-200 font-medium font-oswald">
                Contact
              </a>
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="text-black hover:text-gray-600 transition-colors duration-200 font-medium font-oswald"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-80 transition-opacity duration-200 font-medium font-oswald"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-black hover:text-gray-600 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="py-4 space-y-4">
                <a href="#home" className="block text-gray-700 hover:text-black transition-colors duration-200 font-medium font-oswald">
                  Home
                </a>
                <a href="#features" className="block text-gray-700 hover:text-black transition-colors duration-200 font-medium font-oswald">
                  Features
                </a>
                <a href="#about" className="block text-gray-700 hover:text-black transition-colors duration-200 font-medium font-oswald">
                  About
                </a>
                <a href="#contact" className="block text-gray-700 hover:text-black transition-colors duration-200 font-medium font-oswald">
                  Contact
                </a>
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="block w-full text-left text-black hover:text-gray-600 transition-colors duration-200 font-medium font-oswald"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="block w-full bg-black text-white px-4 py-2 rounded-lg hover:opacity-80 transition-opacity duration-200 font-medium font-oswald"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Left Content */}
          <div className="lg:w-1/2 lg:pr-12 text-center lg:text-left">
            <h1 className="text-6xl font-bold text-black mb-6 font-bungee">EezyTask</h1>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed font-oswald">
              Organize your life. Stay on top of your tasks. 
              Transform chaos into clarity with our intuitive task management platform.
            </p>
            
            {/* Feature highlights */}
            <div className="mb-8 text-left">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                <span className="text-gray-700 font-oswald">Drag & drop task organization</span>
              </div>
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                <span className="text-gray-700 font-oswald">Priority-based color coding</span>
              </div>
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                <span className="text-gray-700 font-oswald">Real-time progress tracking</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button
                onClick={() => navigate("/register")}
                className="bg-black text-white px-8 py-4 rounded-lg text-lg font-semibold hover:opacity-80 transition font-oswald"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate("/login")}
                className="border-2 border-black text-black px-8 py-4 rounded-lg text-lg font-semibold hover:bg-black hover:text-white transition font-oswald"
              >
                Sign In
              </button>
            </div>
          </div>

          {/* Right Image with Animations */}
          <div className="lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="/task.jpg"
                alt="Task Management Illustration"
                className="w-96 h-96 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500 ease-in-out animate-pulse"
              />
              {/* Floating animation elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-black rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -right-4 w-6 h-6 bg-gray-800 rounded-full animate-bounce delay-300"></div>
              <div className="absolute top-1/2 -left-8 w-4 h-4 bg-gray-600 rounded-full animate-ping delay-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-black mb-12 font-oswald">
            Why Choose EezyTask?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-3 font-oswald">Smart Organization</h3>
              <p className="text-gray-600 font-oswald">
                Automatically categorize and prioritize your tasks with intelligent sorting and filtering options.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-3 font-oswald">Lightning Fast</h3>
              <p className="text-gray-600 font-oswald">
                Create, edit, and complete tasks in seconds. Our streamlined interface keeps you focused and productive.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-black mb-3 font-oswald">Progress Tracking</h3>
              <p className="text-gray-600 font-oswald">
                Visualize your productivity with detailed analytics and progress reports to stay motivated.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section Separator */}
      <div className="py-8 bg-white">
        <div className="container mx-auto px-6">
          <hr className="border-black border-t-2" />
        </div>
      </div>

      {/* Quick Links Section with Task2 Image */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left - Task2 Image */}
            <div className="lg:w-1/2 flex justify-center lg:justify-start">
              <div className="relative">
                <img
                  src="/task2.jpg"
                  alt="Task Management Features"
                  className="w-72 h-72 object-cover rounded-full shadow-xl transform hover:scale-105 transition-transform duration-500 ease-in-out"
                />
                {/* Artistic floating elements */}
                <div className="absolute -top-3 -right-3 w-6 h-6 border-2 border-black rounded-full animate-spin opacity-30"></div>
                <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-black rounded-full animate-pulse opacity-40"></div>
                <div className="absolute top-1/4 -left-6 w-2 h-2 bg-gray-600 rounded-full animate-ping opacity-50"></div>
              </div>
            </div>

            {/* Right - Features / Value Points */}
            <div className="lg:w-1/2 lg:pl-8">
              <h2 className="text-3xl font-bold text-black mb-6 text-center lg:text-left font-oswald">Features</h2>
              
              <div className="space-y-4">
                {/* Feature 1 */}
                <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all duration-300">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1 font-oswald">Clean, distraction-free task manager</h3>
                    <p className="text-gray-600 font-oswald text-sm">Focus on what matters without clutter</p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all duration-300">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1 font-oswald">Drag-and-drop organization made simple</h3>
                    <p className="text-gray-600 font-oswald text-sm">Effortless task management at your fingertips</p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all duration-300">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1 font-oswald">Real-time updates that keep you in sync</h3>
                    <p className="text-gray-600 font-oswald text-sm">Stay connected across all your devices</p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:border-black hover:shadow-md transition-all duration-300">
                  <div className="w-2 h-2 bg-black rounded-full mt-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-1 font-oswald">Your progress, your pace — beautifully visualized</h3>
                    <p className="text-gray-600 font-oswald text-sm">Track achievements with elegant visual insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-4">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 EezyTask. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;