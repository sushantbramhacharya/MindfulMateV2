import React from "react";
import HeaderComponent from "../components/HeaderComponent";
import { FaPhoneAlt, FaCopy } from "react-icons/fa";

const helplines = [
  {
    country: "Nepal",
    name: "TUTH Mental Health Helpline",
    number: "1660-01-34567",
    description: "Free confidential support line by Tribhuvan University Teaching Hospital.",
  },
  {
    country: "Nepal",
    name: "TPO Nepal",
    number: "9840021600",
    description: "Mental health counseling 9AM–5PM. Transcultural Psychosocial Organization Nepal.",
  },
  {
    country: "Global",
    name: "Befrienders Worldwide",
    number: "https://www.befrienders.org/",
    description: "Find emotional support helplines available in your country.",
  },
];

const CallHelplineScreen = () => {
  const handleCall = (number) => {
    if (number.startsWith("http")) {
      window.open(number, "_blank");
    } else {
      window.location.href = `tel:${number}`;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Number copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300">
      <HeaderComponent />

      <main className="max-w-4xl mx-auto p-6 pt-24">
        <div className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-md">
          <h2 className="text-3xl font-bold text-purple-900 mb-6 text-center">
            📞 Mental Health Helplines
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {helplines.map((item, idx) => (
              <div
                key={idx}
                className="bg-white/40 backdrop-blur-md border border-purple-300 rounded-2xl p-6 shadow-md hover:shadow-xl transition"
              >
                <div className="text-xl font-semibold text-purple-900 mb-1">
                  {item.name}
                </div>
                <div className="text-sm text-purple-700 mb-3">
                  ({item.country}) – {item.description}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => handleCall(item.number)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                  >
                    <FaPhoneAlt /> Call
                  </button>

                  {!item.number.startsWith("http") && (
                    <button
                      onClick={() => copyToClipboard(item.number)}
                      className="text-purple-700 hover:underline flex items-center gap-2"
                    >
                      <FaCopy /> Copy
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CallHelplineScreen;
