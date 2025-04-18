


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
  setZoomExtent,
  hasZoomed={hasZoomed},
  setHasZoomed={setHasZoomed}
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

      chart.append('text')
  .attr('x', innerWidth / 2)
  .attr('y', innerHeight + 50)  // push it below the axis
  .attr('fill', '#000')
  .style('font-size', '14px')
  .attr('text-anchor', 'middle')
  .text('GDP per capita (log scale)');

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


