import React from 'react';
import { format } from 'date-fns';

function Booking({ booking }) {
  const formattedDate = format(new Date(booking.date), 'MMMM d, yyyy');
  
  // Handle database API format vs JSON format
  const startTime = booking.start_time || booking.startTime;
  const endTime = booking.end_time || booking.endTime;
  const pitchName = booking.pitch_name || booking.pitch || `Pitch ${booking.pitch_id}`;
  const sessionType = booking.session_type || booking.sessionType;
  const notes = booking.notes;
  const coachName = booking.coach_name || '';
  
  return (
    <div className="booking-item">
      <h3>
        {startTime} to {endTime}
      </h3>
      <p><strong>Pitch:</strong> {pitchName}</p>
      <p><strong>Session Type:</strong> {sessionType}</p>
      {notes && <p><strong>Notes:</strong> {notes}</p>}
      {coachName && <p><strong>Coach:</strong> {coachName}</p>}
    </div>
  );
}

export default Booking;