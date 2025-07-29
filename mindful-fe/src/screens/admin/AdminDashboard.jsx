import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeaderComponent from "../../components/HeaderComponent";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {user}=useAuth();

  useEffect(() => {
    // Redirect to login if user is not authenticated or not an admin
    if (user === null) return;
 
    if (user.id !== 4) {
      navigate("/unauthorized");
    }
  }, [user, navigate]);

  const features = [
    {
      title: "Upload Music",
      description: "Add new meditation music tracks",
      icon: "🎵",
      onClick: () => navigate("/admin/upload-music"),
    },
    {
      title: "Upload Exercise",
      description: "Add new breathing or yoga exercises",
      icon: "🧘‍♂️",
      onClick: () => navigate("/admin/upload-exercise"),
    },
    // {
    //   title: "Upload Meditation",
    //   description: "Add new guided meditations",
    //   icon: "🧘‍♀️",
    //   onClick: () => navigate("/admin/upload-meditation"),
    // },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 text-gray-800">
      <HeaderComponent />

      <main className="flex-grow container mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-purple-900 mb-10 text-center">
          Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map(({ title, description, icon, onClick }, i) => (
            <button
              key={i}
              onClick={onClick}
              className="bg-white/70 backdrop-blur-md border border-purple-300 rounded-3xl p-8 text-center shadow-md hover:shadow-xl transition hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-400"
              aria-label={title}
              type="button"
            >
              <div className="text-6xl mb-6">{icon}</div>
              <h2 className="text-2xl font-semibold text-purple-900 mb-2">{title}</h2>
              <p className="text-purple-800">{description}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
