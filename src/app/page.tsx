import React from 'react';
import Layout from '@/components/Layout';
import About from '@/components/About';
import Projects from '@/components/Projects';
import { FaNodeJs, FaReact, FaAws, FaUbuntu, FaGitAlt, FaSearch } from 'react-icons/fa';
import { SiExpress, SiRedux, SiSocketdotio, SiRedis, SiGraphql, SiMongodb, SiPostgresql, SiMysql, SiNginx, SiJest } from 'react-icons/si';

const skills = {
  web: [
    { name: 'Node.js', icon: <FaNodeJs /> },
    { name: 'Express', icon: <SiExpress /> },
    { name: 'React.js', icon: <FaReact /> },
    { name: 'Redux', icon: <SiRedux /> },
    { name: 'Socket.io', icon: <SiSocketdotio /> },
    { name: 'Redis', icon: <SiRedis /> },
    { name: 'React Native', icon: <FaReact /> },
    { name: 'GraphQL', icon: <SiGraphql /> },
  ],
  database: [
    { name: 'MongoDB', icon: <SiMongodb /> },
    { name: 'PostgreSQL', icon: <SiPostgresql /> },
    { name: 'MySQL', icon: <SiMysql /> },
  ],
  misc: [
    { name: 'AWS', icon: <FaAws /> },
    { name: 'Ubuntu', icon: <FaUbuntu /> },
    { name: 'Nginx', icon: <SiNginx /> },
    { name: 'GIT', icon: <FaGitAlt /> },
    { name: 'SEO', icon: <FaSearch /> },
    { name: 'Jest', icon: <SiJest /> },
  ],
};

export default function Home() {
  return (
    <Layout>
      <div className="container">
        {/* Hero Section */}
        <section id="hero">
          <div style={{ textAlign: 'center' }}>
            <h1>Raj Kumar</h1>
            <h2 style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>Full Stack Developer | 5+ years experience</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <a href="tel:+916394258567">+91 6394258567</a>
              <a href="mailto:rkgt76@gmail.com">rkgt76@gmail.com</a>
            </div>
          </div>
        </section>

        {/* About Section */}
        <About />

        {/* Experience Section */}
        <section id="experience">
          <h2>Work Experience</h2>
          <div className="experience-card">
            <h3>Forgeahead Solutions Pvt Ltd — Software Engineer</h3>
            <p>Aug 2022 - Apr 2023</p>
            <ul>
              <li>Bajaj Finance(Knowledge Hub): CMS with ability to update various kinds of content and user ranking system</li>
              <li>Development of email logging system which tracks status of email sent</li>
              <li>Enhancement of user ranking module and changing algorithm according to requirements</li>
              <li>Debugged the application for bugs and made changes to fix them</li>
            </ul>
          </div>

          <div className="experience-card">
            <h3>RSG Media Systems Pvt Ltd — Software Engineer</h3>
            <p>SEP 2021 - May 2022</p>
            <ul>
              <li>Rights Logic 4.0: Platform for enterprise-wide strategic rights management for deals and finances</li>
              <li>Worked on the finance module, for revenue calculation and budget estimation</li>
              <li>Realtime dashboard screen for ongoing deals and finance</li>
            </ul>
          </div>

          <div className="experience-card">
            <h3>smartData Enterprises, Mohali — Software Associate</h3>
            <p>JAN 2021 - SEP 2021</p>
            <ul>
              <li>Guardian Lane: Platform for online community of kids healing together from losses</li>
              <li>Build 1-1 video calling functionality using twilio sdk</li>
              <li>Video analytics for the videos uploaded on the platform</li>
            </ul>
          </div>

          <div className="experience-card">
            <h3>Web Sultanate Softwares — Software Engineer</h3>
            <p>DEC 2019 - DEC 2020</p>
            <ul>
              <li>Day of Duel: Online game platform for playing various kinds of games by maintaining wallet currency</li>
              <li>Setup wallet management sections of the platform</li>
              <li>Developed tournament modules for the games to be played</li>
            </ul>
          </div>
        </section>

        {/* Projects Section */}
        <Projects />

        {/* Skills Section */}
        <section id="skills">
          <h2>Skills</h2>
          <div className="skills-grid">
            <div>
              <h3>Web Technologies</h3>
              <div className="skills-container">
                {skills.web.map((skill) => (
                  <span key={skill.name} className="skill-tag">
                    <span className="skill-icon">{skill.icon}</span>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3>Database</h3>
              <div className="skills-container">
                {skills.database.map((skill) => (
                  <span key={skill.name} className="skill-tag">
                    <span className="skill-icon">{skill.icon}</span>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3>Miscellaneous</h3>
              <div className="skills-container">
                {skills.misc.map((skill) => (
                  <span key={skill.name} className="skill-tag">
                    <span className="skill-icon">{skill.icon}</span>
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education">
          <h2>Education</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <h3>B.Tech(CS)</h3>
              <p style={{ color: 'var(--gray-600)' }}>BBDNIIT Lucknow, 2014</p>
            </div>
            <div>
              <h3>Jesus & Mary School & College</h3>
              <p style={{ color: 'var(--gray-600)' }}>Balrampur, 2009</p>
            </div>
            <div>
              <h3>St. Francis School</h3>
              <p style={{ color: 'var(--gray-600)' }}>Anpara, 2007</p>
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section id="certifications">
          <h2>Certifications</h2>
          <div>
            <h3>AWS Certified Developer – Associate</h3>
            <a 
              href="https://www.credly.com/badges/e3cd91a5-8ee0-4c4d-9128-d9b08bef313b"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Credential
            </a>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact">
          <h2>Contact</h2>
          <div style={{ textAlign: 'center' }}>
            <p>Mobile: <a href="tel:+916394258567">+91 6394258567</a></p>
            <p>Email: <a href="mailto:rkgt76@gmail.com">rkgt76@gmail.com</a></p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
