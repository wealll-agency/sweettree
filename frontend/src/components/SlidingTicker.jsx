'use client';

import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';

export default function SlidingTicker() {
  const [tickerConfig, setTickerConfig] = useState(null);

  useEffect(() => {
    let isMounted = true;

    try {
      const cached = localStorage.getItem('sweettree_sliding_ticker');
      if (cached) {
        setTickerConfig(JSON.parse(cached));
      }
    } catch {}

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

  const defaultConfig = {
    enabled: true,
    text: '📢 Sweettree Whole Jumbo Nuts - Extra Fresh & Crunchy | Free Shipping On Orders Above ₹1499',
    speed: 5
  };

  const activeConfig = (tickerConfig && tickerConfig.enabled !== false && tickerConfig.text)
    ? tickerConfig
    : defaultConfig;

  if (!activeConfig || activeConfig.enabled === false || !activeConfig.text) {
    return null;
  }

  return (
    <div
      className="marquee-wrapper"
      style={{
        background: activeConfig.backgroundColor || '#162C18',
        color: activeConfig.textColor || '#FAF9F6',
        fontSize: '12px',
        fontWeight: '600',
        padding: '5px 0',
        lineHeight: '1.3',
        overflow: 'hidden',
        width: '100%'
      }}
    >
      <marquee 
        key={`ticker-${activeConfig.speed}-${activeConfig.text}`}
        behavior="scroll" 
        direction="left" 
        scrollamount={activeConfig.speed || 5}
      >
        {activeConfig.text}
      </marquee>
    </div>
  );
}
