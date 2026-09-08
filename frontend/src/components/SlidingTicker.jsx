'use client';

import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

export default function SlidingTicker() {
  const [tickerConfig, setTickerConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('sweettree_sliding_ticker');
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    return null;
  });

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const res = await api.get('/auth/settings');
        if (res.data.success && res.data.settings?.slidingNotification && isMounted) {
          const freshConfig = res.data.settings.slidingNotification;
          setTickerConfig(freshConfig);
          try {
            localStorage.setItem('sweettree_sliding_ticker', JSON.stringify(freshConfig));
          } catch {}
        }
      } catch (error) {
        console.error('Ticker sync error:', error);
      }
    };

    fetchSettings();
    return () => { isMounted = false; };
  }, []);

  if (!tickerConfig || tickerConfig.enabled === false || !tickerConfig.text) {
    return null;
  }

  return (
    <div className="marquee-wrapper">
      <marquee 
        key={`ticker-${tickerConfig.speed}-${tickerConfig.text}`}
        behavior="scroll" 
        direction="left" 
        scrollamount={tickerConfig.speed || 5}
      >
        {tickerConfig.text}
      </marquee>
    </div>
  );
}
