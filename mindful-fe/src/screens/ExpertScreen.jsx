import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import HeaderComponent from "../components/HeaderComponent";
import { useAuth } from "../context/AuthContext";
import {
  FaMoneyBillWave,
  FaComments,
  FaPaperPlane,
  FaTimes,
} from "react-icons/fa";

const PRICE_PER_MESSAGE = 25;

const ChatExpertScreen = () => {
  const { user } = useAuth();

  const [messagesLeft, setMessagesLeft] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const totalPrice =
    buyAmount && !isNaN(buyAmount) && buyAmount > 0
      ? buyAmount * PRICE_PER_MESSAGE
      : 0;

  const messagesEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  // Fetch chat count from backend API
  const fetchChatCount = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/chat-count", {
        withCredentials: true,
      });
      if (res.data && typeof res.data.chat_count === "number") {
        setMessagesLeft(res.data.chat_count);
      }
    } catch (err) {
      console.error("Failed to fetch chat count:", err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchChatCount();
  }, [user]);

  // Fetch messages function
  const fetchMessages = async () => {
    if (!user) return;
    try {
      const res = await axios.get("http://localhost:5000/api/messages", {
        withCredentials: true,
      });
      if (Array.isArray(res.data)) {
        const formatted = res.data.map((msg) => ({
          sender: msg.sender_type,
          text: msg.content,
        }));
        setChatMessages(formatted);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // Fetch messages on mount and user change
  useEffect(() => {
    fetchMessages();
  }, [user]);

  // Scroll to bottom whenever chatMessages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Check for payment callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pidx = params.get('pidx');
    if (pidx) {
      // Payment callback detected, refetch chat count
      fetchChatCount();
      // Clear query parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const openModal = () => setModalOpen(true);
  const closeModal = () => {
    setModalOpen(false);
    setBuyAmount("");
  };

  const handleBuyChat = async () => {
    const amount = parseInt(buyAmount, 10);
    if (!user) {
      alert("Please log in to buy chat messages.");
      return;
    }
    if (!amount || amount <= 0) {
      alert("Please enter a valid number of messages to buy (greater than 0).");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/buy-messages",
        {
          chat_credits: amount,
          amount: amount * PRICE_PER_MESSAGE * 100, // Convert NPR to paisa
        },
        { withCredentials: true }
      );
      if (res.data.payment_url) {
        window.location.href = res.data.payment_url;
      } else {
        alert("Failed to initiate payment. Please try again.");
      }
    } catch (err) {
      console.error("Failed to initiate payment:", err);
      alert("Failed to initiate payment: " + (err.response?.data?.message || "Unknown error"));
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    if (messagesLeft <= 0) {
      alert("No chat messages left. Please buy more to continue chatting.");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/messages",
        { content: inputMessage.trim() },
        { withCredentials: true }
      );

      if (res.status === 201 && res.data.data) {
        setMessagesLeft((prev) => prev - 1);
        setInputMessage("");
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
      <HeaderComponent />
      <main className="w-full px-20 pt-20">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-md flex flex-col h-[650px] w-full max-w-full">
          <h2 className="text-3xl font-bold text-purple-900 mb-6 text-center flex justify-center items-center gap-2">
            <FaComments className="text-purple-600" />
            Chat with a Mental Health Expert
          </h2>

          <div className="mb-4 text-purple-900 font-semibold flex justify-between items-center">
            <span>Messages left: {messagesLeft}</span>
            <button
              onClick={openModal}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-semibold shadow transition"
            >
              Buy Messages
            </button>
          </div>

          <div
            ref={messagesEndRef}
            className="flex-grow overflow-y-auto bg-white rounded-md p-4 border border-purple-300 mb-4 flex flex-col gap-3"
          >
            {chatMessages.length === 0 && (
              <p className="text-purple-500 italic text-center mt-auto mb-auto">
                Start chatting by sending a message.
              </p>
            )}
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[75%] p-3 rounded-lg ${
                  msg.sender === "user"
                    ? "bg-purple-600 text-white self-end"
                    : "bg-purple-200 text-purple-900 self-start"
                }`}
                style={{ wordWrap: "break-word" }}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow p-3 rounded border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder={
                messagesLeft > 0
                  ? "Type your message here..."
                  : "Buy messages to chat"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSendMessage();
              }}
              disabled={messagesLeft <= 0}
              aria-label="Chat message input"
            />
            <button
              onClick={handleSendMessage}
              disabled={messagesLeft <= 0}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-full font-semibold shadow transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              Send <FaPaperPlane />
            </button>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={closeModal}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-purple-600 hover:text-purple-800 text-xl"
              aria-label="Close modal"
            >
              <FaTimes />
            </button>

            <h3 className="text-2xl font-bold text-purple-900 mb-4">
              Buy Chat Messages
            </h3>

            <label className="block text-purple-800 font-semibold mb-2">
              Enter number of messages to buy (Rs. {PRICE_PER_MESSAGE} each):
            </label>
            <input
              type="number"
              min="1"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              className="p-2 rounded border border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-full mb-4"
              placeholder="e.g. 10"
            />

            <div className="text-purple-900 font-bold text-lg mb-6 flex items-center gap-2">
              <FaMoneyBillWave /> Total Price: Rs. {totalPrice}
            </div>

            <button
              onClick={handleBuyChat}
              disabled={!buyAmount || totalPrice <= 0}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-semibold shadow transition disabled:opacity-50 disabled:cursor-not-allowed w-full"
            >
              Pay & Add Messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatExpertScreen;