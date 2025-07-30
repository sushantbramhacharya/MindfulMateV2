import React, { useState } from "react";
import HeaderComponent from "../../components/HeaderComponent";

const dummyAcceptedUsers = [
  { id: 101, user_name: "Alice Johnson" },
  { id: 102, user_name: "Bob Smith" },
  { id: 103, user_name: "Charlie Brown" },
];

const dummyChats = {
  101: [
    { sender: "user", text: "Hello, I need some help." },
    { sender: "expert", text: "Hi Alice! How can I assist you today?" },
  ],
  102: [
    { sender: "user", text: "I'm feeling anxious." },
    { sender: "expert", text: "Sorry to hear that, Bob. Tell me more." },
  ],
  103: [{ sender: "user", text: "Is it normal to feel stressed sometimes?" }],
};

const ExpertDashboard = () => {
  const [selectedUserId, setSelectedUserId] = useState(dummyAcceptedUsers[0].id);
  const [chatMessages, setChatMessages] = useState(dummyChats);
  const [inputMessage, setInputMessage] = useState("");

  const selectedUser = dummyAcceptedUsers.find((u) => u.id === selectedUserId);

  const handleSendMessage = () => {
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    setChatMessages((prevChats) => {
      const userChat = prevChats[selectedUserId] || [];
      return {
        ...prevChats,
        [selectedUserId]: [...userChat, { sender: "expert", text: trimmed }],
      };
    });

    setInputMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 flex flex-col">
      <HeaderComponent />

      <main className="flex-grow flex w-full p-6 gap-6">
        {/* Left panel - user list */}
        <aside className="w-[300px] bg-white/60 backdrop-blur-md rounded-2xl shadow-md border border-purple-300 overflow-auto">
          <h2 className="text-2xl font-bold text-purple-900 p-4 border-b border-purple-300">
            Users to Chat
          </h2>
          <ul>
            {dummyAcceptedUsers.map((user) => (
              <li
                key={user.id}
                onClick={() => setSelectedUserId(user.id)}
                className={`cursor-pointer p-4 border-b border-purple-200 hover:bg-purple-100 ${
                  user.id === selectedUserId ? "bg-purple-200 font-semibold" : ""
                }`}
              >
                {user.user_name}
              </li>
            ))}
          </ul>
        </aside>

        {/* Right panel - chat */}
        <section className="flex-1 flex flex-col bg-white/70 backdrop-blur-md rounded-2xl shadow-md border border-purple-300">
          <header className="p-4 border-b border-purple-300 text-purple-900 font-bold text-xl">
            Chat with {selectedUser?.user_name || "User"}
          </header>

          <div
            className="flex-1 overflow-y-auto p-6 flex flex-col gap-4"
            style={{ minHeight: 0 }}
          >
            {(chatMessages[selectedUserId] || []).map((msg, idx) => (
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

            {(chatMessages[selectedUserId] || []).length === 0 && (
              <p className="text-purple-500 italic text-center mt-auto mb-auto">
                No messages yet. Start chatting!
              </p>
            )}
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
