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
  
  const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : `https://${window.location.hostname}/api`;
  
  console.log('Using API URL:', API_URL);
  
  useEffect(() => {
    // Check for saved login in localStorage
    const savedUser = localStorage.getItem('footballBookingUser');
    const token = localStorage.getItem('footballBookingToken');
    
    console.log('Checking for saved user session');
    
    if (savedUser && token) {
      try {
        const user = JSON.parse(savedUser);
        console.log('Found saved user:', user.username);
        setCurrentUser(user);
        // Fetch bookings with the token
        fetchBookings(token);
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('footballBookingUser');
        localStorage.removeItem('footballBookingToken');
      }
    } else {
      console.log('No saved user session found');
    }
    setLoading(false);
  }, []);
  
  // Fetch bookings from API
  const fetchBookings = async (token) => {
    try {
      console.log('Fetching bookings...');
      const response = await fetch(`${API_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Bookings fetched successfully:', data.length);
        setBookings(data);
      } else {
        console.error('Failed to fetch bookings, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };
  
  const handleLogin = async (credentials) => {
    console.log('Attempting login for:', credentials.username);
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        console.error('Login failed, status:', response.status);
        return false;
      }
      
      const data = await response.json();
      console.log('Login successful, user role:', data.user.role);
      
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
    console.log('Logging out user');
    setCurrentUser(null);
    setBookings([]);
    localStorage.removeItem('footballBookingUser');
    localStorage.removeItem('footballBookingToken');
  };
  
  const handleAddBooking = async (newBooking) => {
    const token = localStorage.getItem('footballBookingToken');
    
    if (!token) {
      console.error('No token found, cannot add booking');
      return false;
    }
    
    console.log('Adding new booking:', newBooking);
    try {
      const response = await fetch(`${API_URL}/api/bookings`, {
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
        console.error('Add booking failed, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return false;
      }
      
      console.log('Booking added successfully');
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