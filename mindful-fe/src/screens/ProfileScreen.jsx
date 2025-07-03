// src/screens/ProfileScreen.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import HeaderComponent from "../components/HeaderComponent";

const menuItems = [
  {
    icon: "🔒",
    label: "Change Password",
    route: "/change-password",
    description: "Update your login credentials",
  },
  {
    icon: "😊",
    label: "Track Mood",
    route: "/mood-tracker",
    description: "Log and monitor your emotional state",
  },
];

const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleMenuClick = (route) => {
    navigate(route);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-purple-700 text-xl">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
      <HeaderComponent />

      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-md">
          <h2 className="text-3xl font-bold text-purple-900 mb-6 text-center">My Profile</h2>

          {/* User Info */}
          <div className="mb-10 text-center">
            <p className="text-gray-600 text-sm">Name</p>
            <p className="text-2xl font-bold text-purple-800 mb-2">{user?.name || "Anonymous"}</p>
            <p className="text-gray-600 text-sm">Email</p>
            <p className="text-lg text-purple-700">{user?.email}</p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleMenuClick(item.route)}
                className="bg-white/40 backdrop-blur-md border border-purple-300 rounded-2xl p-6 text-left shadow-md hover:shadow-xl transition hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-400"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-purple-900 mb-2">{item.label}</h3>
                <p className="text-purple-800 text-sm">{item.description}</p>
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <div className="text-center">
            <button
              onClick={handleLogout}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileScreen;
