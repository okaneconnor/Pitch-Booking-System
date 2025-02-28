import React from 'react';
import { Link } from 'react-router-dom';

function Header({ currentUser, onLogout }) {
  return (
    <header className="header">
      <div className="container">
        <h1>Football Pitch Booking</h1>
        <nav>
          <Link to="/" className="nav-link">View Schedule</Link>
          
          {currentUser ? (
            <>
              {currentUser.role === 'coach' && (
                <Link to="/add-booking" className="nav-link">Add Booking</Link>
              )}
              <span className="nav-link">
                Welcome, {currentUser.name} ({currentUser.role})
              </span>
              <Link to="/" className="nav-link" onClick={onLogout}>
                Logout
              </Link>
            </>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;