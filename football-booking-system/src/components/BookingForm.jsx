import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isAfter, parseISO } from 'date-fns';

function BookingForm({ onAddBooking, existingBookings }) {
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const [formData, setFormData] = useState({
    date: today,
    startTime: '17:00',
    endTime: '18:30',
    pitch: 'Pitch 1',
    sessionType: 'Training',
    notes: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const validateBooking = () => {
    // Check if all required fields are filled
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.pitch) {
      return 'Please fill in all required fields';
    }
    
    // Check if end time is after start time
    if (formData.startTime >= formData.endTime) {
      return 'End time must be after start time';
    }
    
    // Check if date is not in the past
    const selectedDate = parseISO(formData.date);
    if (!isAfter(selectedDate, new Date())) {
      return 'Booking date cannot be in the past';
    }
    
    // Check for overlapping bookings
    const hasOverlap = existingBookings.some(booking => {
      if (booking.date !== formData.date || booking.pitch !== formData.pitch) {
        return false;
      }
      
      const existingStart = booking.startTime;
      const existingEnd = booking.endTime;
      const newStart = formData.startTime;
      const newEnd = formData.endTime;
      
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
    
    if (hasOverlap) {
      return 'This time slot overlaps with an existing booking for this pitch';
    }
    
    return '';
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset messages
    setError('');
    setSuccess('');
    
    // Validate the booking
    const validationError = validateBooking();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Add the new booking
    const success = onAddBooking(formData);
    
    if (success) {
      setSuccess('Booking added successfully');
      // Reset form or redirect
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setError('Failed to add booking. Please try again.');
    }
  };
  
  return (
    <div className="booking-form-container">
      <h2>Add New Training Session</h2>
      
      <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-control">
          <label htmlFor="date">Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            min={today}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-control">
          <label htmlFor="startTime">Start Time *</label>
          <input
            type="time"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-control">
          <label htmlFor="endTime">End Time *</label>
          <input
            type="time"
            id="endTime"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-control">
          <label htmlFor="pitch">Pitch *</label>
          <select
            id="pitch"
            name="pitch"
            value={formData.pitch}
            onChange={handleChange}
            required
          >
            <option value="Pitch 1">Pitch 1</option>
            <option value="Pitch 2">Pitch 2</option>
          </select>
        </div>
        
        <div className="form-control">
          <label htmlFor="sessionType">Session Type *</label>
          <select
            id="sessionType"
            name="sessionType"
            value={formData.sessionType}
            onChange={handleChange}
            required
          >
            <option value="Training">Training</option>
            <option value="Match">Match</option>
            <option value="Fitness">Fitness</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-control">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional information..."
            rows="3"
          ></textarea>
        </div>
        
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        
        <div className="form-buttons">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/')}>
            Cancel
          </button>
          <button type="submit" className="btn">Add Booking</button>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;