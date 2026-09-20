import React from 'react';

const About: React.FC = () => {
  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">About Me</h2>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg mb-4">
            I have 6+ years of experience in designing and building scalable web applications. 
            Expertise in JavaScript, TypeScript, ReactJS, NodeJS, and MongoDB, with a focus on 
            performance optimisation, micro service architecture, and API development.
          </p>
          <p className="text-lg">
            Adept in cloud services (AWS), testing frameworks (Jest, Cypress), and Agile methodologies. 
            Mentored junior developers and contributed to full lifecycle project management. 
            Currently expanding skills in cloud computing and react native applications.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About; 