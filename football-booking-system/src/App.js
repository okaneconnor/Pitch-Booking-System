import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BookingCalendar from './components/BookingCalendar';
import BookingForm from './components/BookingForm';
import AuthForm from './components/AuthForm';
import './App.css';

// Import JSON data
import bookingsData from './data/bookings.json';
import usersData from './data/users.json';

function App() {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    // Load data from JSON files
    setBookings(bookingsData);
    setUsers(usersData);
    
    // Check for saved login in localStorage
    const savedUser = localStorage.getItem('footballBookingUser');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        // Handle any JSON parsing errors
        localStorage.removeItem('footballBookingUser');
      }
    }
    setLoading(false);
  }, []);
  
  const handleLogin = async (credentials) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        return false;
      }
      
      const data = await response.json();
      
      // Store user data and token
      setCurrentUser(data.user);
      localStorage.setItem('footballBookingUser', JSON.stringify(data.user));
      localStorage.setItem('footballBookingToken', data.token);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const handleAddBooking = (newBooking) => {
    // In a real app, this would be an API call
    const updatedBookings = [...bookings, { 
      id: Date.now(), // Simple ID generation
      ...newBooking,
      coachId: currentUser?.id
    }];
    
    setBookings(updatedBookings);
    
    // In a real app, we would save to the server here
    // For this demo, we're just updating the state
    return true;
  };

  // Show loading indicator while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return (
    <div>
      <Header currentUser={currentUser} onLogout={handleLogout} />
      <div className="container">
        <Routes>
          <Route 
            path="/" 
            element={
              currentUser ? (
                <BookingCalendar 
                  bookings={bookings} 
                  currentUser={currentUser}
                />
              ) : (
                <Navigate to="/login" state={{ from: location }} replace />
              )
            } 
          />
          
          <Route 
            path="/add-booking" 
            element={
              currentUser?.role === 'coach' ? (
                <BookingForm 
                  onAddBooking={handleAddBooking} 
                  existingBookings={bookings}
                />
              ) : (
                <Navigate to="/login" state={{ from: location }} replace />
              )
            } 
          />
          
          <Route 
            path="/login" 
            element={
              currentUser ? (
                <Navigate to="/" replace />
              ) : (
                <AuthForm onLogin={handleLogin} />
              )
            } 
          />

          <Route 
            path="*" 
            element={
              currentUser ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
            } 
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;