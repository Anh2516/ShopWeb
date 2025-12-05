import React from "react";
import "./Chart.css";

const SimpleBarChart = ({
  data,
  dataKey,
  color = "#ffc107",
  label,
  formatter,
}) => {
  if (!data || data.length === 0) {
    return <div className="chart-empty">Không có dữ liệu</div>;
  }

  const maxValue = Math.max(...data.map((item) => item[dataKey] || 0));
  const chartHeight = 250;
  const barWidth = 100 / data.length;
  const barSpacing = 2;

  return (
    <div className="simple-chart-container">
      <div className="chart-y-axis">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = maxValue * ratio;
          return (
            <div key={i} className="chart-y-label">
              {formatter
                ? formatter(value)
                : Math.round(value).toLocaleString()}
            </div>
          );
        })}
      </div>
      <div className="chart-content">
        <div className="bar-chart-wrapper" style={{ height: chartHeight }}>
          {data.map((item, index) => {
            const value = item[dataKey] || 0;
            const barHeight = (value / maxValue) * chartHeight;
            return (
              <div
                key={index}
                className="bar-chart-item"
                style={{
                  width: `calc(${barWidth}% - ${barSpacing}px)`,
                  marginRight: `${barSpacing}px`,
                }}
                title={`${item.date || item.label}: ${
                  formatter ? formatter(value) : value
                }`}
              >
                <div
                  className="bar-chart-bar"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: color,
                    borderRadius: "4px 4px 0 0",
                  }}
                />
              </div>
            );
          })}
        </div>

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

export default SimpleBarChart;
