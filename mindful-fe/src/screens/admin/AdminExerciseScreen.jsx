import React, { useState, useEffect } from "react";
import axios from "axios";
import HeaderComponent from "../../components/HeaderComponent";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
const categories = ["Strength", "Cardio", "Stretching", "Yoga", "Warm-Up"];

const initialExercise = {
  title: "",
  category: "",
  duration: "",
  description: "",
  video: null,
  steps: [""],
};

export default function ExerciseManagerScreen() {
  const navigate = useNavigate();
  const {user}=useAuth();
  
    useEffect(() => {
      // Redirect to login if user is not authenticated or not an admin
      if (user === null) return;
   
      if (user.id !== 4) {
        navigate("/unauthorized");
      }
    }, [user, navigate]);
  const [exercise, setExercise] = useState({ ...initialExercise });
  const [exercises, setExercises] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  // Fetch all exercises on mount
  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/exercises");
      setExercises(res.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExercise({ ...exercise, [name]: value });
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExercise({ ...exercise, video: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...exercise.steps];
    updatedSteps[index] = value;
    setExercise({ ...exercise, steps: updatedSteps });
  };

  const addStepField = () => {
    setExercise({ ...exercise, steps: [...exercise.steps, ""] });
  };

  const resetForm = () => {
    setExercise({ ...initialExercise });
    setPreviewUrl(null);
    setEditingId(null);
    setMessage(null);
  };

  const handleEdit = (ex) => {
    setExercise({
      ...ex,
      video: null, // video file not refetched; only URL present
      steps: ex.steps || [""], // in case steps is missing
    });
    setEditingId(ex.id);
    setPreviewUrl(ex.video_url);
    setMessage(null);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/exercises/${id}`);
      setExercises(exercises.filter((ex) => ex.id !== id));
      if (editingId === id) resetForm();
      setMessage("Exercise deleted successfully.");
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage("Delete failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData();
    formData.append("title", exercise.title);
    formData.append("category", exercise.category);
    formData.append("duration", exercise.duration);
    formData.append("description", exercise.description);
    formData.append("steps", JSON.stringify(exercise.steps));
    if (exercise.video) {
      formData.append("video", exercise.video);
    }

    try {
      if (editingId) {
        // UPDATE
        const res = await axios.put(
          `http://localhost:5000/api/exercises/${editingId}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setExercises(
          exercises.map((ex) => (ex.id === editingId ? res.data.data : ex))
        );
        setMessage("Exercise updated successfully.");
      } else {
        // CREATE
        const res = await axios.post(
          "http://localhost:5000/api/exercises",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setExercises([...exercises, res.data.data]);
        setMessage("Exercise created successfully.");
      }
      resetForm();
    } catch (err) {
      console.error("Save failed:", err);
      setMessage("Error saving exercise.");
    }
  };

  return (
    <>
      <HeaderComponent />
      <div className="bg-white min-h-screen p-6 max-w-4xl mx-auto text-gray-800">
        <h2 className="text-2xl font-bold mb-6 text-green-700">
          {editingId ? "Edit Exercise" : "Upload New Exercise"}
        </h2>

        {message && (
          <p className="mb-4 text-center text-green-600 font-semibold">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder="Exercise Title"
            value={exercise.title}
            onChange={handleChange}
            required
            className="w-full border border-green-300 p-3 rounded-lg"
          />

          <select
            name="category"
            value={exercise.category}
            onChange={handleChange}
            required
            className="w-full border border-green-300 p-3 rounded-lg"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            name="duration"
            placeholder="Duration (e.g. 30 secs)"
            value={exercise.duration}
            onChange={handleChange}
            required
            className="w-full border border-green-300 p-3 rounded-lg"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={exercise.description}
            onChange={handleChange}
            required
            className="w-full border border-green-300 p-3 rounded-lg"
          />

          <div>
            <label className="block font-semibold text-green-600 mb-1">
              Upload Video File {editingId && "(optional)"}
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoChange}
              className="w-full border border-green-300 p-2 rounded-lg"
            />
            {previewUrl && (
              <video
                src={previewUrl}
                controls
                className="mt-3 rounded-md w-full max-h-64"
              />
            )}
          </div>

          <div>
            <label className="block font-semibold mb-2 text-green-600">Steps:</label>
            {exercise.steps.map((step, index) => (
              <input
                key={index}
                value={step}
                onChange={(e) => handleStepChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                className="w-full mb-2 border border-green-200 p-2 rounded-lg"
              />
            ))}
            <button
              type="button"
              onClick={addStepField}
              className="text-sm text-green-700 underline"
            >
              + Add Step
            </button>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              {editingId ? "Update" : "Submit"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-green-700 underline"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* LIST VIEW */}
        <h3 className="text-xl font-semibold mt-10 mb-4 text-green-700">
          All Exercises
        </h3>
        <div className="space-y-4">
          {exercises.map((ex) => (
            <div
              key={ex.id}
              className="p-4 border border-green-200 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h4 className="text-lg font-semibold text-green-900">{ex.title}</h4>
                  <p className="text-green-600 text-sm">
                    {ex.category} • {ex.duration}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(ex)}
                    className="text-green-600 underline text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ex.id)}
                    className="text-red-600 underline text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <video
                src={ex.video_url}
                controls
                className="w-full max-h-64 rounded-md"
              />
              <p className="text-sm mt-2 text-gray-700">{ex.description}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
