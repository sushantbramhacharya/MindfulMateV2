import React from 'react';

const FooterComponent = () => {
  return (
    <footer className="bg-white/60 backdrop-blur-md border border-purple-200 rounded-t-xl shadow-inner py-4 text-center mx-4 mb-4 text-purple-900 text-sm">
      <p>© {new Date().getFullYear()} Mindful Mate — Your Mental Health Companion</p>
    </footer>
  );
};

export default FooterComponent;
