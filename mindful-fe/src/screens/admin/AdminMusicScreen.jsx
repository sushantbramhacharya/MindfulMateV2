import React, { useState } from "react";
import HeaderComponent from "../../components/HeaderComponent";

const categories = [
  "Relaxation",
  "Focus",
  "Sleep",
  "Stress Relief",
  "Meditation",
];

const UploadMusicScreen = () => {
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [file, setFile] = useState(null);
  const [tagsInput, setTagsInput] = useState("");
  const [message, setMessage] = useState(null);

  // List of uploaded music entries
  const [musicList, setMusicList] = useState([]);

  // For editing
  const [editingIndex, setEditingIndex] = useState(null);
  const [editAuthor, setEditAuthor] = useState("");
  const [editCategory, setEditCategory] = useState(categories[0]);
  const [editTagsInput, setEditTagsInput] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Please select a music file to upload." });
      return;
    }
    if (!author.trim()) {
      setMessage({ type: "error", text: "Please enter the author name." });
      return;
    }
    if (!category) {
      setMessage({ type: "error", text: "Please select a category." });
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Create new music entry (dummy id using Date.now)
    const newEntry = {
      id: Date.now(),
      author,
      category,
      fileName: file.name,
      tags,
    };

    setMusicList((prev) => [newEntry, ...prev]);
    setMessage({ type: "success", text: "Dummy upload successful!" });

    // Clear form
    setAuthor("");
    setCategory(categories[0]);
    setFile(null);
    setTagsInput("");
    e.target.reset();
  };

  const startEdit = (index) => {
    const entry = musicList[index];
    setEditingIndex(index);
    setEditAuthor(entry.author);
    setEditCategory(entry.category);
    setEditTagsInput(entry.tags.join(", "));
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const saveEdit = () => {
    if (!editAuthor.trim()) {
      setMessage({ type: "error", text: "Author name cannot be empty." });
      return;
    }
    if (!editCategory) {
      setMessage({ type: "error", text: "Please select a category." });
      return;
    }
    const updatedTags = editTagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setMusicList((prev) =>
      prev.map((item, idx) =>
        idx === editingIndex
          ? { ...item, author: editAuthor, category: editCategory, tags: updatedTags }
          : item
      )
    );
    setEditingIndex(null);
    setMessage({ type: "success", text: "Entry updated successfully." });
  };

  const deleteEntry = (index) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setMusicList((prev) => prev.filter((_, i) => i !== index));
      setMessage({ type: "success", text: "Entry deleted." });
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <HeaderComponent />

      <main className="max-w-xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-purple-900 mb-8 text-center">
          Upload Music (Dummy)
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-md space-y-6"
        >
          <div>
            <label htmlFor="author" className="block text-purple-800 font-semibold mb-2">
              Author Name
            </label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
              className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-purple-800 font-semibold mb-2">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tags" className="block text-purple-800 font-semibold mb-2">
              Tags (comma separated)
            </label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. calm, relaxing, piano"
              className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          <div>
            <label
              htmlFor="musicFile"
              className="block text-purple-800 font-semibold mb-2"
            >
              Select Music File
            </label>
            <input
              id="musicFile"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="w-full"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold text-lg shadow-lg transition"
          >
            Upload Music
          </button>

          {message && (
            <p
              className={`mt-4 text-center ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}
        </form>

        {/* Uploaded music list */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-purple-900 mb-6 text-center">
            Uploaded Music
          </h2>

          {musicList.length === 0 ? (
            <p className="text-center text-purple-600">No music uploaded yet.</p>
          ) : (
            <div className="space-y-6">
              {musicList.map((entry, index) => (
                <div
                  key={entry.id}
                  className="bg-white p-6 rounded-xl shadow-md border border-purple-200"
                >
                  {editingIndex === index ? (
                    <>
                      <div className="mb-4">
                        <label className="block font-semibold text-purple-700 mb-1">
                          Author Name
                        </label>
                        <input
                          type="text"
                          value={editAuthor}
                          onChange={(e) => setEditAuthor(e.target.value)}
                          className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block font-semibold text-purple-700 mb-1">
                          Category
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block font-semibold text-purple-700 mb-1">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          value={editTagsInput}
                          onChange={(e) => setEditTagsInput(e.target.value)}
                          className="w-full border border-purple-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <button
                          onClick={saveEdit}
                          className="bg-green-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-green-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-semibold hover:bg-gray-400 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>Author:</strong> {entry.author}
                      </p>
                      <p>
                        <strong>Category:</strong> {entry.category}
                      </p>
                      <p>
                        <strong>File:</strong> {entry.fileName}
                      </p>
                      <p>
                        <strong>Tags:</strong>{" "}
                        {entry.tags.length > 0 ? entry.tags.join(", ") : "None"}
                      </p>

                      <div className="mt-4 flex gap-3 justify-end">
                        <button
                          onClick={() => startEdit(index)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-600 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteEntry(index)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default UploadMusicScreen;
