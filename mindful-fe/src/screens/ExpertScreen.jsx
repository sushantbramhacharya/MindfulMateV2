import React, { useState } from "react";
import HeaderComponent from "../components/HeaderComponent";
import { FaRegClock, FaMoneyBillWave, FaComments } from "react-icons/fa";

const sessionOptions = [
  {
    duration: "30 Minutes",
    price: "Rs. 500",
    description: "Quick consultation for mild issues or check-ins.",
  },
  {
    duration: "1 Hour",
    price: "Rs. 900",
    description: "In-depth discussion for ongoing mental health support.",
  },
  {
    duration: "1 Hour (With Follow-up)",
    price: "Rs. 1500",
    description: "Includes a follow-up session within 3 days.",
  },
];

const ChatExpertScreen = () => {
  const [selected, setSelected] = useState(null);

  const handleBooking = (option) => {
    setSelected(option);
    alert(`You selected: ${option.duration} - ${option.price}\n(Integrate payment gateway here)`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
      <HeaderComponent />

      <main className="max-w-4xl mx-auto p-6 pt-24">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-md">
          <h2 className="text-3xl font-bold text-purple-900 mb-6 text-center flex justify-center items-center gap-2">
            <FaComments className="text-purple-600" />
            Chat with a Mental Health Expert
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {sessionOptions.map((option, idx) => (
              <div
                key={idx}
                className="bg-white/40 backdrop-blur-md border border-purple-300 rounded-2xl p-6 shadow-md hover:shadow-xl transition hover:scale-[1.02]"
              >
                <div className="text-lg font-semibold text-purple-900 mb-1 flex items-center gap-2">
                  <FaRegClock /> {option.duration}
                </div>
                <div className="text-sm text-purple-700 mb-3">
                  {option.description}
                </div>
                <div className="text-md font-bold text-purple-800 mb-4 flex items-center gap-2">
                  <FaMoneyBillWave /> {option.price}
                </div>
                <button
                  onClick={() => handleBooking(option)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full font-semibold shadow transition w-full"
                >
                  Book Session
                </button>
              </div>
            ))}
          </div>

          {selected && (
            <div className="mt-8 text-center text-purple-700 font-semibold">
              Booking confirmed: {selected.duration} — {selected.price}
              <br />
              <span className="text-sm text-purple-500">(Add payment logic here)</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ChatExpertScreen;
