import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ContactModal from './ContactModal';
import { useAnalytics } from '@/hooks/useAnalytics';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const { trackButtonClick } = useAnalytics();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackButtonClick('Contact Button', 'navigation');
    setIsContactModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav>
        <div className="container">
          <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            Raj Kumar
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a>
            <a href="#experience" onClick={(e) => { e.preventDefault(); scrollToSection('experience'); }}>Experience</a>
            <a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}>Projects</a>
            <a href="#skills" onClick={(e) => { e.preventDefault(); scrollToSection('skills'); }}>Skills</a>
            <a href="#contact" onClick={handleContactClick}>Contact</a>
          </div>
        </div>
      </nav>
      
      <main style={{ flexGrow: 1 }}>
        {children}
      </main>
      
      <footer>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Raj Kumar. All right reserved.</p>
        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </div>
  );
};

export default Layout; 