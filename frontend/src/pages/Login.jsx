import React from 'react';
import { FaFacebookF } from 'react-icons/fa';

export default function Login() {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-gradient-to-br from-indigo-100 via-purple-200 to-pink-100 font-sans">
      <div className="hidden md:flex items-center justify-center bg-cover bg-center relative" style={{ backgroundImage: "url('/images/loginbg.jpg')" }}>
        <div  className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-10">
          <h1 className="text-white text-4xl md:text-5xl font-bold text-center leading-tight tracking-wide drop-shadow-lg">
            Take Control of Your <br /> Digital Responsibility
          </h1>
          <p className="text-white/90 text-lg mt-6 text-center max-w-md">
            Analyze your digital behavior and embrace mindful social media practices.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white/30 backdrop-blur-2xl rounded-3xl shadow-xl p-10 border border-white/50">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 tracking-tight">Welcome Back</h2>
          <p className="text-gray-700 mb-6 text-base">
            Log in with your Facebook account to begin your journey toward digital well-being.
          </p>
          <a href="http://localhost:8000/auth/facebook">
            <button className="group relative w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-5 rounded-xl transition-all duration-300 shadow-lg text-lg flex items-center justify-center overflow-hidden">
              <span className="absolute left-0 w-12 h-12 bg-white/10 rounded-full transform scale-0 group-hover:scale-150 transition-transform duration-700 ease-out" />
              <FaFacebookF className="mr-3 text-xl z-10" />
              <span className="z-10">Login with Facebook</span>
            </button>
          </a>
        </div>
      </div>
    </div>
  );
}
