import React from 'react';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Skills from '@/components/Skills';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <About />
      <Skills />
    </div>
  );
};

export default App; 