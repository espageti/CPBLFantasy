// get csrf

import { baseLink } from './models';

// Function to get CSRF token and set it as a header
export const getCsrfToken = async () => {
  try {
    // Use the full URL to make the domain explicit
    console.log('Fetching CSRF token...');
    const response = await fetch(baseLink + 'accounts/csrf/', {
      method: 'GET',
      credentials: 'include'
    });
    
    const data = await response.json();
    console.log('CSRF response:', data);
    
    if (data && data.csrfToken) {
      const csrfToken = data.csrfToken;
      console.log('CSRF token from response:', csrfToken);

      return csrfToken;
    }
    
    console.error('No CSRF token found in response');
    return null;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

