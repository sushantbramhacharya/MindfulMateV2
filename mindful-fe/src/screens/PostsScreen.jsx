import React, { useState, useEffect } from 'react';
import { FaThumbsUp, FaCommentAlt, FaTrash, FaTimes } from 'react-icons/fa';
import HeaderComponent from '../components/HeaderComponent';
import FooterComponent from '../components/FooterComponent';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const categories = [
  'Anxiety',
  'Depression',
  'Stress Management',
  'Mindfulness',
  'Therapy',
  'Self-Care',
  'Mental Wellness',
  'Addiction',
  'Sleep Health',
  'Emotional Support'
];

function Post({ post, onUpvote, onComment, onDelete, currentUserId }) {
  const isOwner = post.author_id === currentUserId;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md mb-4 border border-purple-300">
      <h3 className="text-purple-900 font-bold text-xl mb-2">{post.title}</h3>
      <p className="text-purple-700 text-base mb-2 line-clamp-3">{post.content}</p>

      <div className="flex justify-between items-center text-sm text-purple-600 mb-2">
        <span>{post.author_name || 'Unknown author'}</span>
        <span>{post.timestamp ? new Date(post.timestamp).toLocaleString() : 'Unknown date'}</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="bg-purple-200 text-purple-800 text-xs font-semibold px-3 py-1 rounded-xl">
          {post.category}
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => onUpvote(post.id)}
            className="flex items-center gap-1 text-purple-600 hover:text-purple-900"
          >
            <FaThumbsUp className="text-lg" />
            <span>{post.upvotes_count || 0}</span>
          </button>
          <button
            onClick={() => onComment(post.id)}
            className="flex items-center gap-1 text-purple-600 hover:text-purple-900"
          >
            <FaCommentAlt className="text-lg" />
            <span>Comment</span>
          </button>
          {isOwner && (
            <button
              onClick={() => onDelete(post.id)}
              className="text-red-500 hover:text-red-700"
              aria-label="Delete post"
            >
              <FaTrash />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostsScreen() {
  const [posts, setPosts] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [showMyPosts, setShowMyPosts] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const { user } = useAuth();

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await axios.get(`${API_BASE}/posts`, { withCredentials: true });
      setPosts(res.data.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      alert(error.response?.data?.message || 'Error fetching posts');
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesCategory = filterCategory === 'All' || post.category === filterCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = !showMyPosts || post.author_id === user?.id;
    return matchesCategory && matchesSearch && matchesUser;
  });

  async function handleAddPost() {
    if (!title.trim() || !content.trim()) {
      alert('Title and content cannot be empty.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/posts`, {
        title,
        content,
        category: selectedCategory,
      }, { withCredentials: true });

      setPosts([res.data.data, ...posts]);
      setTitle('');
      setContent('');
      setSelectedCategory(categories[0]);
    } catch (error) {
      console.error('Error adding post:', error);
      alert(error.response?.data?.message || 'Error adding post');
    }
  }

  async function handleUpvote(id) {
    try {
      await axios.post(`${API_BASE}/posts/${id}/upvote`, {}, { withCredentials: true });
      fetchPosts();
    } catch (error) {
      console.error('Error upvoting post:', error);
      alert(error.response?.data?.message || 'Error upvoting post');
    }
  }

  async function handleComment(id) {
    const post = posts.find(p => p.id === id);
    setActivePost(post);
    setShowCommentModal(true);

    try {
      const res = await axios.get(`${API_BASE}/posts/${id}/comments`, { withCredentials: true });
      setComments(res.data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      alert(error.response?.data?.message || 'Error fetching comments');
    }
  }

  async function handlePostComment() {
    if (!newCommentText.trim()) {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/posts/${activePost.id}/comments`,
        { text: newCommentText },
        { withCredentials: true }
      );
      setComments([...comments, res.data.data]);
      setNewCommentText('');
    } catch (error) {
      console.error('Error posting comment:', error);
      alert(error.response?.data?.message || 'Error posting comment');
    }
  }

  async function handleDeletePost(id) {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const res = await axios.delete(`${API_BASE}/posts/${id}`, { withCredentials: true });
      setPosts(posts.filter(p => p.id !== id));
      alert(res.data.message || 'Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.message || 'Error deleting post');
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await axios.delete(`${API_BASE}/comments/${commentId}`, { withCredentials: true });
      setComments(comments.filter(c => c.id !== commentId));
      alert(res.data.message || 'Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error.response?.data?.message || 'Error deleting comment');
    }
  }

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
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowMyPosts(!showMyPosts)}
            className={`px-4 py-2 rounded ${
              showMyPosts
                ? 'bg-purple-600 text-white hover:bg-purple-800'
                : 'bg-purple-200 text-purple-800 hover:bg-purple-300'
            }`}
          >
            {showMyPosts ? 'Show All Posts' : 'My Posts'}
          </button>
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
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
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
          filteredPosts.map((post) => (
            <Post
              key={post.id}
              post={post}
              onUpvote={handleUpvote}
              onComment={handleComment}
              onDelete={handleDeletePost}
              currentUserId={user?.id}
            />
          ))
        )}

        {/* 💬 Comment Modal */}
        {showCommentModal && activePost && (
          <div className="fixed inset-0 bg-purple-200/30 backdrop-blur-sm flex items-end justify-center z-50">
            <div className="bg-white w-full max-w-xl rounded-t-3xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-purple-800">
                  💬 Comments on "{activePost.title}"
                </h3>
                <button
                  onClick={() => {
                    setShowCommentModal(false);
                    setActivePost(null);
                    setComments([]);
                    setNewCommentText('');
                  }}
                  className="text-purple-600 hover:text-purple-900 text-xl"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4 max-h-60 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="text-purple-600 text-center">No comments yet.</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="bg-purple-50 p-3 rounded-xl border border-purple-200 relative">
                      <p className="text-sm text-purple-900 font-semibold">{comment.author_name || 'Anonymous'}</p>
                      <p className="text-sm text-purple-700">{comment.text}</p>
                      {comment.author_id === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          aria-label="Delete comment"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-grow border border-purple-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={handlePostComment}
                  className="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <FooterComponent />
    </div>
  );
}