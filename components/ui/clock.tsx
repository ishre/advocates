'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function HeaderClock() {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time after mount to avoid hydration mismatch
    setCurrentTime(new Date());
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Show loading state until time is set
  if (!currentTime) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-md border">
        <div className="h-7 w-7 rounded-full">
          <Image 
            src="https://flagcdn.com/in.svg"
            alt="Country flag" 
            width={28}
            height={28}
            className="h-full w-full object-cover rounded-md"
          />
        </div>
        <div className="flex flex-col items-start">
          <div className="text-sm font-medium">--:--:--</div>
          <div className="text-xs text-muted-foreground">--</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-md border">
      <div className="h-7 w-7 rounded-full">
        <Image 
          src="https://flagcdn.com/in.svg"
          alt="Country flag" 
          width={28}
          height={28}
          className="h-full w-full object-cover rounded-md"
        />
      </div>
      <div className="flex flex-col items-start">
        <div className="text-sm font-medium">{formatTime(currentTime)}</div>
        <div className="text-xs text-muted-foreground">{formatDate(currentTime)}</div>
      </div>
    </div>
  );
} 