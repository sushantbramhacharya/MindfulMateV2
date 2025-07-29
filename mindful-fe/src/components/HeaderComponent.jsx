import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";


const HeaderComponent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  return (
    <header className="bg-white/60 backdrop-blur-md border border-purple-200 rounded-xl shadow-sm mx-4 mt-4 px-6 py-3 flex justify-between items-center">
      {/* Clickable logo + text container */}
      <div
        onClick={handleLogoClick}
        className="flex items-center cursor-pointer select-none"
      >
        <img src="/assets/logo-2.png" alt="Mindful Mate Logo" className="h-8 mr-3" />
        <h1 className="text-2xl font-bold text-purple-900">Mindful Mate</h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden md:inline text-purple-800 text-sm">
          Welcome, {user?.email}
        </span>
        {user?.id === 4 && (
          <Link
            to="/admin/dashboard"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm shadow-md transition"
          >
            Admin Panel
          </Link>
          )}
        <button
          onClick={handleLogout}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm shadow-md transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default HeaderComponent;
