import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import FooterComponent from '../components/FooterComponent';
import HeaderComponent from '../components/HeaderComponent';

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login'); // Redirect if no user
    }
  }, [user, navigate]);

  const features = [
    {
      title: "Music Player",
      description: "Calming melodies for relaxation",
      icon: "🎵",
      onClick: () => navigate('/music'),
    },
    {
      title: "Breathing Exercises",
      description: "Guided breathing techniques",
      icon: "🌬️",
      onClick: () => navigate('/breathing'),
    },
    {
      title: "Exercises and Meditations",
      description: "Stay present and focused",
      icon: "🧘",
      onClick: () => navigate('/exercise'),
    },
    {
      title: "Call Helpline",
      description: "Reach out for immediate support",
      icon: "📞",
      onClick: () => navigate('/helpline'),
    },
    {
      title: "Posts",
      description: "Share and read posts with community",
      icon: "📝",
      onClick: () => navigate('/posts'),
    },
    {
      title: "AI Assistant - Keqing",
      description: "Get AI-powered mental wellness help",
      icon: "🤖",
      onClick: () => navigate('/ai-assistant'),
    },
    {
      title: "Chat with Expert",
      description: "Talk to a mental health professional",
      icon: "💬",
      onClick: () => navigate('/chat-expert'),
    },
    {
      title: "Profile",
      description: "View and edit your profile",
      icon: "👤",
      onClick: () => navigate('/profile'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-100 via-purple-200 to-purple-300 text-gray-800">
      <HeaderComponent />

      {/* Main content grows to fill space */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="text-center py-12 px-4">
          <h2 className="text-4xl font-bold text-purple-900 mb-4">Your Mental Wellness Toolkit</h2>
          <p className="text-purple-700 max-w-xl mx-auto">
            Empower your mind with guided exercises, calming sounds, and daily wellness habits.
          </p>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <button
                key={index}
                onClick={feature.onClick}
                className="bg-white/40 backdrop-blur-md border border-purple-300 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-400"
                aria-label={feature.title}
                type="button"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-purple-900 mb-2">{feature.title}</h3>
                <p className="text-purple-800">{feature.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Daily Tip */}
        <section className="container mx-auto px-4 mb-16">
          <div className="bg-white/60 backdrop-blur-xl border-l-4 border-purple-600 p-6 rounded-xl shadow-inner">
            <h3 className="text-2xl font-semibold text-purple-900 mb-2">🧠 Daily Wellness Tip</h3>
            <p className="text-purple-800 leading-relaxed">
              “Take 5 deep breaths whenever you feel stressed. Inhale for 4 seconds, hold for 4, exhale for 6.”
            </p>
          </div>
        </section>
      </main>

      <FooterComponent />
    </div>
  );
};

export default DashboardScreen;
