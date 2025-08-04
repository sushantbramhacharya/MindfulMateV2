import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import HeaderComponent from "../../components/HeaderComponent";

const ExpertDashboard = () => {
  const [acceptedUsers, setAcceptedUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const chatMessagesRef = useRef(null);

  // Fetch accepted users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/expert/users", {
          withCredentials: true,
        });
        if (Array.isArray(res.data)) {
          setAcceptedUsers(res.data);
          if (res.data.length > 0) setSelectedUserId(res.data[0].user_id);
        }
      } catch (err) {
        console.error("Failed to fetch accepted users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch messages whenever selectedUserId changes
  useEffect(() => {
    if (!selectedUserId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/messages/${selectedUserId}`,
          { withCredentials: true }
        );
        if (Array.isArray(res.data)) {
          setChatMessages(
            res.data.map((msg) => ({
              sender: msg.sender_type,
              text: msg.content,
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch messages:", err);
        setChatMessages([]);
      }
    };
    fetchMessages();
  }, [selectedUserId]);

  // Scroll to bottom whenever chatMessages update
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages]);

  // Send message as expert
  const handleSendMessage = async () => {
    const trimmed = inputMessage.trim();
    if (!trimmed || !selectedUserId) return;

    try {
      const res = await axios.post(
        `http://localhost:5000/api/expert/messages/${selectedUserId}`,
        { content: trimmed },
        { withCredentials: true }
      );
      if (res.status === 201 && res.data.data) {
        setChatMessages((prev) => [
          ...prev,
          { sender: "expert", text: trimmed },
        ]);
        setInputMessage("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message");
    }
  };

  const selectedUser = acceptedUsers.find((u) => u.user_id === selectedUserId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 flex flex-col">
      <HeaderComponent />

      <main className="flex-grow flex w-full p-6 gap-6 min-h-0">
        {/* Left panel */}
        <aside className="w-[300px] bg-white/60 backdrop-blur-md rounded-2xl shadow-md border border-purple-300 overflow-auto">
          <h2 className="text-2xl font-bold text-purple-900 p-4 border-b border-purple-300">
            Users to Chat
          </h2>
          <ul>
            {acceptedUsers.map((user) => (
              <li
                key={user.user_id}
                onClick={() => setSelectedUserId(user.user_id)}
                className={`cursor-pointer p-4 border-b border-purple-200 hover:bg-purple-100 ${
                  user.user_id === selectedUserId
                    ? "bg-purple-200 font-semibold"
                    : ""
                }`}
              >
                {user.name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Right panel */}
        <section className="flex-1 flex flex-col bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-purple-300 min-h-0">
          <header className="p-4 border-b border-purple-300 text-purple-900 font-bold text-xl">
            Chat with {selectedUser?.name || "User"}
          </header>

          {/* Scrollable chat messages container */}
          <div
            ref={chatMessagesRef}
            className="flex-grow overflow-y-auto p-6 flex flex-col gap-4"
            style={{ minHeight: 0 }}
          >
            {chatMessages.length === 0 && (
              <p className="text-purple-500 italic text-center mt-auto mb-auto">
                No messages yet. Start chatting!
              </p>
            )}

            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[70%] p-3 rounded-lg break-words ${
                  msg.sender === "expert"
                    ? "bg-purple-600 text-white self-end"
                    : "bg-purple-200 text-purple-900 self-start"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <footer className="p-4 border-t border-purple-300 flex gap-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow p-3 rounded border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
            />
            <button
              onClick={handleSendMessage}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow transition"
            >
              Send
            </button>
          </footer>
        </section>
      </main>
    </div>
  );
};

export default ExpertDashboard;
