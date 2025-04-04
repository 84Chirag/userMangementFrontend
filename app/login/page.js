'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LoginForm from '../components/LoginForm';
import { AuthContext } from '../context/AuthContext';

export default function LoginPage() {
  const { user, loading, registerSuccess, isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if ((user || isAuthenticated) && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router, isAuthenticated]);

  // Show loading state while checking authentication or redirecting after login
  if (loading || isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-200 mb-3"></div>
          <div className="h-4 w-24 bg-blue-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show login form if user is not logged in
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-0 h-96 w-full bg-gradient-to-bl from-blue-400 to-indigo-500 rounded-br-3xl -z-10 opacity-10"></div>
      
      <div className="mb-6 flex justify-center">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 transition duration-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Home
        </Link>
      </div>
      
      {registerSuccess && (
        <div className="max-w-md mx-auto mb-6">
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Account created successfully! Please login with your credentials.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-md mx-auto">
        <LoginForm />
      </div>
    </div>
  );
} 