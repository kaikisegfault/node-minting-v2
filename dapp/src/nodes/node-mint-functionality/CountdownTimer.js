import React, { useState, useEffect } from 'react';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    // Set target date to January 21, 2025, 7 PM UTC
    const targetDate = new Date('2025-01-31T19:00:00Z');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    // Calculate immediately
    calculateTimeLeft();
    
    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-2">
        Public MINT date
      </h2>
      <div style={{ 
        fontWeight: 'bold', 
        color: '#6B7280',
        marginBottom: '8px'
      }}>
        January 31 - 7 PM UTC
      </div>
      <div style={{ 
        fontWeight: 'bold',
        color: '#A147E1'
      }}>
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
      </div>
    </div>
  );
};

export default CountdownTimer;