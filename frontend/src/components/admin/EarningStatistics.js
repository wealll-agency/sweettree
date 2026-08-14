'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../utils/axiosConfig';
import styles from './EarningStatistics.module.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles.customTooltip}>
        <p className={styles.tooltipLabel}>{label}</p>
        <div className={styles.tooltipItem}>
          <span className={`${styles.dot} ${styles.dotInHouse}`}></span>
          <span>In-house: ₹{payload[0]?.value?.toLocaleString() || 0}</span>
        </div>
        <div className={styles.tooltipItem}>
          <span className={`${styles.dot} ${styles.dotSeller}`}></span>
          <span>Seller: ₹{payload[1]?.value?.toLocaleString() || 0}</span>
        </div>
        <div className={styles.tooltipItem}>
          <span className={`${styles.dot} ${styles.dotCommission}`}></span>
          <span>Commission: ₹{payload[2]?.value?.toLocaleString() || 0}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function EarningStatistics({ data: initialData }) {
  const [activeTab, setActiveTab] = useState('This Year');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChartData(activeTab);
  }, [activeTab]);

  const fetchChartData = async (tab) => {
    let range = 'year';
    if (tab === 'This Month') range = 'month';
    if (tab === 'This Week') range = 'week';

    try {
      setLoading(true);
      const res = await api.get(`/reports/sales-chart?range=${range}`);
      if (res.data.success) {
        formatAndSetData(res.data.data, range);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      formatAndSetData([], range);
    } finally {
      setLoading(false);
    }
  };

  const formatAndSetData = (rawData, range) => {
    let formatted = [];
    if (range === 'year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      formatted = months.map((m, idx) => {
        const found = rawData.find(d => d._id?.month === idx + 1);
        return { name: m, inHouse: found ? found.revenue : 0, seller: 0, commission: 0 };
      });
    } else if (range === 'month') {
      const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        const found = rawData.find(d => d._id?.day === i);
        formatted.push({ name: i.toString(), inHouse: found ? found.revenue : 0, seller: 0, commission: 0 });
      }
    } else if (range === 'week') {
      const displayDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const mapMongoToDisplay = { 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat', 1: 'Sun' };
      
      formatted = displayDays.map(d => {
        const mongoId = Object.keys(mapMongoToDisplay).find(key => mapMongoToDisplay[key] === d);
        const found = rawData.find(x => x._id?.dayOfWeek == mongoId);
        return { name: d, inHouse: found ? found.revenue : 0, seller: 0, commission: 0 };
      });
    }
    setChartData(formatted);
  };

  const yAxisTickFormatter = (value) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k ₹`;
    }
    return `${value} ₹`;
  };

  return (
    <div className={styles.cardContainer}>
      <div className={styles.header}>
        <h5 className={styles.title}>
          <span className="text-warning">💰</span> Sales Overview
        </h5>
        <div className={styles.buttonGroup}>
          {['This Year', 'This Month', 'This Week'].map(tab => (
            <button 
              key={tab}
              className={`${styles.btn} ${activeTab === tab ? styles.active : ''}`}
              onClick={() => setActiveTab(tab)}
              disabled={loading}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.legendContainer}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.inHouseBox}`}></div>
          <span>In-house</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.sellerBox}`}></div>
          <span>Seller</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendBox} ${styles.commissionBox}`}></div>
          <span>Commission</span>
        </div>
      </div>

      <div className={styles.chartWrapper} style={{ position: 'relative' }}>
        {loading && <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)', zIndex: 10, fontSize: '13px', color: '#666'}}>Updating Data...</div>}
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorInHouse" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSeller" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3498db" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f39c12" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#f39c12" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#999', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#999', fontSize: 12 }} 
              tickFormatter={yAxisTickFormatter}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#eee', strokeWidth: 1, strokeDasharray: '3 3' }} />
            
            <Area 
              type="monotone" 
              dataKey="commission" 
              stroke="#f39c12" 
              fillOpacity={1} 
              fill="url(#colorCommission)" 
              strokeWidth={2}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#f39c12' }}
            />
            <Area 
              type="monotone" 
              dataKey="seller" 
              stroke="#3498db" 
              fillOpacity={1} 
              fill="url(#colorSeller)" 
              strokeWidth={2}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#3498db' }}
            />
            <Area 
              type="monotone" 
              dataKey="inHouse" 
              stroke="#2ecc71" 
              fillOpacity={1} 
              fill="url(#colorInHouse)" 
              strokeWidth={2}
              activeDot={{ r: 4, strokeWidth: 0, fill: '#2ecc71' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
