import React from 'react';
import { getIcon } from '../utils/icons';
import content from '../data/content.json';

const Skills: React.FC = () => {
  const skillsSection = content.sections.find(section => section.id === 'skills');
  if (!skillsSection || !skillsSection.categories) return null;

  return (
    <section id="skills" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {skillsSection.categories.map((category, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                {category.items.map((skill, skillIndex) => {
                  const Icon = getIcon(skill.icon);
                  return (
                    <div key={skillIndex} className="flex items-center space-x-2">
                      <Icon className="text-blue-500 text-xl" />
                      <span>{skill.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills; 