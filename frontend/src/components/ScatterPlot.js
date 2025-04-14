// // ScatterPlot.js
// import React, { useRef, useEffect } from 'react';
// import * as d3 from 'd3';

// const ScatterPlot = ({
//   data,
//   selectedYear,
//   regionColorMap,
//   activeRegions,
//   selectedCountries,
//   setSelectedCountries,
//   zoomMode,
//   setHoveredCountry,
//   setHoverPos,
//   zoomExtent,
//   setZoomExtent
// }) => {
//   const svgRef = useRef();

//   useEffect(() => {
//     if (!data || data.length === 0) return;

//     const svg = d3.select(svgRef.current);
//     svg.selectAll('*').remove();

//     const margin = { top: 60, right: 20, bottom: 60, left: 70 };
//     const width = 800 - margin.left - margin.right;
//     const height = 500 - margin.top - margin.bottom;

//     const g = svg
//       .append('g')
//       .attr('transform', `translate(${margin.left},${margin.top})`);

//     const yearData = data.filter(d => d.year === selectedYear);

//     const filteredData = data.filter(d =>
//       d.year === selectedYear &&
//       d.year >= 1950 &&
//       d.gdp_per_capita != null &&
//       d.co2_emissions_per_capita != null &&
//       d.population != null &&
//       (activeRegions.length === 0 || activeRegions.includes(d.region))
//     );
    
//     console.log(filteredData)

//     const xScale = d3.scaleLog()
//       .domain([100, d3.max(filteredData, d => d.gdp_per_capita || 100000)])
//       .range([0, width]);

//     const yScale = d3.scaleLog()
//       .domain([0.1, d3.max(filteredData, d => d.co2_emissions_per_capita || 30)])
//       .range([height, 0]);

//     const rScale = d3.scaleSqrt()
//       .domain([0, 1.4e9])
//       .range([2, 40]);

//     // Gridlines + axes
//     g.append('g')
//       .attr('class', 'x-axis')
//       .attr('transform', `translate(0, ${height})`)
//       .call(d3.axisBottom(xScale)
//         .ticks(10, "~s")
//         .tickSize(-height)
//         .tickFormat(d3.format("$~s")))
//       .call(g => g.selectAll(".tick line").attr("stroke-opacity", 0.15));

//     g.append('g')
//       .attr('class', 'y-axis')
//       .call(d3.axisLeft(yScale)
//         .ticks(10, "~s")
//         .tickSize(-width)
//         .tickFormat(d3.format("~s")))
//       .call(g => g.selectAll(".tick line").attr("stroke-opacity", 0.15));

//     // Axis labels
//     g.append('text')
//       .attr('x', width / 2)
//       .attr('y', height + 45)
//       .attr('text-anchor', 'middle')
//       .style('font-size', '13px')
//       .text('GDP per capita (international-$ in 2011 prices)');

//     g.append('text')
//       .attr('transform', 'rotate(-90)')
//       .attr('x', -height / 2)
//       .attr('y', -50)
//       .attr('text-anchor', 'middle')
//       .style('font-size', '13px')
//       .text('Per capita emissions (tonnes per person)');

//     // Title
//     svg.append('text')
//       .attr('x', width / 2 + margin.left)
//       .attr('y', 30)
//       .attr('text-anchor', 'middle')
//       .style('font-size', '17px')
//       .style('font-weight', '600')
//       .text(`CO₂ emissions per capita vs. GDP per capita, ${selectedYear}`);

//     // Zoom support
//     const zoom = d3.zoom()
//       .scaleExtent([1, 10])
//       .extent([[0, 0], [width, height]])
//       .translateExtent([[0, 0], [width, height]])
//       .on('zoom', ({ transform }) => {
//         const newX = transform.rescaleX(xScale);
//         const newY = transform.rescaleY(yScale);

//         g.selectAll('circle')
//           .attr('cx', d => newX(d.gdp_per_capita))
//           .attr('cy', d => newY(d.co2_emissions_per_capita));

//         g.select('.x-axis').call(d3.axisBottom(newX).ticks(10, '~s').tickFormat(d3.format("$~s")));
//         g.select('.y-axis').call(d3.axisLeft(newY).ticks(10, '~s'));
//       });

//     if (zoomMode) {
//       svg.call(zoom);
//     } else {
//       svg.on('.zoom', null);
//     }

//     // Bubble rendering
//     g.selectAll('circle')
//       .data(filteredData)
//       .enter()
//       .append('circle')
//       .attr('cx', d => xScale(d.gdp_per_capita))
//       .attr('cy', d => yScale(d.co2_emissions_per_capita))
//       .attr('r', d => rScale(d.population))
//       .attr('fill', d => regionColorMap[d.region] || '#ccc')
//       .attr('fill-opacity', 0.7)
//       .attr('stroke', '#fff')
//       .attr('stroke-width', 0.8)
//       .on('click', d => {
//         setSelectedCountries(prev => {
//           const exists = prev.find(c => c.entity === d.entity);
//           if (exists) return prev.filter(c => c.entity !== d.entity);
//           if (prev.length < 3) return [...prev, d];
//           alert('You can only compare up to 3 countries.');
//           return prev;
//         });
//       })
//       .on('mouseover', function (event, d) {
//         setHoveredCountry(d);
//         const [x, y] = d3.pointer(event);
//         setHoverPos({ x: x + margin.left + 20, y: y + margin.top });
//       })
//       .on('mouseout', () => setHoveredCountry(null));

//     // Labels for selected countries
//     g.selectAll('text.country-label')
//       .data(filteredData.filter(d =>
//         selectedCountries.find(c => c.entity === d.entity)
//       ))
//       .enter()
//       .append('text')
//       .attr('class', 'country-label')
//       .attr('x', d => xScale(d.gdp_per_capita))
//       .attr('y', d => yScale(d.co2_emissions_per_capita))
//       .attr('dy', '-0.6em')
//       .attr('text-anchor', 'middle')
//       .style('font-size', '11px')
//       .style('font-weight', 'bold')
//       .style('fill', d => regionColorMap[d.region] || '#333')
//       .text(d => d.entity);
//   }, [
//     data,
//     selectedYear,
//     activeRegions,
//     selectedCountries,
//     zoomMode,
//     zoomExtent,
//     regionColorMap,
//     setHoveredCountry,
//     setHoverPos,
//     setSelectedCountries
//   ]);

//   return <svg ref={svgRef} width={850} height={560}></svg>;
// };

// export default ScatterPlot;


import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ScatterPlot = ({
  data,
  selectedYear = 2022,
  regionColorMap,
  activeRegions,
  selectedCountries,
  setSelectedCountries,
  zoomMode,
  setHoveredCountry,
  setHoverPos,
  zoomExtent,
  setZoomExtent
}) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data.length) return;

    const filteredData = data.filter(d =>
      d.year === selectedYear &&
      d.entity !== 'World' &&
      !d.entity.toLowerCase().includes('income') &&
      d.gdp_per_capita > 0 &&
      d.co2_emissions_per_capita > 0 &&
      d.population > 0
    );

  //  const filteredData = data.filter(d => d.year === selectedYear);

    const width = 900;
    const height = 450;
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chart = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    let x = d3.scaleLog()
      .domain([50, d3.max(filteredData, d => d.gdp_per_capita || 100000)])
      .range([0, innerWidth]);

    let y = d3.scaleLog()
      .domain([0.02, d3.max(filteredData, d => d.co2_emissions_per_capita || 10)])
      .range([innerHeight, 0]);

    if (zoomExtent) {
      const [x0, y0] = zoomExtent[0];
      const [x1, y1] = zoomExtent[1];
      const pad = 20;

      const paddedX0 = Math.max(x0 - pad, 0);
      const paddedX1 = Math.min(x1 + pad, innerWidth);
      const paddedY0 = Math.max(y0 - pad, 0);
      const paddedY1 = Math.min(y1 + pad, innerHeight);

      const xStart = x.invert(paddedX0);
      const xEnd = x.invert(paddedX1);
      const yStart = y.invert(paddedY1);
      const yEnd = y.invert(paddedY0);

      x = d3.scaleLog().domain([xStart, xEnd]).range([0, innerWidth]);
      y = d3.scaleLog().domain([yStart, yEnd]).range([innerHeight, 0]);
    }

    const yTickValues = [0.1, 1, 5, 10, 30].filter(val => val <= y.domain()[1]);
    const xTickValues = [50, 100, 1_000, 5_000, 20_000, 100_000];

    chart.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x).tickValues(xTickValues).tickFormat(d3.format("~s")));

    chart.append('g')
      .call(d3.axisLeft(y).tickValues(yTickValues).tickFormat(d => d.toString()))
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -60)
      .attr('fill', '#000')
      .style('font-size', '14px')
      .attr('text-anchor', 'middle')
      .text('CO₂ emissions per capita in Tonnes (log scale)');

    chart.append('g')
      .attr('class', 'x-grid')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(
        d3.axisBottom(x)
          .tickValues(xTickValues)
          .tickSize(-innerHeight)
          .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke', '#ccc')
      .attr('stroke-dasharray', '3 3');

    chart.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y)
        .tickValues(yTickValues)
        .tickSize(-innerWidth)
        .tickFormat('')
      )
      .selectAll('line')
      .attr('stroke', '#ccc')
      .attr('stroke-dasharray', '3 3');

    chart.selectAll('.x-grid path.domain').remove();
    chart.selectAll('.grid path.domain').remove();

    // Bubbles
    chart.selectAll('circle.bubble')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('clip-path', 'url(#clip)')
      .attr('cx', d => x(d.gdp_per_capita))
      .attr('cy', d => y(d.co2_emissions_per_capita))
      .attr('r', d => {
        const baseR = Math.sqrt(d.population) / 1000;
        return selectedCountries.some(c => c.entity === d.entity) ? baseR + 4 : baseR;
      })
      .attr('fill', d => {
        if (selectedCountries.some(c => c.entity === d.entity)) {
          return d3.color(regionColorMap[d.region]).brighter(0.5);
        }
        return activeRegions.includes(d.region) ? regionColorMap[d.region] || '#000' : '#ccc';
      })
      .attr('stroke', d =>
        selectedCountries.some(c => c.entity === d.entity)
          ? regionColorMap[d.region]
          : 'none'
      )
      .attr('stroke-width', d =>
        selectedCountries.some(c => c.entity === d.entity) ? 3 : 0
      )
      .attr('opacity', 0.85)
      .on('mouseover', function (event, d) {
        if (!zoomMode) {
          setHoveredCountry(d);
          const svgRect = svgRef.current.getBoundingClientRect();
          setHoverPos({
            x: event.clientX - svgRect.left + 10,
            y: event.clientY - svgRect.top - 28
          });
          d3.select(this)
            .attr('stroke', regionColorMap[d.region])
            .attr('stroke-width', 3)
            .attr('fill', d3.color(regionColorMap[d.region]).brighter(0.5))
            .attr('r', Math.sqrt(d.population) / 1000 + 4);
        }
      })
      .on('mouseout', function (event, d) {
        setHoveredCountry(null);
        const baseR = Math.sqrt(d.population) / 1000;
        const isSelected = selectedCountries.some(c => c.entity === d.entity);
        d3.select(this)
          .attr('r', isSelected ? baseR + 4 : baseR)
          .attr('stroke', isSelected ? regionColorMap[d.region] : 'none')
          .attr('stroke-width', isSelected ? 3 : 0)
          .attr('fill', () => {
            if (isSelected) {
              return d3.color(regionColorMap[d.region]).brighter(0.5);
            }
            return activeRegions.includes(d.region)
              ? regionColorMap[d.region] || '#000'
              : '#ccc';
          });
      })
      .on('click', function (event, d) {
        if (!zoomMode) {
          event.stopPropagation();
          const isAlreadySelected = selectedCountries.some(c => c.entity === d.entity);
          if (isAlreadySelected) {
            setSelectedCountries(prev => prev.filter(c => c.entity !== d.entity));
          } else if (selectedCountries.length < 3) {
            setSelectedCountries(prev => [...prev, d]);
          } else {
            alert('You can only compare up to 3 countries.');
          }
        }
      });

    // Labels
    chart.selectAll('text.label')
      .data(filteredData.filter(d =>
        activeRegions.includes(d.region) ||
        selectedCountries.some(c => c.entity === d.entity)
      ))
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.gdp_per_capita))
      .attr('y', d => y(d.co2_emissions_per_capita) - 8)
      .text(d => d.entity)
      .attr('font-size', '10px')
      .attr('fill', d => regionColorMap[d.region] || '#333')
      .attr('font-weight', 'bold')
      .attr('text-anchor', 'middle');

    // Brush zoom logic
    if (zoomMode) {
      const brush = d3.brush()
        .extent([[0, 0], [innerWidth, innerHeight]])
        .on("end", ({ selection }) => {
          if (selection) {
            setZoomExtent(selection);
          }
        });

      chart.append("g")
        .attr("class", "brush")
        .call(brush);
    }

  }, [data, selectedYear, activeRegions, regionColorMap, selectedCountries, zoomExtent, zoomMode]);

  return <svg ref={svgRef}></svg>;
};

export default ScatterPlot;



// import React, { useEffect, useRef } from 'react';
// import * as d3 from 'd3';

// const ScatterPlot = ({
//   data,
//   selectedYear = 2022,
//   regionColorMap,
//   activeRegions,
//   selectedCountries,
//   setSelectedCountries,
//   zoomMode,
//   setHoveredCountry,
//   setHoverTrendData,
//   setHoverPos,
//   zoomExtent,
//   setZoomExtent
// }) => {
//   const svgRef = useRef();

//   useEffect(() => {
//     if (!data.length) return;

//     const filteredData = data.filter(d => d.year === selectedYear);

//     // const filteredData = data.filter(d =>
//     //   d.year === selectedYear &&
//     //   d.entity !== 'World' &&
//     //   !d.entity.toLowerCase().includes('income') &&
//     //   d.gdp_per_capita > 0 &&
//     //   d.co2_emissions_per_capita > 0 &&
//     //   d.population > 0
//     // );
//     console.log(filteredData);

//     const width = 900;
//     const height = 450;
//     const margin = { top: 40, right: 40, bottom: 60, left: 80 };
//     const innerWidth = Math.max(0, width - margin.left - margin.right);
//     const innerHeight = Math.max(0, height - margin.top - margin.bottom);

//     const svg = d3.select(svgRef.current);
//     svg.selectAll('*').remove();

//     const chart = svg
//       .attr('width', width)
//       .attr('height', height)
//       .append('g')
//       .attr('transform', `translate(${margin.left},${margin.top})`);

//     svg.append("defs").append("clipPath")
//       .attr("id", "clip")
//       .append("rect")
//       .attr("width", innerWidth)
//       .attr("height", innerHeight);

//     const maxGDP = d3.max(filteredData, d => d.gdp_per_capita) || 100000;
//   //  const maxCO2 = d3.max(filteredData, d => d.co2_emissions_per_capita) || 10;
 

//     let x = d3.scaleLog()
//       .domain([50, maxGDP])
//       .range([0, innerWidth]);

//       const maxCO2 = d3.max(filteredData, d => d.co2_emissions_per_capita) || 10;
//       const y = d3.scaleLog()
//         .domain([0.02, maxCO2 * 1.3]) // ← this makes Y-axis go higher, pushing bubbles down
//         .range([innerHeight, 0]);

//     if (zoomExtent) {
//       const [x0, y0] = zoomExtent[0];
//       const [x1, y1] = zoomExtent[1];
//       const pad = 20;

//       const paddedX0 = Math.max(x0 - pad, 0);
//       const paddedX1 = Math.min(x1 + pad, innerWidth);
//       const paddedY0 = Math.max(y0 - pad, 0);
//       const paddedY1 = Math.min(y1 + pad, innerHeight);

//       const xStart = x.invert(paddedX0);
//       const xEnd = x.invert(paddedX1);
//       const yStart = y.invert(paddedY1);
//       const yEnd = y.invert(paddedY0);

//       if (!isNaN(xStart) && !isNaN(xEnd)) {
//         x = d3.scaleLog().domain([xStart, xEnd]).range([0, innerWidth]);
//       }
//       if (!isNaN(yStart) && !isNaN(yEnd)) {
//         y = d3.scaleLog().domain([yStart, yEnd]).range([innerHeight, 0]);
//       }
//     }

//     const yTickValues = [0.1, 1, 5, 10, 30].filter(val => val <= y.domain()[1]);
//     const xTickValues = [100, 1000, 5000, 20000, 100000].filter(val => val <= x.domain()[1]);

//     chart.append('g')
//       .attr('transform', `translate(0, ${innerHeight})`)
//       .call(d3.axisBottom(x).tickValues(xTickValues).tickFormat(d3.format("~s")))
//       .append('text')
//       .attr('x', innerWidth / 2)
//       .attr('y', 40)
//       .attr('fill', '#000')
//       .attr('text-anchor', 'middle')
//       .style('font-size', '14px')
//       .text('GDP per capita (log scale)');

//     chart.append('g')
//       .attr('class', 'grid')
//       .call(d3.axisLeft(y)
//         .tickValues(yTickValues)
//         .tickSize(-innerWidth)
//         .tickFormat(''))
//       .selectAll('line')
//       .attr('stroke', '#ccc')
//       .attr('stroke-dasharray', '3 3');

//     chart.append('g')
//       .call(d3.axisLeft(y)
//         .tickValues(yTickValues)
//         .tickFormat(d => d.toString()))
//       .append('text')
//       .attr('transform', 'rotate(-90)')
//       .attr('x', -innerHeight / 2)
//       .attr('y', -60)
//       .attr('fill', '#000')
//       .attr('text-anchor', 'middle')
//       .style('font-size', '14px')
//       .text('CO₂ emissions per capita in Tonnes (log scale)');

//     chart.append('g')
//       .attr('class', 'x-grid')
//       .attr('transform', `translate(0, ${innerHeight})`)
//       .call(d3.axisBottom(x)
//         .tickValues(xTickValues)
//         .tickSize(-innerHeight)
//         .tickFormat(''))
//       .selectAll('line')
//       .attr('stroke', '#ccc')
//       .attr('stroke-dasharray', '3 3');

//     chart.selectAll('.x-grid path.domain').remove();
//     chart.selectAll('.grid path.domain').remove();

//     chart.selectAll('circle.bubble')
//       .data(filteredData)
//       .enter()
//       .append('circle')
//       .attr('class', 'bubble')
//       .attr('clip-path', 'url(#clip)')
//       .attr('cx', d => x(d.gdp_per_capita))
//       .attr('cy', d => y(d.co2_emissions_per_capita))
//       .attr('r', d => {
//         const baseR = Math.sqrt(d.population) / 1000;
//         return selectedCountries.some(c => c.entity === d.entity) ? baseR + 4 : baseR;
//       })
//       .attr('fill', d => {
//         if (selectedCountries.some(c => c.entity === d.entity)) {
//           return d3.color(regionColorMap[d.region]).brighter(0.5);
//         }
//         return activeRegions.includes(d.region)
//           ? regionColorMap[d.region] || '#000'
//           : '#ccc';
//       })
//       .attr('stroke', d =>
//         selectedCountries.some(c => c.entity === d.entity)
//           ? regionColorMap[d.region]
//           : 'none'
//       )
//       .attr('stroke-width', d =>
//         selectedCountries.some(c => c.entity === d.entity) ? 3 : 0
//       )
//       .attr('opacity', 0.85)
//       .on('mouseover', function (event, d) {
//         if (!zoomMode) {
//           setHoveredCountry(d);
//           const svgRect = svgRef.current.getBoundingClientRect();
//           setHoverPos({
//             x: event.clientX - svgRect.left + 10,
//             y: event.clientY - svgRect.top - 28
//           });
//           d3.select(this)
//             .attr('stroke', regionColorMap[d.region])
//             .attr('stroke-width', 3)
//             .attr('fill', d3.color(regionColorMap[d.region]).brighter(0.5))
//             .attr('r', Math.sqrt(d.population) / 1000 + 4);
//         }
//       })
//       .on('mouseout', function (event, d) {
//         setHoveredCountry(null);
//         const baseR = Math.sqrt(d.population) / 1000;
//         const isSelected = selectedCountries.some(c => c.entity === d.entity);
//         d3.select(this)
//           .attr('r', isSelected ? baseR + 4 : baseR)
//           .attr('stroke', isSelected ? regionColorMap[d.region] : 'none')
//           .attr('stroke-width', isSelected ? 3 : 0)
//           .attr('fill', () => {
//             if (isSelected) {
//               return d3.color(regionColorMap[d.region]).brighter(0.5);
//             }
//             return activeRegions.includes(d.region)
//               ? regionColorMap[d.region] || '#000'
//               : '#ccc';
//           });
//       })
//       .on('click', function (event, d) {
//         if (!zoomMode) {
//           event.stopPropagation();
//           const isSelected = selectedCountries.some(c => c.entity === d.entity);
//           if (isSelected) {
//             setSelectedCountries(prev => prev.filter(c => c.entity !== d.entity));
//           } else if (selectedCountries.length < 3) {
//             setSelectedCountries(prev => [...prev, d]);
//           } else {
//             alert('You can only compare up to 3 countries.');
//           }
//         }
//       });

//     chart.selectAll('text.label')
//       .data(filteredData.filter(d =>
//         activeRegions.includes(d.region) ||
//         selectedCountries.some(c => c.entity === d.entity)
//       ))
//       .enter()
//       .append('text')
//       .attr('class', 'label')
//       .attr('x', d => x(d.gdp_per_capita))
//       .attr('y', d => y(d.co2_emissions_per_capita) - 8)
//       .text(d => d.entity)
//       .attr('font-size', '10px')
//       .attr('fill', d => regionColorMap[d.region] || '#333')
//       .attr('font-weight', 'bold')
//       .attr('text-anchor', 'middle');

//     if (zoomMode) {
//       const brush = d3.brush()
//         .extent([[0, 0], [innerWidth, innerHeight]])
//         .on("end", ({ selection }) => {
//           if (selection) {
//             setZoomExtent(selection);
//           }
//         });

//       chart.append("g")
//         .attr("class", "brush")
//         .call(brush);
//     }

//   }, [data, selectedYear, activeRegions, regionColorMap, selectedCountries, zoomExtent, zoomMode]);

//   return <svg ref={svgRef}></svg>;
// };

// export default ScatterPlot;



// import React, { useEffect, useRef } from 'react';
// import * as d3 from 'd3';

// const ScatterPlot = ({
//   data,
//   selectedYear = 2022,
//   regionColorMap,
//   activeRegions,
//   selectedCountries,
//   setSelectedCountries,
//   zoomMode,
//   setHoveredCountry,
//   setHoverPos,
//   zoomExtent,
//   setZoomExtent
// }) => {
//   const svgRef = useRef();

//   useEffect(() => {
//     if (!data.length) return;

//     const filteredData = data.filter(d =>
//       d.year === selectedYear &&
//       d.entity !== 'World' &&
//       !d.entity.toLowerCase().includes('income') &&
//       d.gdp_per_capita > 0 &&
//       d.co2_emissions_per_capita > 0 &&
//       d.population > 0
//     );

//     const width = 900;
//     const height = 450;
//     const margin = { top: 40, right: 40, bottom: 60, left: 80 };

//     const svg = d3.select(svgRef.current);
//     svg.selectAll('*').remove();

//     const chart = svg
//       .attr('width', width)
//       .attr('height', height)
//       .append('g')
//       .attr('transform', `translate(${margin.left},${margin.top})`);

//     const innerWidth = width - margin.left - margin.right;
//     const innerHeight = height - margin.top - margin.bottom;

//     svg.append("defs").append("clipPath")
//       .attr("id", "clip")
//       .append("rect")
//       .attr("width", innerWidth)
//       .attr("height", innerHeight);

//     let x = d3.scaleLog()
//       .domain([50, d3.max(filteredData, d => d.gdp_per_capita || 100000)])
//       .range([0, innerWidth]);

//     let y = d3.scaleLog()
//       .domain([0.02, d3.max(filteredData, d => d.co2_emissions_per_capita || 10)])
//       .range([innerHeight, 0]);

//     if (zoomExtent) {
//       const [x0, y0] = zoomExtent[0];
//       const [x1, y1] = zoomExtent[1];
//       const pad = 20;

//       const paddedX0 = Math.max(x0 - pad, 0);
//       const paddedX1 = Math.min(x1 + pad, innerWidth);
//       const paddedY0 = Math.max(y0 - pad, 0);
//       const paddedY1 = Math.min(y1 + pad, innerHeight);

//       const xStart = x.invert(paddedX0);
//       const xEnd = x.invert(paddedX1);
//       const yStart = y.invert(paddedY1);
//       const yEnd = y.invert(paddedY0);

//       x = d3.scaleLog().domain([xStart, xEnd]).range([0, innerWidth]);
//       y = d3.scaleLog().domain([yStart, yEnd]).range([innerHeight, 0]);
//     }

// //     const originalX = d3.scaleLog()
// //   .domain([50, d3.max(filteredData, d => d.gdp_per_capita || 100000)])
// //   .range([0, innerWidth]);

// // const originalY = d3.scaleLog()
// //   .domain([0.02, d3.max(filteredData, d => d.co2_emissions_per_capita || 10)])
// //   .range([innerHeight, 0]);

// // let x = originalX;
// // let y = originalY;

// // if (zoomExtent) {
// //   const [x0, y0] = zoomExtent[0];
// //   const [x1, y1] = zoomExtent[1];
// //   const pad = 20;

// //   const paddedX0 = Math.max(x0 - pad, 0);
// //   const paddedX1 = Math.min(x1 + pad, innerWidth);
// //   const paddedY0 = Math.max(y0 - pad, 0);
// //   const paddedY1 = Math.min(y1 + pad, innerHeight);

// //   const xStart = originalX.invert(paddedX0);
// //   const xEnd = originalX.invert(paddedX1);
// //   const yStart = originalY.invert(paddedY1);
// //   const yEnd = originalY.invert(paddedY0);

// //   x = d3.scaleLog().domain([xStart, xEnd]).range([0, innerWidth]);
// //   y = d3.scaleLog().domain([yStart, yEnd]).range([innerHeight, 0]);
// // }


//     const yTickValues = [0.1, 1, 5, 10, 30].filter(val => val <= y.domain()[1]);
//     const xTickValues = [50, 100, 1_000, 5_000, 20_000, 100_000];

//     chart.append('g')
//       .attr('transform', `translate(0, ${innerHeight})`)
//       .call(d3.axisBottom(x).tickValues(xTickValues).tickFormat(d3.format("~s")));

//     chart.append('g')
//       .call(d3.axisLeft(y).tickValues(yTickValues).tickFormat(d => d.toString()))
//       .append('text')
//       .attr('transform', 'rotate(-90)')
//       .attr('x', -innerHeight / 2)
//       .attr('y', -60)
//       .attr('fill', '#000')
//       .style('font-size', '14px')
//       .attr('text-anchor', 'middle')
//       .text('CO₂ emissions per capita in Tonnes (log scale)');
//       // Axes
// chart.append('g')
//   .attr('transform', `translate(0, ${innerHeight})`)
//   .call(d3.axisBottom(x).ticks(10, "~s"))
//   .append('text')
//   .attr('x', innerWidth / 2)
//   .attr('y', 40)
//   .attr('fill', '#000')
//   .attr('text-anchor', 'middle')
//   .style('font-size', '14px')
//   .text('GDP per capita (log scale)');

//     chart.append('g')
//       .attr('class', 'x-grid')
//       .attr('transform', `translate(0, ${innerHeight})`)
//       .call(
//         d3.axisBottom(x)
//           .tickValues(xTickValues)
//           .tickSize(-innerHeight)
//           .tickFormat('')
//       )
      
//       .selectAll('line')
//       .attr('stroke', '#ccc')
//       .attr('stroke-dasharray', '3 3');

//     chart.append('g')
//       .attr('class', 'grid')
//       .call(d3.axisLeft(y)
//         .tickValues(yTickValues)
//         .tickSize(-innerWidth)
//         .tickFormat('')
//       )
//       .selectAll('line')
//       .attr('stroke', '#ccc')
//       .attr('stroke-dasharray', '3 3')
//       .style('font-size', '14px')
//       .attr('text-anchor', 'middle')
//       .text('GDP per capita (log scale)');
     

//     chart.selectAll('.x-grid path.domain').remove();
//     chart.selectAll('.grid path.domain').remove();

//     // Bubbles
//     chart.selectAll('circle.bubble')
//       .data(filteredData)
//       .enter()
//       .append('circle')
//       .attr('class', 'bubble')
//       .attr('clip-path', 'url(#clip)')
//       .attr('cx', d => x(d.gdp_per_capita))
//       .attr('cy', d => y(d.co2_emissions_per_capita))
//       .attr('r', d => {
//         const baseR = Math.sqrt(d.population) / 1000;
//         return selectedCountries.some(c => c.entity === d.entity) ? baseR + 4 : baseR;
//       })
//       .attr('fill', d => {
//         if (selectedCountries.some(c => c.entity === d.entity)) {
//           return d3.color(regionColorMap[d.region]).brighter(0.5);
//         }
//         return activeRegions.includes(d.region) ? regionColorMap[d.region] || '#000' : '#ccc';
//       })
//       .attr('stroke', d =>
//         selectedCountries.some(c => c.entity === d.entity)
//           ? regionColorMap[d.region]
//           : 'none'
//       )
//       .attr('stroke-width', d =>
//         selectedCountries.some(c => c.entity === d.entity) ? 3 : 0
//       )
//       .attr('opacity', 0.85)
//       .on('mouseover', function (event, d) {
//         if (!zoomMode) {
//           setHoveredCountry(d);
//           const svgRect = svgRef.current.getBoundingClientRect();
//           setHoverPos({
//             x: event.clientX - svgRect.left + 10,
//             y: event.clientY - svgRect.top - 28
//           });
//           d3.select(this)
//             .attr('stroke', regionColorMap[d.region])
//             .attr('stroke-width', 3)
//             .attr('fill', d3.color(regionColorMap[d.region]).brighter(0.5))
//             .attr('r', Math.sqrt(d.population) / 1000 + 4);
//         }
//       })
//       .on('mouseout', function (event, d) {
//         setHoveredCountry(null);
//         const baseR = Math.sqrt(d.population) / 1000;
//         const isSelected = selectedCountries.some(c => c.entity === d.entity);
//         d3.select(this)
//           .attr('r', isSelected ? baseR + 4 : baseR)
//           .attr('stroke', isSelected ? regionColorMap[d.region] : 'none')
//           .attr('stroke-width', isSelected ? 3 : 0)
//           .attr('fill', () => {
//             if (isSelected) {
//               return d3.color(regionColorMap[d.region]).brighter(0.5);
//             }
//             return activeRegions.includes(d.region)
//               ? regionColorMap[d.region] || '#000'
//               : '#ccc';
//           });
//       })
//       .on('click', function (event, d) {
//         if (!zoomMode) {
//           event.stopPropagation();
//           const isAlreadySelected = selectedCountries.some(c => c.entity === d.entity);
//           if (isAlreadySelected) {
//             setSelectedCountries(prev => prev.filter(c => c.entity !== d.entity));
//           } else if (selectedCountries.length < 3) {
//             setSelectedCountries(prev => [...prev, d]);
//           } else {
//             alert('You can only compare up to 3 countries.');
//           }
//         }
//       });

//     // Labels
//     chart.selectAll('text.label')
//       .data(filteredData.filter(d =>
//         activeRegions.includes(d.region) ||
//         selectedCountries.some(c => c.entity === d.entity)
//       ))
//       .enter()
//       .append('text')
//       .attr('class', 'label')
//       .attr('x', d => x(d.gdp_per_capita))
//       .attr('y', d => y(d.co2_emissions_per_capita) - 8)
//       .text(d => d.entity)
//       .attr('font-size', '10px')
//       .attr('fill', d => regionColorMap[d.region] || '#333')
//       .attr('font-weight', 'bold')
//       .attr('text-anchor', 'middle');
      

//     // Brush zoom logic
//     if (zoomMode) {
//       const brush = d3.brush()
//         .extent([[0, 0], [innerWidth, innerHeight]])
//         .on("end", ({ selection }) => {
//           if (selection) {
//             setZoomExtent(selection);
//           }
//         });

//       chart.append("g")
//         .attr("class", "brush")
//         .call(brush);
//     }

//   }, [data, selectedYear, activeRegions, regionColorMap, selectedCountries, zoomExtent, zoomMode]);

//   return <svg ref={svgRef}></svg>;
// };

// export default ScatterPlot;
