import React from 'react';

const MiniTrendChart = ({ country, data, color }) => {
  const width = 240;
  const height = 120;
  const margin = { top: 10, right: 10, bottom: 25, left: 40 };

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (!data || data.length === 0) return null;

  // Filter data to only include from 1850 onwards
  const filteredData = data.filter(
    d => d.year >= 1850 && d.co2 !== null && d.co2 > 0
  );
  if (filteredData.length === 0) return null;

  const years = filteredData.map(d => d.year);
  const values = filteredData.map(d => d.co2);

  const startYear = 1850;
  const endYear = Math.max(...years);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);

  // Scales
  const xScale = (year) =>
    ((year - startYear) / (endYear - startYear)) * innerWidth;

  const yScale = (val) =>
    innerHeight - ((val - minVal) / (maxVal - minVal || 1)) * innerHeight;

  // Line path
  const linePath = filteredData
    .map((d, i) => {
      const x = xScale(d.year) + margin.left;
      const y = yScale(d.co2) + margin.top;
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  // Ticks
  const xTicks = [startYear, Math.round((startYear + endYear) / 2), endYear];
  const yTicks = [minVal, (minVal + maxVal) / 2, maxVal];

  return (
    <div style={{ fontSize: '12px' }}>
      <strong>{country}</strong>
      <svg width={width} height={height}>
        {/* Axes */}
        <line
          x1={margin.left}
          y1={height - margin.bottom}
          x2={width - margin.right}
          y2={height - margin.bottom}
          stroke="#ddd"
        />
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={height - margin.bottom}
          stroke="#ddd"
        />

        {/* X Axis Ticks */}
        {xTicks.map((tick, i) => (
          <text
            key={i}
            x={xScale(tick) + margin.left}
            y={height - 6}
            textAnchor="middle"
            fill="#555"
            fontSize="10px"
          >
            {tick}
          </text>
        ))}

        {/* Y Axis Ticks */}
        {yTicks.map((tick, i) => (
          <text
            key={i}
            x={margin.left - 6}
            y={yScale(tick) + margin.top + 3}
            textAnchor="end"
            fill="#555"
            fontSize="10px"
          >
            {tick.toFixed(1)}
          </text>
        ))}

        {/* Trend Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />

        {/* Final Point */}
        <circle
          cx={xScale(filteredData[filteredData.length - 1].year) + margin.left}
          cy={yScale(filteredData[filteredData.length - 1].co2) + margin.top}
          r={3}
          fill={color}
        />
      </svg>
      <div style={{ marginTop: '4px' }}>CO₂ emissions over time (t/person)</div>
    </div>
  );
};

export default MiniTrendChart;
