import React from 'react';
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav>
        <div className="container">
          <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
            Raj Kumar
          </Link>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/#about">About</Link>
            <Link href="/#experience">Experience</Link>
            <Link href="/#projects">Projects</Link>
            <Link href="/#skills">Skills</Link>
            <Link href="/#contact">Contact</Link>
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
    </div>
  );
};

export default Layout; 