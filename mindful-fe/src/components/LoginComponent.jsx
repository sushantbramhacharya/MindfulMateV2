import React, { useState } from "react";
import axios from "axios";

const LoginComponent = ({ setLoginSwitch, loginSwitch }) => {
  return (
    <div className="bg-purple-300 bg-opacity-30 backdrop-blur-md p-8 rounded-2xl shadow-md w-80 md:w-96 text-center">
      <h2 className="text-xl font-semibold text-purple-900 mb-6">
        {loginSwitch ? "Register" : "Login"}
      </h2>

      {loginSwitch ? <RegisterForm /> : <LoginForm />}

      <div className="flex justify-between text-xs mt-4">
        <a
          href="#"
          className="!text-purple-900 hover:underline"
          onClick={(e) => {
            e.preventDefault();
            setLoginSwitch(!loginSwitch);
          }}
        >
          {loginSwitch ? "Already Have an Account" : "Create an Account"}
        </a>
        {!loginSwitch && (
          <a href="#" className="!text-purple-900 hover:underline">
            Forgot Password?
          </a>
        )}
      </div>
    </div>
  );
};

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !confirmPassword || !dateOfBirth) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        new URLSearchParams({
          email,
          password,
          confirmPassword,
          dateOfBirth
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          withCredentials: true
        }
      );

      if (response.status === 201) {
        alert("Registration successful! Please login.");
        window.location.reload();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleRegister} className="flex flex-col space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div>
        <label className="block text-left text-purple-900 font-medium mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border-b border-purple-900 bg-transparent outline-none py-1 text-purple-900"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-left text-purple-900 font-medium mb-1">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full border-b border-purple-900 bg-transparent outline-none py-1 text-purple-900"
          placeholder="Enter your password"
        />
      </div>

      <div>
        <label className="block text-left text-purple-900 font-medium mb-1">
          Confirm Password
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full border-b border-purple-900 bg-transparent outline-none py-1 text-purple-900"
          placeholder="Confirm your password"
        />
      </div>

      <div>
        <label className="block text-left text-purple-900 font-medium mb-1">
          Date of Birth
        </label>
        <input
          type="date"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
          className="w-full border-b border-purple-900 bg-transparent outline-none py-1 text-purple-900"
        />
      </div>

      <button
        type="submit"
        className="bg-gradient-to-r from-purple-500 to-purple-800 text-white px-6 py-2 rounded-full"
      >
        Register
      </button>
    </form>
  );
};

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        new URLSearchParams({ email, password }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          withCredentials: true
        }
      );

      if (response.status === 200) {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div>
        <label className="block text-left text-purple-900 font-medium mb-1">
          Email
        </label>
        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          type="email"
          required
          className="w-full border-b border-purple-900 bg-transparent outline-none py-1 text-purple-900"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label className="block text-left text-purple-900 font-medium mb-1">
          Password
        </label>
        <input
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          type="password"
          required
          className="w-full border-b border-purple-900 bg-transparent outline-none py-1 text-purple-900"
          placeholder="Enter your password"
        />
      </div>

      <button
        type="submit"
        className="bg-gradient-to-r from-purple-500 to-purple-800 text-white px-6 py-2 rounded-full"
      >
        Login
      </button>
    </form>
  );
};

export default LoginComponent;