import React, { useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import PitchSelector from './PitchSelector';
import Booking from './Booking';

function BookingCalendar({ bookings, currentUser }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedPitch, setSelectedPitch] = useState('all');
  
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Filter bookings by week and selected pitch
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const endOfWeek = addDays(startOfCurrentWeek, 6);
    
    const isInSelectedWeek = bookingDate >= startOfCurrentWeek && bookingDate <= endOfWeek;
    
    // Handle the API format where pitch comes as pitch_name or pitch_id
    const bookingPitch = booking.pitch_name || booking.pitch || `Pitch ${booking.pitch_id}`;
    const matchesPitch = selectedPitch === 'all' || bookingPitch === selectedPitch;
    
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