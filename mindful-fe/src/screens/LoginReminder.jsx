import React from 'react';

const LoginReminder = () => {
  return (
    <div className="min-h-screen w-screen bg-purple-100 flex items-center justify-center p-4">
      {/* Container */}
      <div className="w-full max-w-md bg-purple-200 rounded-[2rem] border-2 border-blue-400 p-8 text-center shadow-lg">
        {/* Back Button */}
        <div className="absolute top-6 left-6 text-xl cursor-pointer">←</div>

        {/* Message */}
        <h1 className="text-lg font-semibold mb-2">Hello there,</h1>
        <p className="text-md font-medium mb-1">I think you forgot to login in today...</p>
        <p className="text-md font-medium mb-6">Don’t worry you can login here below.</p>

        {/* Button with background style */}
        <div className="relative inline-block">
        <div className="absolute top-1 left-1 w-full h-full bg-yellow-300 rounded-full z-0"></div>
        <button className="relative z-10 bg-gradient-to-r from-purple-500 to-purple-800 text-white px-6 py-2 rounded-full">
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginReminder;
