// src/screens/UnauthorizedScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLock } from "react-icons/fa";
import HeaderComponent from "../components/HeaderComponent";

const UnauthorizedScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-100 to-red-200">
      <HeaderComponent />

      <div className="flex flex-col items-center justify-center text-center pt-32 px-4">
        <FaLock className="text-red-500 text-6xl mb-4" />
        <h1 className="text-4xl font-bold text-red-700 mb-2">Unauthorized Access</h1>
        <p className="text-red-600 mb-6 max-w-md">
          You don't have permission to view this page. Please log in with the appropriate account or return to a safe page.
        </p>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/login")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-md transition"
          >
            Go to Login
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-white hover:bg-gray-100 text-red-600 border border-red-300 px-6 py-3 rounded-lg shadow-sm transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedScreen;
