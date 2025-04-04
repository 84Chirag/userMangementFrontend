// Use the proxy URLs
const API_URL = '/api';
const UPLOADS_URL = '/uploads';

// Get cities
export const getCities = async () => {
  try {
    const response = await fetch(`${API_URL}/options/cities`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch cities');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

// Get education options
export const getEducationOptions = async () => {
  try {
    const response = await fetch(`${API_URL}/options/education`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch education options');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching education options:', error);
    return [];
  }
};

// Update user profile
export const updateUserProfile = async (userData, token) => {
  try {
    const formData = new FormData();
    
    // Add text data - make sure we're sending strings
    for (const key in userData) {
      if (key !== 'images') {
        formData.append(key, String(userData[key] || ''));
      }
    }
    
    // Add images
    if (userData.images && userData.images.length > 0) {
      // In browser FormData, we need to append each file with the same key name
      for (let i = 0; i < userData.images.length; i++) {
        formData.append('images', userData.images[i]);
      }
    }
    
    // Log form data entries for debugging
    console.log("Form data entries:");
    for (const pair of formData.entries()) {
      // Don't log the full binary data for images
      if (pair[0] === 'images') {
        console.log(`${pair[0]}: [File]`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }
    
    // Get current user information from token 
    const meResponse = await fetch(`${API_URL}/auth/me`, {
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
    
    // Use the user ID from the response to update the profile
    const userId = userInfo.data._id;
    console.log(`Updating user with ID: ${userId}`);
    
    // Note: We don't set Content-Type header when using FormData
    // The browser will set it automatically with the boundary
    const response = await fetch(`${API_URL}/users/${userId}`, {
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
    console.log("Update result:", result);
    return result;
  } catch (error) {
    console.error("API error:", error);
    throw error.message || 'Failed to update profile';
  }
};

// Function to get image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  return `${UPLOADS_URL}${imagePath.replace('/uploads', '')}`;
}; 