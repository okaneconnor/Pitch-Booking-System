import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import BookingCalendar from './components/BookingCalendar';
import BookingForm from './components/BookingForm';
import AuthForm from './components/AuthForm';
import './App.css';

function App() {
  const [bookings, setBookings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    // Check for saved login in localStorage
    const savedUser = localStorage.getItem('footballBookingUser');
    const token = localStorage.getItem('footballBookingToken');
    
    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        // Fetch bookings with the token
        fetchBookings(token);
      } catch (e) {
        // Handle any JSON parsing errors
        localStorage.removeItem('footballBookingUser');
        localStorage.removeItem('footballBookingToken');
      }
    }
    setLoading(false);
  }, []);
  
  // Fetch bookings from API
  const fetchBookings = async (token) => {
    try {
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };
  
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
      
      // Fetch bookings after successful login
      await fetchBookings(data.token);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setBookings([]);
    localStorage.removeItem('footballBookingUser');
    localStorage.removeItem('footballBookingToken');
  };
  
  const handleAddBooking = async (newBooking) => {
    const token = localStorage.getItem('footballBookingToken');
    
    if (!token) {
      return false;
    }
    
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          date: newBooking.date,
          startTime: newBooking.startTime,
          endTime: newBooking.endTime,
          pitchId: newBooking.pitch === 'Pitch 1' ? 1 : 2,
          sessionType: newBooking.sessionType,
          notes: newBooking.notes
        }),
      });
      
      if (!response.ok) {
        return false;
      }
      
      // Refresh bookings after adding a new one
      await fetchBookings(token);
      return true;
    } catch (error) {
      console.error('Error adding booking:', error);
      return false;
    }
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