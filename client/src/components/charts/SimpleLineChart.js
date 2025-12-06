import React from 'react';
import './Chart.css';

const SimpleLineChart = ({ data, dataKey, color = '#28a745', label, formatter }) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">Không có dữ liệu</div>;
  }

  const maxValue = Math.max(...data.map(item => item[dataKey] || 0));
  const minValue = Math.min(...data.map(item => item[dataKey] || 0));
  const range = maxValue - minValue || 1;
  const chartHeight = 250;
  const chartWidth = 100;
  const pointRadius = 4;

  // Tính toán điểm cho line
  const points = data.map((item, index) => {
    const value = item[dataKey] || 0;
    const x = data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2;
    const y = chartHeight - ((value - minValue) / range) * chartHeight;
    return { x, y, value, label: item.date || item.label };
  });

  // Tạo path cho line
  const pathData = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }).join(' ');

  return (
    <div className="simple-chart-container">
      <div className="chart-y-axis">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = minValue + (range * ratio);
          return (
            <div key={i} className="chart-y-label">
              {formatter ? formatter(value) : value.toLocaleString()}
            </div>
          );
        })}
      </div>
      <div className="chart-content">
        <svg width="100%" height={chartHeight + 40} viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = chartHeight - (chartHeight * ratio);
            return (
              <line
                key={i}
                x1="0"
                y1={y}
                x2={chartWidth}
                y2={y}
                stroke="#e0e0e0"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          })}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id={`lineGradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id={`lineStroke-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color} stopOpacity="0.7" />
            </linearGradient>
          </defs>
          
          {/* Area under line */}
          <path
            d={`${pathData} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`}
            fill={`url(#lineGradient-${color.replace('#', '')})`}
            opacity="0.6"
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke={`url(#lineStroke-${color.replace('#', '')})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r={pointRadius + 2}
                fill="white"
                stroke={color}
                strokeWidth="2"
                className="chart-point"
                data-value={formatter ? formatter(point.value) : point.value}
                data-label={point.label}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={pointRadius}
                fill={color}
                className="chart-point"
                data-value={formatter ? formatter(point.value) : point.value}
                data-label={point.label}
              />
            </g>
          ))}
        </svg>
        
        {/* X-axis labels */}
        <div className="chart-x-axis">
          {data.map((item, index) => (
            <div key={index} className="chart-x-label">
              {item.date || item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleLineChart;

