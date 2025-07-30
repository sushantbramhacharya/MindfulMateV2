import React, { useState, useEffect } from "react";
import { FaSearch, FaTimes, FaRunning } from "react-icons/fa";
import HeaderComponent from "../components/HeaderComponent";
import axios from "axios";

const exerciseCategories = [
  "All",
  "Anxiety and stress",
  "Depression",
  "Normal",
  "Personal Disorder",
  "Yoga",
];

export default function ExerciseScreen() {
  const [exercises, setExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch exercises from backend on component mount
  useEffect(() => {
    async function fetchExercises() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get("http://localhost:5000/api/exercises");
        // API returns { data: [...] }
        setExercises(res.data.data || []);
      } catch (err) {
        setError("Failed to fetch exercises");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchExercises();
  }, []);

  // Filter exercises based on category and search term
  const filteredExercises = exercises.filter((ex) => {
    const categoryCheck =
      selectedCategory === "All" || ex.category === selectedCategory;
    const searchCheck = ex.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return categoryCheck && searchCheck;
  });

  return (
    <>
      <HeaderComponent />
      <div className="bg-white min-h-screen p-6 max-w-4xl mx-auto font-sans text-gray-800">
        {/* CATEGORY FILTER */}
        <div className="flex justify-center gap-3 mb-6 flex-wrap">
          {exerciseCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full font-semibold transition-shadow ${
                selectedCategory === cat
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* SEARCH */}
        <div className="relative max-w-md mx-auto mb-8">
          <FaSearch className="absolute top-3 left-3 text-green-400" />
          <input
            type="search"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm transition"
          />
        </div>

        {/* LOADING & ERROR */}
        {loading && (
          <p className="text-center text-green-600 font-semibold mb-4">
            Loading exercises...
          </p>
        )}
        {error && (
          <p className="text-center text-red-600 font-semibold mb-4">{error}</p>
        )}

        {/* EXERCISE LIST */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!loading && filteredExercises.length === 0 && (
            <p className="text-center col-span-2 text-green-600 font-semibold">
              No exercises found.
            </p>
          )}

          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="cursor-pointer flex gap-4 items-center bg-green-50 rounded-2xl p-4 shadow-md hover:shadow-lg transition"
            >
              <img
                src={
                  ex.image ||
                  "https://www.shutterstock.com/image-vector/vector-set-character-performing-fitness-600nw-2501497817.jpg"
                }
                alt={ex.title}
                className="w-20 h-20 rounded-xl object-cover shadow-inner"
              />
              <div className="flex flex-col flex-grow">
                <span className="text-lg font-semibold text-green-900">
                  {ex.title}
                </span>
                <span className="text-green-700 text-sm">
                  {ex.category} • {ex.duration}
                </span>
                <span className="text-xs text-green-400 mt-1">
                  {ex.description}
                </span>
              </div>
              <div className="text-green-600 text-3xl">
                <FaRunning />
              </div>
            </div>
          ))}
        </div>

        {/* EXERCISE DETAIL MODAL */}
        {selectedExercise && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl rounded-t-3xl p-6 max-w-4xl mx-auto z-50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4 items-center">
                <img
                  src={
                    selectedExercise.image ||
                    "https://via.placeholder.com/200?text=No+Image"
                  }
                  alt={selectedExercise.title}
                  className="w-16 h-16 rounded-lg object-cover shadow-md"
                />
                <div>
                  <h3 className="text-xl font-semibold text-green-900">
                    {selectedExercise.title}
                  </h3>
                  <p className="text-green-600">
                    {selectedExercise.category} • {selectedExercise.duration}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-green-700 hover:text-green-900 text-2xl"
              >
                <FaTimes />
              </button>
            </div>

            {/* VIDEO PLAYER */}
            {selectedExercise.video_url && (
  <div className="relative w-full pb-[56.25%] rounded-xl overflow-hidden shadow-md mb-4 bg-black">
    <video
      src={selectedExercise.video_url}
      controls
      className="absolute top-0 left-0 w-full h-full object-contain"
    />
  </div>
)}

            {/* Description */}
            <p className="text-green-700 mb-2">
              {selectedExercise.description}
            </p>

            {/* STEPS */}
            {selectedExercise.steps?.length > 0 && (
              <ul className="list-disc pl-6 text-green-800 space-y-1">
                {selectedExercise.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );
}
