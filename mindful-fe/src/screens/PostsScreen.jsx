import React, { useState } from 'react';

import HeaderComponent from '../components/HeaderComponent';
import FooterComponent from '../components/FooterComponent';

const categories = ['General', 'Tech', 'Lifestyle', 'Health', 'Education'];

function Post({ post, onUpvote, onComment }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-md mb-4 border border-purple-300">
      <h3 className="text-purple-900 font-bold text-xl mb-2">{post.title}</h3>
      <p className="text-purple-700 text-base mb-4 line-clamp-3">{post.content}</p>

      <div className="flex justify-between items-center mb-2">
        <span className="text-purple-400 italic text-sm">{post.timestamp}</span>
        <span className="bg-purple-200 text-purple-800 text-xs font-semibold px-3 py-1 rounded-xl">{post.category}</span>
      </div>

      <div className="flex justify-end items-center space-x-4">
        <button
          onClick={() => onUpvote(post.id)}
          className="flex items-center space-x-1 text-purple-600 hover:text-purple-900"
          aria-label="Upvote post"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2 21h4V9H2v12zm19-11h-6.31l.95-4.57.03-.32a1.003 1.003 0 0 0-1.66-.77L7 11v9h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05a1 1 0 0 0-.86-1.43z" />
          </svg>
          <span className="font-semibold">{post.upvotes}</span>
        </button>
        <button
          onClick={() => onComment(post.id)}
          className="flex items-center space-x-1 text-purple-600 hover:text-purple-900"
          aria-label="Comment on post"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h6m-4 8v-4a4 4 0 0 1 4-4h1" />
          </svg>
          <span className="font-semibold">Comment</span>
        </button>
      </div>
    </div>
  );
}

export default function PostsScreen() {
  const [posts, setPosts] = useState([
    {
      id: '1',
      title: 'Welcome to Mindful Mate',
      content: 'This is a dummy post to showcase the UI design. Feel free to upvote or comment!',
      timestamp: '7/3/2025 09:00',
      category: 'General',
      upvotes: 5,
    },
    {
      id: '2',
      title: 'Tech Trends 2025',
      content: 'Discover the latest tech trends shaping our world this year.',
      timestamp: '7/2/2025 15:30',
      category: 'Tech',
      upvotes: 8,
    },
    {
      id: '3',
      title: 'Healthy Living Tips',
      content: 'Simple daily habits that can improve your health significantly.',
      timestamp: '7/1/2025 10:15',
      category: 'Health',
      upvotes: 3,
    },
  ]);

  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');

  const filteredPosts = posts.filter(post => {
    const matchesCategory = filterCategory === 'All' || post.category === filterCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddPost = () => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content cannot be empty.');
      return;
    }
    const newPost = {
      id: (posts.length + 1).toString(),
      title,
      content,
      timestamp: new Date().toLocaleString(),
      category: selectedCategory,
      upvotes: 0,
    };
    setPosts([newPost, ...posts]);
    setTitle('');
    setContent('');
    setSelectedCategory('General');
  };

  const handleUpvote = (id) => {
    setPosts(posts.map(p => p.id === id ? { ...p, upvotes: p.upvotes + 1 } : p));
  };

  const handleComment = (id) => {
    alert(`Open comments for post id: ${id} (dummy)`);
  };

  return (
    <div className="min-h-screen bg-purple-50">
      <HeaderComponent />
      <main className="max-w-4xl mx-auto p-4">
        {/* Search and filter */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <input
            type="search"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-purple-300 rounded px-3 py-2 flex-grow min-w-[200px] focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <select
            className="border border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* New Post Form */}
        <div className="bg-white rounded-xl p-6 shadow-md mb-8 border border-purple-300">
          <h2 className="text-purple-900 font-semibold mb-4">Create New Post</h2>
          <input
            type="text"
            placeholder="Post title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-purple-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <textarea
            placeholder="Write your post here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="w-full border border-purple-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
          />
          <div className="flex items-center justify-between">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={handleAddPost}
              className="bg-purple-600 hover:bg-purple-800 text-white px-6 py-2 rounded"
            >
              Post
            </button>
          </div>
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <p className="text-center text-purple-600">No posts found.</p>
        ) : (
          filteredPosts.map(post => (
            <Post
              key={post.id}
              post={post}
              onUpvote={handleUpvote}
              onComment={handleComment}
            />
          ))
        )}
      </main>
    </div>
  );
}
