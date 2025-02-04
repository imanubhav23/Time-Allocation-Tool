import React, { useState, useEffect } from 'react';

const TimeReallocationSliders = () => {
  const [reallocationPercent, setReallocationPercent] = useState(50);
  const [yearsAhead, setYearsAhead] = useState(5);
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
    <div className="bg-gray-100 p-8 rounded-xl shadow-lg mb-8 w-full max-w-xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-center items-center mb-4">
          <span className="text-base text-gray-700 text-center">
            If you were to re-allocate 
            <span className="mx-2 font-bold text-blue-600 text-xl">{reallocationPercent}%</span> 
            of distractions to investments
          </span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          step="10"
          value={reallocationPercent}
          onChange={(e) => setReallocationPercent(Number(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(val => (
            <span key={val}>{val}%</span>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-center items-center mb-4">
          <span className="text-base text-gray-700 text-center">
            in 
            <span className="mx-2 font-bold text-blue-600 text-xl">{yearsAhead}</span> 
            years, you'd save...
          </span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="10" 
          step="1"
          value={yearsAhead}
          onChange={(e) => setYearsAhead(Number(e.target.value))}
          className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
            <span key={val}>{val}</span>
          ))}
        </div>
      </div>

      <div className="text-center bg-white p-6 rounded-lg shadow-sm">
        <p className="text-xl font-semibold text-gray-800">
          {savedTime.hours.toLocaleString()} hours ≈ {savedTime.days.toLocaleString()} days
        </p>
      </div>
    </div>
  );
};

export default TimeReallocationSliders;
