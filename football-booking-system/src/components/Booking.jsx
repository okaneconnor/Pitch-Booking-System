import React from 'react';
import { format } from 'date-fns';

function Booking({ booking }) {
  const formattedDate = format(new Date(booking.date), 'MMMM d, yyyy');
  
  return (
    <div className="booking-item">
      <h3>
        {booking.startTime} to {booking.endTime}
      </h3>
      <p><strong>Pitch:</strong> {booking.pitch}</p>
      <p><strong>Session Type:</strong> {booking.sessionType}</p>
      {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
    </div>
  );
}

export default Booking;