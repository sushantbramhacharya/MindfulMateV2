import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import LoginComponent from "../components/LoginComponent";

const LoginScreen = () => {
  const [loginSwitch, setLoginSwitch] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <main className="min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-purple-200 via-purple-300 to-purple-400">
      <div className="flex flex-col md:flex-row items-center gap-12 p-8 rounded-3xl bg-white bg-opacity-20 backdrop-blur-lg shadow-xl max-w-4xl w-full mx-4">
        {/* Left Side - Logo & Text */}
        <LeftBox />

        {/* Right Side - Login/Register Form */}
        <LoginComponent setLoginSwitch={setLoginSwitch} loginSwitch={loginSwitch} />
      </div>
    </main>
  );
};

const LeftBox = () => {
  return (
    <aside className="bg-purple-900 bg-opacity-70 backdrop-blur-md text-white p-10 rounded-3xl w-80 flex flex-col items-center shadow-lg">
      <img
        src="./assets/logo.png"
        alt="Mindful Mate Logo"
        className="w-40 rounded-2xl mb-6"
        loading="lazy"
      />
      <h2 className="text-2xl font-extrabold mb-2">Mental Health Matters</h2>
      <p className="text-purple-300 text-center leading-relaxed">
        Take care of your mind with calm, focus, and daily mindfulness.
      </p>
    </aside>
  );
};

export default LoginScreen;
