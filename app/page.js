'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

export default function Home() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-200 mb-3"></div>
          <div className="h-4 w-24 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 responsive-container responsive-max-w">
        <div className="absolute top-0 right-0 h-96 w-full bg-gradient-to-bl from-blue-400 to-indigo-500 rounded-br-3xl -z-10 opacity-10"></div>
        
        <div className="py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">User Management</span>
              <span className="block text-indigo-600 mt-1">Made Simple</span>
            </h1>
            <p className="mt-6 max-w-lg mx-auto text-xl text-gray-500">
              Create an account, manage your profile and connect with others. 
              A complete user management system with secure authentication.
            </p>
            
            <div className="mt-10 flex justify-center gap-4 flex-wrap responsive-flex-col-mobile">
              {user ? (
                <Link 
                  href="/dashboard" 
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 responsive-w-full-mobile"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 responsive-w-full-mobile"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 responsive-w-full-mobile"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Features section */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 responsive-grid">
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Authentication</h3>
              <p className="text-gray-500">Industry standard authentication with JWT tokens and password hashing.</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">User Profiles</h3>
              <p className="text-gray-500">Create and manage your profile with personal information and profile images.</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow-md">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Modern UI</h3>
              <p className="text-gray-500">Clean and responsive user interface built with Tailwind CSS and Next.js.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
