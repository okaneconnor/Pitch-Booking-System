import React from 'react';

function PitchSelector({ selectedPitch, onPitchChange }) {
  return (
    <div className="pitch-selector">
      <label htmlFor="pitch-filter">Filter by Pitch:</label>
      <select
        id="pitch-filter"
        value={selectedPitch}
        onChange={(e) => onPitchChange(e.target.value)}
        className="pitch-select"
      >
        <option value="all">All Pitches</option>
        <option value="Pitch 1">Pitch 1</option>
        <option value="Pitch 2">Pitch 2</option>
      </select>
    </div>
  );
}

export default PitchSelector;