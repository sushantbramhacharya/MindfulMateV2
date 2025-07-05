import React, { useState, useEffect } from "react";
import {
  FaSmile,
  FaMeh,
  FaFrown,
  FaTired,
  FaAngry,
  FaGrinStars,
} from "react-icons/fa";
import HeaderComponent from "../components/HeaderComponent";
import axios from "axios";
import MoodLineChart from "../components/MoodLineChartComponent";

const moods = [
  { name: "Happy", icon: FaSmile, bg: "bg-green-500", border: "border-green-700", text: "text-green-600", hover: "hover:bg-green-50" },
  { name: "Neutral", icon: FaMeh, bg: "bg-amber-500", border: "border-amber-700", text: "text-amber-600", hover: "hover:bg-amber-50" },
  { name: "Sad", icon: FaFrown, bg: "bg-blue-500", border: "border-blue-700", text: "text-blue-600", hover: "hover:bg-blue-50" },
  { name: "Anxious", icon: FaTired, bg: "bg-orange-500", border: "border-orange-700", text: "text-orange-600", hover: "hover:bg-orange-50" },
  { name: "Angry", icon: FaAngry, bg: "bg-red-500", border: "border-red-700", text: "text-red-600", hover: "hover:bg-red-50" },
  { name: "Excited", icon: FaGrinStars, bg: "bg-pink-500", border: "border-pink-700", text: "text-pink-600", hover: "hover:bg-pink-50" },
];

const MoodTrackerScreen = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logLoading, setLogLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/moods`, {
        withCredentials: true,
      });
      const sorted = (res.data || [])
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .slice(-10);
      setMoodHistory(sorted);
    } catch (err) {
      console.error("Failed to fetch mood history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogMood = async () => {
    if (!selectedMood) return alert("Please select a mood");
    setLogLoading(true);
    try {
      await axios.post(
        `${baseUrl}/api/moods`,
        { mood: selectedMood, notes },
        { withCredentials: true }
      );
      setSelectedMood(null);
      setNotes("");
      fetchMoodHistory();
    } catch (err) {
      alert("Failed to log mood");
    } finally {
      setLogLoading(false);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="min-h-screen bg-purple-50">
      <HeaderComponent />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Use the MoodLineChart component here */}
        <h2 className="text-3xl font-bold text-purple-800 text-center mb-6">
          Recent Mood Logs
        </h2>
        <MoodLineChart moodHistory={moodHistory} />

        {/* Mood Tracker UI */}
        <h2 className="text-3xl font-bold text-purple-800 text-center mb-6 mt-12">
          How are you feeling today?
        </h2>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-6">
          {moods.map(({ name, icon: Icon, bg, border, text, hover }) => {
            const isSelected = selectedMood === name;
            return (
              <button
                key={name}
                onClick={() => setSelectedMood(name)}
                className={`flex flex-col items-center p-4 rounded-xl border-2 transition duration-200 ${
                  isSelected
                    ? `${bg} text-white ${border} shadow-lg`
                    : `bg-white ${text} ${border.replace("700", "300")} ${hover}`
                }`}
              >
                <div className={`text-3xl mb-2 ${isSelected ? "text-white" : text}`}>
                  <Icon />
                </div>
                <span className="font-semibold">{name}</span>
              </button>
            );
          })}
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          className="w-full p-4 rounded-xl border border-purple-300 mb-6 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
          rows={3}
        />

        <button
          onClick={handleLogMood}
          disabled={logLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg transition"
        >
          {logLoading ? "Logging..." : "Log My Mood"}
        </button>

        <div className="mt-10">
          <h3 className="text-2xl font-bold text-purple-800 mb-4 text-center">
            Your Mood History
          </h3>

          {loading ? (
            <p className="text-center text-purple-500">Loading mood history...</p>
          ) : moodHistory.length === 0 ? (
            <p className="text-center text-purple-500">No mood entries yet.</p>
          ) : (
            <div className="space-y-4">
              {moodHistory.map((entry) => (
                <div
                  key={entry.id || entry._id}
                  className="bg-white border border-purple-200 p-4 rounded-xl shadow-sm"
                >
                  <div className="flex justify-between">
                    <span className="font-semibold text-purple-800">Mood: {entry.mood}</span>
                    <span className="text-sm text-purple-500">{formatDate(entry.created_at)}</span>
                  </div>
                  {entry.notes && (
                    <p className="mt-2 text-purple-700 italic">Notes: {entry.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoodTrackerScreen;
