import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import PitchSelector from './PitchSelector';
import Booking from './Booking';

function BookingCalendar({ currentUser }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPitch, setSelectedPitch] = useState('all');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('footballBookingToken');
        
        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/bookings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        
        const bookingsData = await response.json();
        // Transform API response to match expected format if needed
        const formattedBookings = bookingsData.map(booking => ({
          id: booking.id,
          date: booking.date,
          startTime: booking.start_time,
          endTime: booking.end_time,
          pitch: booking.pitch_name,
          sessionType: booking.session_type,
          notes: booking.notes,
          coachId: booking.coach_id
        }));
        
        setBookings(formattedBookings);
        setError(null);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setError('Failed to load bookings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [currentDate]); // Re-fetch when week changes
  
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Filter bookings by week and selected pitch
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const endOfWeek = addDays(startOfCurrentWeek, 6);
    
    const isInSelectedWeek = bookingDate >= startOfCurrentWeek && bookingDate <= endOfWeek;
    const matchesPitch = selectedPitch === 'all' || booking.pitch === selectedPitch;
    
    return isInSelectedWeek && matchesPitch;
  });
  
  // Group bookings by day
  const bookingsByDay = {};
  
  filteredBookings.forEach(booking => {
    const bookingDate = format(new Date(booking.date), 'yyyy-MM-dd');
    
    if (!bookingsByDay[bookingDate]) {
      bookingsByDay[bookingDate] = [];
    }
    
    bookingsByDay[bookingDate].push(booking);
  });
  
  // Generate the days of the week
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(startOfCurrentWeek, i);
    weekDays.push(day);
  }
  
  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  const goToNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  const handlePitchChange = (pitch) => {
    setSelectedPitch(pitch);
  };
  
  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="booking-calendar">
      <h2>Training Schedule</h2>
      
      <PitchSelector 
        selectedPitch={selectedPitch} 
        onPitchChange={handlePitchChange} 
      />
      
      <div className="calendar-controls">
        <button className="btn" onClick={goToPreviousWeek}>
          Previous Week
        </button>
        <h3>
          {format(startOfCurrentWeek, 'MMMM d, yyyy')} - 
          {format(addDays(startOfCurrentWeek, 6), 'MMMM d, yyyy')}
        </h3>
        <button className="btn" onClick={goToNextWeek}>
          Next Week
        </button>
      </div>
      
      <div className="calendar-container">
        {weekDays.map(day => {
          const formattedDate = format(day, 'yyyy-MM-dd');
          const dayBookings = bookingsByDay[formattedDate] || [];
          
          return (
            <div key={formattedDate} className="calendar-day">
              <div className="calendar-date">
                <h4>{format(day, 'EEEE')}</h4>
                <span>{format(day, 'MMM d')}</span>
              </div>
              
              <div className="calendar-bookings">
                {dayBookings.length > 0 ? (
                  dayBookings.map((booking) => (
                    <Booking key={booking.id} booking={booking} />
                  ))
                ) : (
                  <p className="no-bookings">No bookings</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BookingCalendar;