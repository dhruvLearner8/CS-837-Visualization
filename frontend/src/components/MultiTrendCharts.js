import React from 'react';
import * as d3 from 'd3';

const chartWidth = 200;
const chartHeight = 120;
const margin = { top: 20, right: 10, bottom: 25, left: 45 };

const metrics = [
  { key: 'co2', label: 'CO₂ per Capita (t)', format: d3.format('.2f') },
  { key: 'gdp', label: 'GDP per Capita ($)', format: d3.format(',') },
  { key: 'population', label: 'Population', format: d3.format('.2s') }
];

const MultiTrendCharts = ({ selectedCountries, trendMap, regionColorMap }) => {
  if (selectedCountries.length === 0) return null;

  // Shared X Scale
  const xScale = d3.scaleLinear()
    .domain([1950, 2022])
    .range([margin.left, chartWidth - margin.right]);

  return (
    <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
      {selectedCountries.map(country => (
        <div key={country.entity}>
          <div style={{ marginBottom: '6px', fontWeight: 'bold' }}>
            {country.entity}
          </div>

          {metrics.map(metric => {
            const fullData = trendMap[country.entity] || [] ;
            

            const validData = fullData.filter(d => {
                const val = d[metric.key];
              
                // Thresholds for each metric
                const isValid =
                  d.year >= 1950 &&
                  val != null &&
                  !isNaN(val) &&
                  (
                    (metric.key === 'co2' && val > 0.01) ||
                    (metric.key === 'gdp' && val > 100) ||
                    (metric.key === 'population' && val > 1000)
                  );
              
                return isValid;
              });
              

            if (validData.length === 0) return null;

            const yScale = d3.scaleLinear()
              .domain([0, d3.max(validData, d => d[metric.key])])
              .nice()
              .range([chartHeight - margin.bottom, margin.top]);

            const line = d3.line()
              .defined(d => d[metric.key] != null)
              .x(d => xScale(d.year))
              .y(d => yScale(d[metric.key]));

            return (
              <svg
                key={metric.key}
                width={chartWidth}
                height={chartHeight}
                style={{ display: 'block', marginBottom: '10px' }}
              >
                {/* Y Ticks and Grid */}
                {yScale.ticks(3).map((tick, i) => (
                  <g key={i}>
                    <text
                      x={margin.left - 6}
                      y={yScale(tick)}
                      fontSize="10"
                      textAnchor="end"
                      alignmentBaseline="middle"
                      fill="#444"
                    >
                      {metric.format(tick)}
                    </text>
                    <line
                      x1={margin.left}
                      x2={chartWidth - margin.right}
                      y1={yScale(tick)}
                      y2={yScale(tick)}
                      stroke="#ccc"
                      strokeDasharray="2 2"
                    />
                  </g>
                ))}

                {/* X Ticks */}
                {xScale.ticks(3).map((tick, i) => (
                  <text
                    key={i}
                    x={xScale(tick)}
                    y={chartHeight - 5}
                    fontSize="10"
                    textAnchor="middle"
                    fill="#444"
                  >
                    {tick}
                  </text>
                ))}

                {/* Title */}
                <text
                  x={chartWidth / 2}
                  y={12}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#333"
                >
                  {metric.label}
                </text>

                {/* Line */}
                <path
                  d={line(validData)}
                  fill="none"
                  stroke={regionColorMap[country.region] || '#000'}
                  strokeWidth={2}
                />
              </svg>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MultiTrendCharts;
