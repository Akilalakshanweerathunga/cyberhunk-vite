import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedProfile = localStorage.getItem('fb_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('fb_profile');
    setProfile(null);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-indigo-600 tracking-tight">
          <img src="images/logo.ico" alt="Logo" className="w-[40px]" />
          <span>CyberHunk</span>
        </Link>

        <div className="flex space-x-6 items-center">
          {!profile ? (
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium">
              Login
            </Link>
          ) : (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium">
                Dashboard
              </Link>

              <div className="flex items-center space-x-2 text-gray-700">
                <img
                  src={profile.picture?.data?.url}
                  alt="profile"
                  className="rounded-full w-10 h-10"
                />
                <h3 className="text-md font-semibold">{profile.name}</h3>
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
