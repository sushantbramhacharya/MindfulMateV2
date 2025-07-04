import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import axios from 'axios'; // Import axios

// Main App component
const App = () => {
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' }); // For user feedback messages
  const [currentPlayingMusic, setCurrentPlayingMusic] = useState(null); // New state for currently playing music
  const audioRef = useRef(null); // Ref for the audio element

  // Form states for new music upload
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Relaxation');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);

  // Predefined categories for music
  const categories = [
    'Relaxation',
    'Focus',
    'Sleep',
    'Stress Relief',
    'Meditation',
    'Nature',
    'Ambient'
  ];

  // Effect hook to fetch music list on component mount
  useEffect(() => {
    fetchMusic();
  }, []);

  // Effect hook to control audio playback
  useEffect(() => {
    if (audioRef.current && currentPlayingMusic) {
      audioRef.current.load(); // Load the new audio source
      audioRef.current.play().catch(e => console.error("Error playing audio:", e)); // Attempt to play
    }
  }, [currentPlayingMusic]);

  /**
   * Displays a message to the user for a short duration.
   * @param {string} type - Type of message (e.g., 'success', 'error').
   * @param {string} text - The message content.
   */
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000); // Message disappears after 3 seconds
  };

  /**
   * Fetches the list of music from the backend API using axios.
   */
  const fetchMusic = async () => {
    setLoading(true); // Set loading state to true
    try {
      // Use axios.get to fetch data
      const response = await axios.get('http://localhost:5000/api/music');
      setMusicList(response.data.data || []); // Access data via response.data
    } catch (error) {
      console.error('Failed to fetch music list:', error);
      showMessage('error', 'Failed to fetch music list'); // Show error message
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  /**
   * Handles changes to the file input field.
   * @param {Event} e - The change event.
   */
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]); // Set the selected file
    }
  };

  /**
   * Handles the submission of the new music upload form using axios.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!file) {
      showMessage('error', 'Please select a music file'); // Validate file selection
      return;
    }

    // Create FormData object to send file and other data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('author', author);
    formData.append('category', category);
    formData.append('tags', tags);

    setUploading(true); // Set uploading state to true
    try {
      // Use axios.post to upload data
      const response = await axios.post('http://localhost:5000/api/music', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // axios handles this automatically with FormData, but good to be explicit
        },
        withCredentials: true // Important for sending cookies with cross-origin requests
      });

      showMessage('success', response.data.message); // Access message via response.data

      // Reset form fields
      setAuthor('');
      setCategory('Relaxation');
      setTags('');
      setFile(null);
      
      fetchMusic(); // Refresh the music list
    } catch (error) {
      console.error('Failed to upload music:', error);
      showMessage('error', 'Failed to upload music'); // Show error message
    } finally {
      setUploading(false); // Reset uploading state
    }
  };

  /**
   * Initiates the edit mode for a specific music item.
   * @param {Object} music - The music object to be edited.
   */
  const startEdit = (music) => {
    setEditingId(music.id); // Set the ID of the music being edited
    setEditData({
      author: music.author,
      category: music.category,
      tags: music.tags.join(', ') // Convert tags array to comma-separated string
    });
  };

  /**
   * Cancels the current edit operation.
   */
  const cancelEdit = () => {
    setEditingId(null); // Clear editing ID
    setEditData({}); // Clear edit data
  };

  /**
   * Saves the edited music details to the backend using axios.
   */
  const saveEdit = async () => {
    if (!editingId) return; // Do nothing if no item is being edited

    try {
      // Prepare update payload
      const updates = {
        author: editData.author,
        category: editData.category,
        tags: editData.tags?.split(',').map(t => t.trim()).filter(t => t) || [] // Convert back to array
      };

      // Use axios.put to update music
      await axios.put(`http://localhost:5000/api/music/${editingId}`, updates, {
        withCredentials: true // Important for sending cookies
      });

      showMessage('success', 'Music updated successfully'); // Show success message
      fetchMusic(); // Refresh the music list
      cancelEdit(); // Exit edit mode
    } catch (error) {
      console.error('Failed to update music:', error);
      showMessage('error', 'Failed to update music'); // Show error message
    }
  };

  /**
   * Deletes a music item from the backend using axios.
   * @param {string} id - The ID of the music item to delete.
   */
  const deleteMusic = async (id) => {
    // Custom confirmation dialog instead of window.confirm
    const confirmDelete = window.confirm('Are you sure you want to delete this music?');
    if (!confirmDelete) return;

    try {
      // Use axios.delete to remove music
      await axios.delete(`http://localhost:5000/api/music/${id}`, {
        withCredentials: true // Important for sending cookies
      });

      showMessage('success', 'Music deleted successfully'); // Show success message
      fetchMusic(); // Refresh the music list
    } catch (error) {
      console.error('Failed to delete music:', error);
      showMessage('error', 'Failed to delete music'); // Show error message
    }
  };

  /**
   * Sets the currently playing music.
   * @param {Object} music - The music object to play.
   */
  const playMusic = (music) => {
    setCurrentPlayingMusic(music);
    showMessage('success', `Now playing: ${music.filename}`);
  };

  /**
   * Filters the music list based on the search term.
   */
  const filteredMusic = musicList.filter(music =>
    music.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    music.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    music.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 font-sans">
      {/* Tailwind CSS CDN for styling */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Google Fonts for Inter font */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>

      <div className="container mx-auto px-4 py-8 max-w-4xl w-full">
        {/* Message Display */}
        {message.text && (
          <div className={`p-3 rounded-md mb-4 text-white text-center ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {message.text}
          </div>
        )}

        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Music Manager</h1>
        
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-5">Upload New Music</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div>
                <label htmlFor="author" className="block text-gray-700 text-sm font-medium mb-2">Author</label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 bg-white"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mb-5">
              <label htmlFor="tags" className="block text-gray-700 text-sm font-medium mb-2">Tags (comma separated)</label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                placeholder="e.g. calm, relaxing, piano"
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="musicFile" className="block text-gray-700 text-sm font-medium mb-2">Music File</label>
              <input
                type="file"
                id="musicFile"
                onChange={handleFileChange}
                className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                accept=".mp3,.wav,.aac,.flac,.ogg"
                required
              />
              <p className="text-xs text-gray-500 mt-2">Supported formats: MP3, WAV, AAC, FLAC, OGG</p>
            </div>
            
            <button
              type="submit"
              disabled={uploading}
              className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:shadow-lg'}`}
            >
              {uploading ? 'Uploading...' : 'Upload Music'}
            </button>
          </form>
        </div>
        
        {/* Search and List Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">Music Library</h2>
            <input
              type="text"
              placeholder="Search music by author, category, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : filteredMusic.length === 0 ? (
            <p className="text-gray-500 text-center py-10 text-lg">No music found. Start by uploading some!</p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMusic.map((music) => (
                    <tr key={music.id} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingId === music.id ? (
                          <input
                            type="text"
                            value={editData.author || ''}
                            onChange={(e) => setEditData({...editData, author: e.target.value})}
                            className="border border-gray-300 rounded-md px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          music.author
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingId === music.id ? (
                          <select
                            value={editData.category || ''}
                            onChange={(e) => setEditData({...editData, category: e.target.value})}
                            className="border border-gray-300 rounded-md px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        ) : (
                          music.category
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {editingId === music.id ? (
                          <input
                            type="text"
                            value={editData.tags || ''}
                            onChange={(e) => setEditData({...editData, tags: e.target.value})}
                            className="border border-gray-300 rounded-md px-2 py-1 w-full focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          music.tags.join(', ')
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => playMusic(music)}
                            className="p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition duration-150"
                            title="Play Music"
                          >
                            {/* Play icon (simple SVG) */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <a 
                            href={music.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {music.filename}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingId === music.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={saveEdit}
                              className="bg-green-600 text-white px-3 py-1 rounded-md shadow-sm hover:bg-green-700 transition duration-200"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-500 text-white px-3 py-1 rounded-md shadow-sm hover:bg-gray-600 transition duration-200"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEdit(music)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded-md shadow-sm hover:bg-yellow-600 transition duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteMusic(music.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded-md shadow-sm hover:bg-red-700 transition duration-200"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Music Player Section */}
        {currentPlayingMusic && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 shadow-lg flex items-center justify-center space-x-4 rounded-t-xl">
            <div className="text-center">
              <p className="text-sm">Now Playing:</p>
              <p className="font-semibold text-lg">{currentPlayingMusic.filename}</p>
              <p className="text-xs text-gray-400">{currentPlayingMusic.author}</p>
            </div>
            <audio ref={audioRef} controls autoPlay className="w-full max-w-md">
              <source src={currentPlayingMusic.file_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <button
              onClick={() => setCurrentPlayingMusic(null)}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 transition duration-150"
              title="Close Player"
            >
              {/* Close icon (simple SVG) */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
