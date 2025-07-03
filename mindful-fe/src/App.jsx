import { useState } from "react";
import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import { Routes, Route } from "react-router-dom";
import DashboardScreen from "./screens/DashboardScreen";
import PostsScreen from "./screens/PostsScreen";
import BreathingExerciseScreen from "./screens/BreathingExerciseScreen";
import MusicPlayer from "./screens/MusicScreen";
import KeqingScreen from "./screens/KeqingScreen"; // AI Assistant Screen
import ProfileScreen from "./screens/ProfileScreen";
import MoodTrackerScreen from "./screens/MoodTrackerScreen";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SplashScreen />} /> 
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/posts" element={<PostsScreen />} />
        <Route path="/breathing" element={<BreathingExerciseScreen />} />
        <Route path="/music" element={<MusicPlayer />} />
        <Route path="/ai-assistant" element={<KeqingScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/mood-tracker" element={<MoodTrackerScreen />} />
      </Routes>
    </>
  );
}

export default App;
