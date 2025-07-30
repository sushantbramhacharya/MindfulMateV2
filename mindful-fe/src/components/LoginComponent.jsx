import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const LoginComponent = ({ setLoginSwitch, loginSwitch }) => {
  const { login } = useAuth();

  const inputClass =
    "w-full bg-transparent border-b border-purple-600 text-purple-900 placeholder-purple-500 py-2 outline-none transition focus:border-purple-800";

  const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);

    const handleLogin = async (e) => {
      e.preventDefault();
      setError("");

      if (!email || !password) {
        setError("Please enter both email and password");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/login",
          new URLSearchParams({ email, password }),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            withCredentials: true,
          }
        );

        if (response.data?.user) {
          const userData = {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            token: response.data.token,
          };
          login(userData, rememberMe);
          window.location.href = "/dashboard";
        }
      } catch (err) {
        setError(err.response?.data?.error || "Login failed");
      }
    };

    return (
      <form onSubmit={handleLogin} className="flex flex-col space-y-6">
        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={inputClass}
          autoComplete="username"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={inputClass}
          autoComplete="current-password"
        />

        <label className="flex items-center gap-2 text-purple-800 text-sm select-none">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="accent-purple-600"
          />
          Remember me
        </label>

        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-full py-3 font-semibold shadow-md transition"
        >
          Login
        </button>
      </form>
    );
  };

  const RegisterForm = () => {
    const [name, setName] = useState(""); // Step 1
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async (e) => {
      e.preventDefault();
      setError("");

      if (!name || !email || !password || !confirmPassword || !dateOfBirth) {
        setError("Please fill in all fields");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/register",
          new URLSearchParams({
            name,
            email,
            password,
            confirmPassword,
            dateOfBirth,
          }), // Step 3
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            withCredentials: true,
          }
        );

        if (response.data?.user_id) {
          const loginResponse = await axios.post(
            "http://localhost:5000/api/auth/login",
            new URLSearchParams({ email, password }),
            {
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              withCredentials: true,
            }
          );

          if (loginResponse.data?.user) {
            const userData = {
              id: loginResponse.data.user.id,
              email: loginResponse.data.user.email,
              name: loginResponse.data.user.name,
              token: loginResponse.data.token,
            };
            login(userData, true);
            window.location.href = "/dashboard";
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || "Registration failed");
      }
    };

    return (
      <form onSubmit={handleRegister} className="flex flex-col space-y-6">
        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        {/* Step 2: Name field */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full Name"
          className={inputClass}
          autoComplete="name"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={inputClass}
          autoComplete="email"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={inputClass}
          autoComplete="new-password"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className={inputClass}
          autoComplete="new-password"
        />

        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className={inputClass + " text-purple-900 placeholder-purple-700"}
          placeholder="Date of Birth"
          max={new Date().toISOString().split("T")[0]}
        />

        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white rounded-full py-3 font-semibold shadow-md transition"
        >
          Register
        </button>
      </form>
    );
  };

  return (
    <div className="bg-white/30 backdrop-blur-lg p-8 rounded-3xl shadow-lg w-80 md:w-96 text-center">
      <h2 className="text-2xl font-bold text-purple-900 mb-8">
        {loginSwitch ? "Create Account" : "Welcome Back"}
      </h2>

      {loginSwitch ? <RegisterForm /> : <LoginForm />}

      <div className="flex justify-between text-sm mt-6 text-purple-900 font-medium select-none">
        <button
          className="underline hover:text-purple-700 transition"
          onClick={() => setLoginSwitch(!loginSwitch)}
        >
          {loginSwitch ? "Already have an account?" : "Create an account"}
        </button>

        {!loginSwitch && (
          <button
            className="underline hover:text-purple-700 transition"
            onClick={() => alert("Password reset flow coming soon!")}
          >
            Forgot Password?
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginComponent;
