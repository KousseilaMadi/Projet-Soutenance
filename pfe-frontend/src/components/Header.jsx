import React from 'react';
import { Search } from 'lucide-react';

function Header({ title, user }) {
  return (
    <header className="header-container">
      <h1 className="header-title">{title}</h1>
      
      <div className="header-actions">
        
        <div className="status-badge">
          <div className="status-dot"></div>
          <span className="status-text">{user.username}</span>
           <span className="status-text">-- {user.role} --</span>
        </div>
        
      </div>
    </header>
  );
}

export default Header;