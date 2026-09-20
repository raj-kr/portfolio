import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="maintenance-layout">
      <main className="maintenance-main">
        {children}
      </main>
    </div>
  );
};

export default Layout;
