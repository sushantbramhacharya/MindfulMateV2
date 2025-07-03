import React, { useState, useRef, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaTimes,
  FaMusic,
  FaSearch,
} from "react-icons/fa";
import HeaderComponent from "../components/HeaderComponent";

const sampleSongs = [
  {
    id: 1,
    title: "Calm Meditation",
    artist: "Peaceful Artist",
    category: "Meditation",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?&w=200&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Focus Beats",
    artist: "Concentrate Crew",
    category: "Focus",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?&w=200&h=200&fit=crop",
  },
  {
    id: 3,
    title: "Relaxing Waves",
    artist: "Ocean Sounds",
    category: "Relaxation",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?&w=200&h=200&fit=crop",
  },
  {
    id: 4,
    title: "Sleep Tight",
    artist: "Dreamer",
    category: "Sleep",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover:
      "https://images.unsplash.com/photo-1485579149621-3123dd979885?&w=200&h=200&fit=crop",
  },
  {
    id: 5,
    title: "Mood Boost",
    artist: "Happy Tunes",
    category: "Mood Boost",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    cover:
      "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?&w=200&h=200&fit=crop",
  },
];

const categories = [
  "All",
  "Meditation",
  "Focus",
  "Relaxation",
  "Sleep",
  "Mood Boost",
];

export default function MusicScreen() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [playingSong, setPlayingSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const filteredSongs = sampleSongs.filter((song) => {
    const categoryCheck =
      selectedCategory === "All" || song.category === selectedCategory;
    const searchCheck =
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryCheck && searchCheck;
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    audio.addEventListener("timeupdate", updateProgress);

    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
    });

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [playingSong]);

  const togglePlayPause = () => {
    if (!playingSong) return;
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const val = e.target.value;
    audio.currentTime = (audio.duration * val) / 100;
    setProgress(val);
  };

  const closePlayer = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setPlayingSong(null);
    setIsPlaying(false);
    setProgress(0);
  };

  const formatTime = (sec) => {
    if (isNaN(sec)) return "00:00";
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(sec % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <>
    <HeaderComponent/>
    <div className="bg-white min-h-screen p-6 max-w-4xl mx-auto font-sans text-gray-800">
      {/* CATEGORY FILTER */}
      <div className="flex justify-center gap-3 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full font-semibold transition-shadow 
              ${
                selectedCategory === cat
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-purple-100 text-purple-700 hover:bg-purple-200"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md mx-auto mb-8">
        <FaSearch className="absolute top-3 left-3 text-purple-400" />
        <input
          type="search"
          placeholder="Search songs or artists..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm transition"
        />
      </div>

      {/* SONGS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSongs.length === 0 && (
          <p className="text-center col-span-2 text-purple-600 font-semibold">
            No songs found.
          </p>
        )}

        {filteredSongs.map((song) => (
          <div
            key={song.id}
            onClick={() => {
              setPlayingSong(song);
              setIsPlaying(false);
              setProgress(0);
            }}
            className="cursor-pointer flex gap-4 items-center bg-purple-50 rounded-2xl p-4 shadow-md hover:shadow-lg transition"
          >
            <img
              src={song.cover}
              alt={song.title}
              className="w-20 h-20 rounded-xl object-cover shadow-inner"
            />
            <div className="flex flex-col flex-grow">
              <span className="text-lg font-semibold text-purple-900">
                {song.title}
              </span>
              <span className="text-purple-700">{song.artist}</span>
              <span className="text-xs text-purple-400 mt-1 uppercase font-semibold tracking-wide">
                {song.category}
              </span>
            </div>
            <div className="text-purple-600 text-3xl">
              <FaMusic />
            </div>
          </div>
        ))}
      </div>

      {/* PLAYER MODAL */}
      {playingSong && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl rounded-t-3xl p-6 max-w-4xl mx-auto z-50">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4 items-center">
              <img
                src={playingSong.cover}
                alt={playingSong.title}
                className="w-16 h-16 rounded-lg object-cover shadow-md"
              />
              <div>
                <h3 className="text-xl font-semibold text-purple-900">
                  {playingSong.title}
                </h3>
                <p className="text-purple-700">{playingSong.artist}</p>
              </div>
            </div>
            <button
              onClick={closePlayer}
              className="text-purple-700 hover:text-purple-900 text-2xl"
              aria-label="Close player"
            >
              <FaTimes />
            </button>
          </div>

          <audio ref={audioRef} src={playingSong.src} preload="metadata" />

          {/* Progress bar */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-2 rounded-lg cursor-pointer mb-3 accent-purple-600"
          />

          {/* Time display */}
          <div className="flex justify-between text-sm text-purple-600 mb-6">
            <span>
              {audioRef.current
                ? formatTime(audioRef.current.currentTime)
                : "00:00"}
            </span>
            <span>
              {audioRef.current
                ? formatTime(audioRef.current.duration)
                : "00:00"}
            </span>
          </div>

          {/* Controls */}
          <div className="flex justify-center">
            <button
              onClick={togglePlayPause}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg text-4xl"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
