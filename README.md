# User Management System Frontend

This is a Next.js frontend application for the User Management System. It allows users to sign up, log in, and manage their profiles.

## Features

- User registration with multiple fields:
  - Username
  - Email
  - Phone number
  - Password
  - Image upload (up to 4 images)
  - Gender selection (male/female/other)
  - City selection (dropdown)
  - Education selection (multiple checkboxes)
- User login with email and password
- User dashboard to view profile information
- Profile editing functionality
- Authentication using JWT tokens stored in cookies
- Route protection with middleware

## Tech Stack

- Next.js 14
- React Hook Form for form handling
- Axios for API requests
- js-cookie for token management
- TailwindCSS for styling

## Getting Started

1. Clone the repository
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env.local` file with the following content:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
5. Make sure the backend server is running on port 5000
6. Start the development server:
   ```
   npm run dev
   ```
7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `/app` - Next.js app directory
  - `/components` - Reusable React components
  - `/context` - React context for state management
  - `/utils` - Utility functions
  - `/login` - Login page
  - `/signup` - Signup page
  - `/dashboard` - Dashboard page
  - `layout.js` - Root layout component
  - `page.js` - Home page component
  - `middleware.js` - Route protection middleware

## API Integration

This frontend connects to a Node.js/Express backend API that provides the following endpoints:

- `/api/auth/register` - Register a new user
- `/api/auth/login` - Login a user
- `/api/auth/me` - Get the current logged-in user
- `/api/users/profile` - Update user profile
- `/api/options/cities` - Get list of cities
- `/api/options/education` - Get list of education options

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
