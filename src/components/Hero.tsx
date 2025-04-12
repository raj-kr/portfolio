import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-4">Welcome to My Portfolio</h1>
        <p className="text-xl">Full Stack Developer & Designer</p>
      </div>
    </section>
  );
};

export default Hero; 