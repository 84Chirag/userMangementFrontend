'use client';

import { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthContext } from '../context/AuthContext';
import { getCities, getEducationOptions } from '../utils/api';

const SignupForm = () => {
  const { register: registerUser, registerError, loading } = useContext(AuthContext);
  const [cities, setCities] = useState([]);
  const [educationOptions, setEducationOptions] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [step, setStep] = useState(1); // For multi-step form
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const router = useRouter();

  useEffect(() => {
    const fetchOptions = async () => {
      const citiesData = await getCities();
      const educationData = await getEducationOptions();
      setCities(citiesData);
      setEducationOptions(educationData);
    };

    fetchOptions();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length !== 4) {
      alert('Please select exactly 4 images');
      e.target.value = null; // Reset the input
      return;
    }
    
    setImageFiles(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const onSubmit = async (data) => {
    // Check for 4 images requirement
    if (imageFiles.length !== 4) {
      alert('Please upload exactly 4 images');
      return;
    }
    
    // Add images to the data
    const formData = {
      ...data,
      images: imageFiles,
      education: data.education // Single education value now
    };
    
    try {
      await registerUser(formData);
      // Form will be handled by the AuthContext navigation
    } catch (error) {
      console.error("Registration error:", error);
      // Error state is managed by AuthContext
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  // Form steps
  const renderFormStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3 className="text-lg font-semibold mb-4">Account Information</h3>

            {/* Username */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                {...register('username', { required: 'Username is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>
            
            {/* Email */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                placeholder="your.email@example.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please enter a valid email'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            
            {/* Phone Number */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="e.g., 9876543210"
                {...register('phoneNumber', { required: 'Phone number is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>
            
            {/* Password */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                placeholder="Create a secure password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={nextStep}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Next
              </button>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
            
            {/* Gender */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Gender</label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    {...register('gender', { required: 'Gender is required' })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Male</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="female"
                    {...register('gender', { required: 'Gender is required' })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Female</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="other"
                    {...register('gender', { required: 'Gender is required' })}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Other</span>
                </label>
              </div>
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
              )}
            </div>
            
            {/* City */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">City</label>
              <select
                {...register('city', { required: 'City is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your city</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
              )}
            </div>
            
            {/* Education */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Education (Select one)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                {educationOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      value={option}
                      {...register('education', { required: 'Education is required' })}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              {errors.education && (
                <p className="text-red-500 text-xs mt-1">{errors.education.message}</p>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Next
              </button>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <h3 className="text-lg font-semibold mb-4">Profile Images</h3>
            
            {/* Images */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Upload Images (Exactly 4 required)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="images-upload"
                  required
                />
                <label htmlFor="images-upload" className="cursor-pointer flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="mt-2 text-sm text-gray-600">Click to browse files</span>
                  <span className="mt-1 text-xs text-gray-500">Please select exactly 4 images</span>
                </label>
              </div>
              
              {imagePreview.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Selected Images:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {imagePreview.map((src, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={src} 
                          alt={`Preview ${index + 1}`} 
                          className="w-full h-24 object-cover rounded-md border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                          <button 
                            type="button" 
                            onClick={() => {
                              setImagePreview(prev => prev.filter((_, i) => i !== index));
                              setImageFiles(prev => {
                                const newFiles = [...prev];
                                newFiles.splice(index, 1);
                                return newFiles;
                              });
                            }}
                            className="p-1 bg-red-500 rounded-full text-white"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Back
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                disabled={loading || imageFiles.length === 0}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Create Your Account</h2>
      <p className="text-gray-600 text-center mb-6">Please fill in your information below</p>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between mb-1">
          {[1, 2, 3].map((stepNumber) => (
            <span key={stepNumber} className="text-xs font-medium text-gray-500">
              Step {stepNumber}
            </span>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {registerError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{registerError}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {renderFormStep()}
      </form>
      
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 hover:underline font-medium">
          Log In
        </Link>
      </p>
    </div>
  );
};

export default SignupForm; 