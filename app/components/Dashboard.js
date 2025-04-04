'use client';

import { useContext, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AuthContext } from '../context/AuthContext';
import { getCities, getEducationOptions, updateUserProfile, getImageUrl } from '../utils/api';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Dashboard = () => {
  const { user, loading, logout, isAuthenticated, checkUserLoggedIn } = useContext(AuthContext);
  const [cities, setCities] = useState([]);
  const [educationOptions, setEducationOptions] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  useEffect(() => {
    const fetchOptions = async () => {
      const citiesData = await getCities();
      const educationData = await getEducationOptions();
      setCities(citiesData);
      setEducationOptions(educationData);
      
      // Debug education options
      console.log('Education options loaded:', educationData);
      if (user && user.education) {
        console.log('User education value:', user.education);
        console.log('Type of user.education:', typeof user.education);
        
        // Get education string value - handle both string and array formats
        const educationValue = Array.isArray(user.education) ? user.education[0] : user.education;
        console.log('Normalized education value:', educationValue);
        console.log('Is normalized education in options?', educationData.includes(educationValue));
        
        // Try to find a matching education option (case-insensitive)
        if (typeof educationValue === 'string') {
          const matchingOption = educationData.find(option => 
            typeof option === 'string' && 
            option.toLowerCase() === educationValue.toLowerCase()
          );
          
          if (matchingOption) {
            console.log('Found matching education option:', matchingOption);
            // Use the exact case from the options
            setValue('education', matchingOption);
          } else {
            console.log('No exact match found for education value');
          }
        }
      }
    };

    fetchOptions();

    // Set form values when user data is available
    if (user) {
      setValue('username', user.username);
      setValue('email', user.email);
      setValue('phoneNumber', user.phoneNumber);
      setValue('gender', user.gender);
      setValue('city', user.city);
      
      // Set education value - handle both string and array formats
      if (user.education) {
        const educationValue = Array.isArray(user.education) ? user.education[0] : user.education;
        if (typeof educationValue === 'string') {
          setValue('education', educationValue);
        }
      }
      
      // Set image preview if user has images
      if (user.images && user.images.length > 0) {
        setImagePreview(user.images.map(img => getImageUrl(img)));
      }
    }
  }, [user, setValue]);

  // Add this effect to reset form values when user switches to edit mode
  useEffect(() => {
    if (isEditing && user) {
      // Reset all form values when entering edit mode
      setValue('username', user.username || '');
      setValue('email', user.email || '');
      setValue('phoneNumber', user.phoneNumber || '');
      setValue('gender', user.gender || '');
      setValue('city', user.city || '');
      
      // Make sure education value is set again when entering edit mode - handle both string and array formats
      if (user.education) {
        const educationValue = Array.isArray(user.education) ? user.education[0] : user.education;
        if (typeof educationValue === 'string') {
          console.log('Setting education value to:', educationValue);
          // Force a timeout to ensure the radio buttons are rendered before setting value
          setTimeout(() => {
            setValue('education', educationValue);
          }, 0);
        }
      }
    }
  }, [isEditing, user, setValue]);

  // Auto-hide success message after 3 seconds
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length !== 4) {
      setUpdateError('Please select exactly 4 images');
      e.target.value = null; // Reset the input
      return;
    }
    
    setUpdateError(null);
    setImageFiles(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
    
    setImagePreview(prev => {
      const newPreviews = [...prev];
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  // Helper function to manually create form data for better browser compatibility
  const createFormData = (data, images) => {
    const formData = new FormData();
    
    // Add text data
    Object.keys(data).forEach(key => {
      // Make sure we convert all values to strings to avoid null/undefined issues
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, String(data[key]));
      }
    });
    
    // Add images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }
    
    return formData;
  };

  const onSubmit = async (data) => {
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      setUpdateSuccess(false);
      
      console.log("Submitting form data:", data);
      
      // Create update data
      const updateData = {
        username: data.username,
        email: data.email,
        phoneNumber: data.phoneNumber,
        gender: data.gender,
        city: data.city,
        education: data.education
      };
      
      console.log("Update data prepared:", updateData);
      
      let imagesToUpload = null;
      
      // Check if we need to handle images
      if (imageFiles.length > 0) {
        // Ensure exactly 4 images are uploaded if user is uploading new images
        if (imageFiles.length !== 4) {
          setUpdateError('Please upload exactly 4 images');
          setUpdateLoading(false);
          return;
        }
        imagesToUpload = imageFiles;
        console.log("Adding images to update data, count:", imageFiles.length);
      } else if (activeTab === 'images' && (!user.images || user.images.length === 0)) {
        // If we're on the images tab and user doesn't have images yet, require 4 images
        setUpdateError('Please upload exactly 4 images');
        setUpdateLoading(false);
        return;
      }
      
      const token = Cookies.get('token');
      if (!token) {
        setUpdateError('Authentication token not found. Please log in again.');
        setUpdateLoading(false);
        return;
      }
      
      console.log("Making API call to update profile...");
      
      try {
        // Manual form data creation for better control
        const formData = createFormData(updateData, imagesToUpload);
        
        // Log the form data entries for debugging (similar to what's in api.js)
        console.log("Form data entries created:");
        for (const pair of formData.entries()) {
          if (pair[0] === 'images') {
            console.log(`${pair[0]}: [File]`);
          } else {
            console.log(`${pair[0]}: ${pair[1]}`);
          }
        }
        
        // Get user ID first
        const meResponse = await fetch(`/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (!meResponse.ok) {
          throw new Error('Failed to get user information');
        }
        
        const userInfo = await meResponse.json();
        if (!userInfo.success || !userInfo.data || !userInfo.data._id) {
          throw new Error('User ID not found');
        }
        
        const userId = userInfo.data._id;
        console.log(`Updating user with ID: ${userId}`);
        
        // Make the direct request here instead of using the utility
        const response = await fetch(`/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update profile');
        }
        
        const result = await response.json();
        console.log("Profile update response:", result);
        
        if (result && result.success) {
          setUpdateSuccess(true);
          console.log("Update successful, refreshing user data");
          
          // Add a short delay before refreshing user data
          setTimeout(async () => {
            try {
              await checkUserLoggedIn();
              setIsEditing(false);
            } catch (refreshError) {
              console.error("Error refreshing user data:", refreshError);
            }
          }, 500);
        } else {
          const errorMessage = result && result.error ? result.error : 'Failed to update profile. Please try again.';
          console.error("Update failed with error:", errorMessage);
          setUpdateError(errorMessage);
        }
      } catch (apiError) {
        console.error("API call error:", apiError);
        setUpdateError(apiError.toString());
      }
    } catch (error) {
      console.error("Error during form submission:", error);
      setUpdateError(error.toString());
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      
      const token = Cookies.get('token');
      if (!token) {
        setUpdateError('Authentication token not found. Please log in again.');
        setShowDeleteModal(false);
        setDeleteLoading(false);
        return;
      }
      
      // Get user ID first
      const meResponse = await fetch(`/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!meResponse.ok) {
        throw new Error('Failed to get user information');
      }
      
      const userInfo = await meResponse.json();
      if (!userInfo.success || !userInfo.data || !userInfo.data._id) {
        throw new Error('User ID not found');
      }
      
      const userId = userInfo.data._id;
      
      // Make the delete request
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }
      
      const result = await response.json();
      
      if (result && result.success) {
        // Log the user out after successful deletion
        logout();
      } else {
        const errorMessage = result && result.error ? result.error : 'Failed to delete account. Please try again.';
        setUpdateError(errorMessage);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      setUpdateError(error.toString());
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  // Show a nicer loading state
  if (loading || (!user && isAuthenticated)) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-blue-200 mb-4"></div>
          <div className="h-4 w-48 bg-blue-200 rounded mb-3"></div>
          <div className="h-3 w-32 bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  // Ensure we have user data
  if (!user) {
    return <div className="text-center p-8">User data not available. Please log in again.</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-5xl mx-auto overflow-hidden">
      {/* Header with user info and logout */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-1 rounded-full">
              {user.images && user.images.length > 0 ? (
                <img 
                  src={getImageUrl(user.images[0])} 
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-indigo-600 text-xl font-bold">
                  {user.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-indigo-100">{user.email}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 font-medium cursor-pointer"
            >
              Delete Account
            </button>
            <button
              onClick={logout}
              className="bg-white text-indigo-600 px-4 py-2 rounded-md hover:bg-indigo-50 transition duration-300 font-medium cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium cursor-pointer ${
              activeTab === 'profile'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-6 py-3 font-medium cursor-pointer ${
              activeTab === 'images'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Images
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {/* Alert messages */}
        {updateError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{updateError}</p>
              </div>
            </div>
          </div>
        )}
        
        {updateSuccess && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-r-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">Profile updated successfully!</p>
              </div>
            </div>
          </div>
        )}
        
        {isEditing ? (
          /* Edit Form */
          <form onSubmit={handleSubmit(onSubmit)}>
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Username</label>
                  <input
                    type="text"
                    {...register('username', { required: 'Username is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                  )}
                </div>
                
                {/* Email */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Please enter a valid email'
                      }
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                {/* Phone Number */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="text"
                    {...register('phoneNumber', { required: 'Phone number is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
                  )}
                </div>
                
                {/* Gender */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Gender</label>
                  <div className="flex gap-6 mt-2">
                    {['male', 'female', 'other'].map((gender) => (
                      <label key={gender} className="flex items-center">
                        <input
                          type="radio"
                          value={gender}
                          {...register('gender', { required: 'Gender is required' })}
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700 capitalize">{gender}</span>
                      </label>
                    ))}
                  </div>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
                  )}
                </div>
                
                {/* City */}
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2">City</label>
                  <select
                    {...register('city', { required: 'City is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select a city</option>
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
                <div className="mb-6 col-span-1 md:col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-2">Education</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 border border-gray-200 rounded-md">
                    {educationOptions.map((option) => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          value={option}
                          {...register('education', { required: 'Education is required' })}
                          className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700 text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.education && (
                    <p className="text-red-500 text-xs mt-1">{errors.education.message}</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === 'images' && (
              <div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Profile Images (Exactly 4 required)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-indigo-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="images-upload"
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
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Selected Images:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {imagePreview.map((src, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={src} 
                              alt={`Preview ${index + 1}`} 
                              className="w-full h-32 object-cover rounded-md border border-gray-200"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <button 
                                type="button" 
                                onClick={() => removeImage(index)}
                                className="p-1 bg-red-500 rounded-full text-white focus:outline-none"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {Array.from({ length: 4 - imagePreview.length }).map((_, index) => (
                          <div key={`empty-${index}`} className="border-2 border-dashed border-gray-200 rounded-md h-32 flex items-center justify-center text-gray-400">
                            <span className="text-sm">Image {imagePreview.length + index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex gap-4 justify-end mt-6 border-t pt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium cursor-pointer"
                disabled={updateLoading}
              >
                {updateLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Changes...
                  </span>
                ) : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          /* Profile View */
          <div>
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* User Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b">Personal Information</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-500 text-sm">Username</h4>
                      <p className="text-gray-900 mt-1">{user.username}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-500 text-sm">Email</h4>
                      <p className="text-gray-900 mt-1">{user.email}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-500 text-sm">Phone Number</h4>
                      <p className="text-gray-900 mt-1">{user.phoneNumber}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-500 text-sm">Gender</h4>
                      <p className="text-gray-900 mt-1 capitalize">{user.gender}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-500 text-sm">City</h4>
                      <p className="text-gray-900 mt-1">{user.city}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-500 text-sm">Education</h4>
                      {user.education ? (
                        <p className="text-gray-900 mt-1">
                          {Array.isArray(user.education) ? user.education[0] : user.education}
                        </p>
                      ) : (
                        <p className="text-gray-500 mt-1 text-sm italic">Not specified</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center items-center bg-gray-50 p-8 rounded-lg">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Account Status</h3>
                    <p className="text-gray-500 text-sm">Your account is active and verified</p>
                  </div>
                  
                  <div className="bg-white p-3 rounded-full shadow-md mb-4">
                    {user.images && user.images.length > 0 ? (
                      <img 
                        src={getImageUrl(user.images[0])} 
                        alt="Profile"
                        className="h-32 w-32 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl font-bold">
                        {user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      // Sync form values before entering edit mode
                      if (user) {
                        setValue('username', user.username || '');
                        setValue('email', user.email || '');
                        setValue('phoneNumber', user.phoneNumber || '');
                        setValue('gender', user.gender || '');
                        setValue('city', user.city || '');
                        
                        if (user.education) {
                          const educationValue = Array.isArray(user.education) ? user.education[0] : user.education;
                          if (typeof educationValue === 'string') {
                            setValue('education', educationValue);
                          }
                        }
                      }
                      setIsEditing(true);
                    }}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium mt-2 cursor-pointer"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'images' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b">Profile Images</h3>
                {user.images && user.images.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {user.images.map((img, index) => (
                      <div key={index} className="relative overflow-hidden rounded-lg shadow-md group">
                        <img 
                          src={getImageUrl(img)}
                          alt={`User image ${index + 1}`} 
                          className="w-full h-56 object-cover"
                        />
                        <div className="absolute inset-0  bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center">
                          <div className="bg-white bg-opacity-90 w-full py-2 px-3">
                            <p className="text-gray-800 text-sm font-medium">Image {index + 1}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 mb-4">No images uploaded yet</p>
                    <button
                      onClick={() => {
                        // Sync form values before entering edit mode
                        if (user) {
                          setValue('username', user.username || '');
                          setValue('email', user.email || '');
                          setValue('phoneNumber', user.phoneNumber || '');
                          setValue('gender', user.gender || '');
                          setValue('city', user.city || '');
                          
                          if (user.education) {
                            const educationValue = Array.isArray(user.education) ? user.education[0] : user.education;
                            if (typeof educationValue === 'string') {
                              setValue('education', educationValue);
                            }
                          }
                        }
                        setIsEditing(true);
                        setActiveTab('images');
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300 text-sm"
                    >
                      Upload Images
                    </button>
                  </div>
                )}
                
                <div className="mt-8 text-center">
                  <button
                    onClick={() => {
                      // Sync form values before entering edit mode
                      if (user) {
                        setValue('username', user.username || '');
                        setValue('email', user.email || '');
                        setValue('phoneNumber', user.phoneNumber || '');
                        setValue('gender', user.gender || '');
                        setValue('city', user.city || '');
                        
                        if (user.education) {
                          const educationValue = Array.isArray(user.education) ? user.education[0] : user.education;
                          if (typeof educationValue === 'string') {
                            setValue('education', educationValue);
                          }
                        }
                      }
                      setIsEditing(true);
                    }}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium cursor-pointer"
                  >
                    Update Images
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Account</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? This action is irreversible and all your data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-300 font-medium"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 font-medium"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 