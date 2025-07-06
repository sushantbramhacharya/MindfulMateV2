import React, { useState } from "react";
import HeaderComponent from "../components/HeaderComponent";
import { FaBolt, FaPaperPlane } from "react-icons/fa";
import axios from "axios";
import ReactMarkdown from "react-markdown";

export default function KeqingScreen() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMessage = { role: "user", text: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${baseUrl}/api/predict`,
        { text: prompt },
        { withCredentials: true }
      );

      const aiMessage = {
        role: "ai",
        text: response.data.message || "No response text",
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Failed to get prediction. Please try again." },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderComponent />
      <div className="pt-24 px-4 max-w-3xl mx-auto min-h-screen">
        <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center flex items-center justify-center gap-2">
          <FaBolt className="text-purple-500" />
          Mindful Mate Keqing
        </h2>

        <div className="bg-white/60 backdrop-blur-md border border-purple-200 rounded-xl p-6 shadow-lg space-y-4 min-h-[400px]">
          {/* Chat Window */}
          <div className="overflow-y-auto max-h-[400px] space-y-4 pr-2">
            {messages.length === 0 && (
              <p className="text-gray-500 text-center">
                Start by typing something like:{" "}
                <span className="italic text-purple-700">
                  "I feel stressed today"
                </span>
              </p>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl max-w-[80%] whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white self-end ml-auto"
                    : "bg-purple-100 text-purple-800 self-start"
                }`}
              >
                {msg.role === "ai" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            ))}
          </div>

          {/* Input Bar */}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Share your thoughts..."
              className="flex-grow px-4 py-3 rounded-xl border border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl shadow-md transition text-lg"
              disabled={loading}
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
