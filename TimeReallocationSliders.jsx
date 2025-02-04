import React, { useState, useEffect } from 'react';

const TimeReallocationSliders = () => {
  const [reallocationPercent, setReallocationPercent] = useState(35);
  const [yearsAhead, setYearsAhead] = useState(21);
  const [savedTime, setSavedTime] = useState({ hours: 0, days: 0 });

  const calculateSavedTime = () => {
    // Get distraction hours from the main app
    const distractionHours = Array.from(document.querySelectorAll('#distractions-list input[type="number"]'))
      .reduce((sum, input) => sum + Number(input.value), 0);
    
    // Calculate hours that would be saved
    const weeklyHoursSaved = (distractionHours * reallocationPercent) / 100;
    const totalHoursSaved = weeklyHoursSaved * 52 * yearsAhead;
    const totalDaysSaved = Math.floor(totalHoursSaved / 24);
    
    setSavedTime({
      hours: Math.floor(totalHoursSaved),
      days: totalDaysSaved
    });
  };

  useEffect(() => {
    calculateSavedTime();
  }, [reallocationPercent, yearsAhead]);

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-sm mb-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            If you were to re-allocate
            <span className="mx-1 font-bold text-blue-600">{reallocationPercent}%</span>
            to opportunities...
          </span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={reallocationPercent}
          onChange={(e) => setReallocationPercent(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            in
            <span className="mx-1 font-bold text-blue-600">{yearsAhead}</span>
            years, you'd save...
          </span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="50" 
          value={yearsAhead}
          onChange={(e) => setYearsAhead(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1 year</span>
          <span>50 years</span>
        </div>
      </div>

      <div className="text-center bg-white p-4 rounded-lg shadow-sm">
        <p className="text-lg font-semibold text-gray-800">
          {savedTime.hours.toLocaleString()} hours ≈ {savedTime.days.toLocaleString()} days
        </p>
      </div>
    </div>
  );
};

export default TimeReallocationSliders;
