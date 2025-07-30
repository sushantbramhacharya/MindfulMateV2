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
import AdminDashboard from "./screens/admin/AdminDashboard";
import UploadMusicScreen from "./screens/admin/AdminMusicScreen";
import ExerciseScreen from "./screens/ExerciseScreen";
import ExerciseManagerScreen from "./screens/admin/AdminExerciseScreen";
import CallHelplineScreen from "./screens/HelplineScreen";
import ChatExpertScreen from "./screens/ExpertScreen"; // Expert Consultation Screen
import UnauthorizedScreen from "./screens/UnauthorizedScreen";
import ExpertDashboard from "./screens/expert/ExpertDashboard";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<SplashScreen />} /> 
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/posts" element={<PostsScreen />} />
        <Route path="/breathing" element={<BreathingExerciseScreen />} />
        <Route path="/exercise" element={<ExerciseScreen />} />
        <Route path="/music" element={<MusicPlayer />} />
        <Route path="/unauthorized" element={<UnauthorizedScreen />} />
        <Route path="/ai-assistant" element={<KeqingScreen />} />
        <Route path="/helpline" element={<CallHelplineScreen />} />
        <Route path="/chat-expert" element={<ChatExpertScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/mood-tracker" element={<MoodTrackerScreen />} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>}/>
        <Route path="/admin/upload-music" element={<UploadMusicScreen/>}/>
        <Route path="/admin/upload-exercise" element={<ExerciseManagerScreen/>}/>
        <Route path="/expert/dashboard" element={<ExpertDashboard />} />
      </Routes>
    </>
  );
}

export default App;
