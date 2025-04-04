'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '../components/Dashboard';
import { AuthContext } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    // If user is not logged in and not in loading state, redirect to login page immediately
    if (!user && !isAuthenticated && !loading) {
      router.push('/login');
    }
  }, [user, loading, router, isAuthenticated]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-200 mb-3"></div>
          <div className="h-4 w-32 bg-blue-200 rounded mb-2"></div>
          <div className="h-3 w-24 bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  // If not authenticated and not loading, show loading while redirect happens
  if (!user && !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-blue-200 mb-3"></div>
          <div className="h-4 w-32 bg-blue-200 rounded mb-2"></div>
          <div className="h-3 w-24 bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Show dashboard if user is logged in or authenticated
  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-8">Your Dashboard</h1>
      <Dashboard />
    </div>
  );
} 