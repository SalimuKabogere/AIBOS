import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import TaskManager from '../components/TaskManager';
import CalendarCard from '../components/CalendarCard';
import TasksCard from '../components/TasksCard';
import CategoriesCard from '../components/CategoriesCard';
import TimeTrackerCard from '../components/TimeTrackerCard';
import CompletedTasks from '../components/CompletedTasks';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      console.log('Logout successful');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout API fails, clear local storage and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-black font-oswald">Dashboard</h1>
              <p className="text-gray-600 font-oswald mt-2">
                Welcome back{user && `, ${user.first_name || user.email}`}! Here's your task overview.
              </p>
            </div>
            
            {/* 2x2 Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendar Card */}
              <div className="min-h-[300px]">
                <CalendarCard />
              </div>
              
              {/* Tasks Card */}
              <div className="min-h-[300px]">
                <TasksCard />
              </div>
              
              {/* Categories Card */}
              <div className="min-h-[300px]">
                <CategoriesCard />
              </div>
              
              {/* Time Tracker Card */}
              <div className="min-h-[300px]">
                <TimeTrackerCard />
              </div>
            </div>
          </div>
        );
      case 'mytasks':
        return <TaskManager />;
      case 'completed':
        return <CompletedTasks />;
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-black font-oswald mb-4">Settings</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h3 className="text-lg font-semibold text-black font-oswald mb-4">Profile Information</h3>
              {user && (
                <div className="space-y-2">
                  <p className="font-oswald"><span className="font-semibold">Name:</span> {user.first_name} {user.last_name}</p>
                  <p className="font-oswald"><span className="font-semibold">Email:</span> {user.email}</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <img 
                src="/logo2.png" 
                alt="EezyTask Logo" 
                className="w-8 h-8 mr-2"
              />
              <span className="text-xl font-bold text-black font-bungee">EezyTask</span>
            </div>

            {/* Navigation Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 text-sm font-medium font-oswald transition-colors duration-200 ${
                    activeTab === 'dashboard'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('mytasks')}
                  className={`px-3 py-2 text-sm font-medium font-oswald transition-colors duration-200 ${
                    activeTab === 'mytasks'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  My Tasks
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`px-3 py-2 text-sm font-medium font-oswald transition-colors duration-200 ${
                    activeTab === 'completed'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-2 text-sm font-medium font-oswald transition-colors duration-200 ${
                    activeTab === 'settings'
                      ? 'text-black border-b-2 border-black'
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* Logout Button */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 text-sm font-medium text-white bg-black hover:opacity-80 rounded-lg transition-opacity duration-200 font-oswald disabled:opacity-50"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`block px-3 py-2 text-base font-medium font-oswald transition-colors duration-200 ${
                  activeTab === 'dashboard'
                    ? 'text-black bg-gray-100'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('mytasks')}
                className={`block px-3 py-2 text-base font-medium font-oswald transition-colors duration-200 ${
                  activeTab === 'mytasks'
                    ? 'text-black bg-gray-100'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                My Tasks
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`block px-3 py-2 text-base font-medium font-oswald transition-colors duration-200 ${
                  activeTab === 'completed'
                    ? 'text-black bg-gray-100'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`block px-3 py-2 text-base font-medium font-oswald transition-colors duration-200 ${
                  activeTab === 'settings'
                    ? 'text-black bg-gray-100'
                    : 'text-gray-600 hover:text-black hover:bg-gray-50'
                }`}
              >
                Settings
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;