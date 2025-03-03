import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
  
  useEffect(() => {
    // Load data from JSON files
    setBookings(bookingsData);
    setUsers(usersData);
    
    // Check for saved login in localStorage
    const savedUser = localStorage.getItem('footballBookingUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);
  
  const handleLogin = (credentials) => {
    const user = users.find(
      u => u.username === credentials.username && u.password === credentials.password
    );
    
    if (user) {
      // Remove password before storing in state/localStorage
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('footballBookingUser', JSON.stringify(userWithoutPassword));
      return true;
    }
    
    return false;
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('footballBookingUser');
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
          {/* Redirect to login if not authenticated */}
          <Route 
            path="/" 
            element={
              currentUser ? (
                <BookingCalendar 
                  bookings={bookings} 
                  currentUser={currentUser}
                />
              ) : (
                <Navigate to="/login" replace />
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
                <Navigate to="/login" replace />
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

          {/* Catch all route - redirect to login if not logged in, otherwise to home */}
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