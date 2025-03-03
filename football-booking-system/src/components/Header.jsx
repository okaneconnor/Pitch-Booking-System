import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Header({ currentUser, onLogout }) {
  const navigate = useNavigate();
  
  const handleLogout = (e) => {
    e.preventDefault();
    onLogout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <h1>Football Pitch Booking</h1>
        
        {currentUser ? (
          <nav>
            <Link to="/" className="nav-link">View Schedule</Link>
            
            {currentUser.role === 'coach' && (
              <Link to="/add-booking" className="nav-link">Add Booking</Link>
            )}
            
            <span className="nav-link">
              Welcome, {currentUser.name} ({currentUser.role})
            </span>
            
            <a href="/" className="nav-link" onClick={handleLogout}>
              Logout
            </a>
          </nav>
        ) : (
          <nav>
            <Link to="/login" className="nav-link">Login</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export default Header;