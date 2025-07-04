import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const App = () => {
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [currentPlayingMusic, setCurrentPlayingMusic] = useState(null);
  const audioRef = useRef(null);

  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Relaxation');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [musicName, setMusicName] = useState('');

  const categories = ['Relaxation', 'Focus', 'Sleep', 'Stress Relief', 'Meditation', 'Nature', 'Ambient'];

  useEffect(() => { fetchMusic(); }, []);
  useEffect(() => {
    if (audioRef.current && currentPlayingMusic) {
      audioRef.current.load();
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
    }
  }, [currentPlayingMusic]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const fetchMusic = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/music');
      setMusicList(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch music list:', error);
      showMessage('error', 'Failed to fetch music list');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file || !musicName.trim()) {
      showMessage('error', 'Please fill all fields and select a music file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('author', author);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('music_name', musicName);

    setUploading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/music', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      showMessage('success', response.data.message);
      setAuthor('');
      setCategory('Relaxation');
      setTags('');
      setMusicName('');
      setFile(null);
      fetchMusic();
    } catch (error) {
      console.error('Failed to upload music:', error);
      showMessage('error', 'Failed to upload music');
    } finally {
      setUploading(false);
    }
  };

  const startEdit = (music) => {
    setEditingId(music.id);
    setEditData({
      author: music.author,
      category: music.category,
      tags: music.tags.join(', '),
      music_name: music.music_name || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingId) return;

    const updates = {
      author: editData.author,
      category: editData.category,
      tags: editData.tags?.split(',').map(t => t.trim()).filter(t => t) || [],
      music_name: editData.music_name
    };

    try {
      await axios.put(`http://localhost:5000/api/music/${editingId}`, updates, {
        withCredentials: true
      });
      showMessage('success', 'Music updated successfully');
      fetchMusic();
      cancelEdit();
    } catch (error) {
      console.error('Failed to update music:', error);
      showMessage('error', 'Failed to update music');
    }
  };

  const deleteMusic = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this music?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/music/${id}`, {
        withCredentials: true
      });
      showMessage('success', 'Music deleted successfully');
      fetchMusic();
    } catch (error) {
      console.error('Failed to delete music:', error);
      showMessage('error', 'Failed to delete music');
    }
  };

  const playMusic = (music) => {
    setCurrentPlayingMusic(music);
    showMessage('success', `Now playing: ${music.music_name || music.filename}`);
  };

  const filteredMusic = musicList.filter(music =>
    music.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    music.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    music.music_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    music.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl w-full">
        {message.text && (
          <div className={`p-3 rounded-md mb-4 text-white text-center ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}>{message.text}</div>
        )}

        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Music Manager</h1>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-5">Upload New Music</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Author</label>
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. John Doe" required />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-white" required>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-medium mb-2">Music Name</label>
              <input type="text" value={musicName} onChange={(e) => setMusicName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. Peaceful Sunrise" required />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 text-sm font-medium mb-2">Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. calm, piano" />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">Music File</label>
              <input type="file" onChange={handleFileChange}
                className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept=".mp3,.wav,.aac,.flac,.ogg" required />
            </div>

            <button type="submit" disabled={uploading}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg shadow-md ${uploading ? 'opacity-50' : 'hover:bg-blue-700'}`}>
              {uploading ? 'Uploading...' : 'Upload Music'}
            </button>
          </form>
        </div>

        {/* Music Table Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-semibold text-gray-800">Music Library</h2>
            <input type="text" placeholder="Search..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg w-full md:w-80" />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium">Music Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium">Tags</th>
                    <th className="px-6 py-3 text-left text-xs font-medium">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMusic.map((music) => (
                    <tr key={music.id}>
                      <td className="px-6 py-4 text-sm">{editingId === music.id ?
                        <input value={editData.author || ''} onChange={(e) => setEditData({...editData, author: e.target.value})}
                          className="border rounded px-2 py-1 w-full" /> :
                        music.author}</td>

                      <td className="px-6 py-4 text-sm">{editingId === music.id ?
                        <select value={editData.category || ''} onChange={(e) => setEditData({...editData, category: e.target.value})}
                          className="border rounded px-2 py-1 w-full bg-white">
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select> : music.category}</td>

                      <td className="px-6 py-4 text-sm">{editingId === music.id ?
                        <input value={editData.music_name || ''} onChange={(e) => setEditData({...editData, music_name: e.target.value})}
                          className="border rounded px-2 py-1 w-full" /> :
                        music.music_name}</td>

                      <td className="px-6 py-4 text-sm">{editingId === music.id ?
                        <input value={editData.tags || ''} onChange={(e) => setEditData({...editData, tags: e.target.value})}
                          className="border rounded px-2 py-1 w-full" /> :
                        music.tags.join(', ')}</td>

                      <td className="px-6 py-4 text-sm">
                        <button onClick={() => playMusic(music)} className="text-blue-500 hover:underline">▶</button>
                        <a href={music.file_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                          {music.filename}
                        </a>
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {editingId === music.id ? (
                          <div className="flex space-x-2">
                            <button onClick={saveEdit} className="bg-green-500 text-white px-3 py-1 rounded">Save</button>
                            <button onClick={cancelEdit} className="bg-gray-500 text-white px-3 py-1 rounded">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button onClick={() => startEdit(music)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
                            <button onClick={() => deleteMusic(music.id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
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
          <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex items-center justify-center space-x-4">
            <div>
              <p className="text-sm">Now Playing:</p>
              <p className="font-semibold">{currentPlayingMusic.music_name || currentPlayingMusic.filename}</p>
              <p className="text-xs text-gray-400">{currentPlayingMusic.author}</p>
            </div>
            <audio ref={audioRef} controls autoPlay className="w-full max-w-md">
              <source src={currentPlayingMusic.file_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <button onClick={() => setCurrentPlayingMusic(null)} className="bg-red-500 px-3 py-1 rounded">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
