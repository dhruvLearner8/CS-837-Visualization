import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import ScatterPlot from './ScatterPlot';
import CountrySelector from './CountrySelector';
import MultiTrendCharts from './MultiTrendCharts'; // 👈 NEW
import * as d3 from 'd3';

const regionList = ['Africa', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'];

const regionColorMap = {};
regionList.forEach((region, i) => {
  regionColorMap[region] = d3.schemeTableau10[i];
});

// const customColors = ['#8c510a', '#d8b365', '#f6e8c3', '#c7eae5', '#5ab4ac', '#01665e'];

// const regionColorMap = {};
// regionList.forEach((region, i) => {
//   regionColorMap[region] = customColors[i % customColors.length];
// });

const Home = () => {
  const [data, setData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2022);
  const [yearRange, setYearRange] = useState({ min: 1950, max: 2022 });
  const [activeRegions, setActiveRegions] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [showCountrySelector, setShowCountrySelector] = useState(false);
  const [zoomMode, setZoomMode] = useState(false);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
  const [zoomExtent, setZoomExtent] = useState(null);
  const [showAbout, setShowAbout] = useState(false);


  // Expanded trend map with all 3 metrics
  const countryTrendMap = useMemo(() => {
    const map = {};
    data.forEach(d => {
      if (!map[d.entity]) map[d.entity] = [];
      map[d.entity].push({
        year: d.year,
        co2: d.co2_emissions_per_capita,
        gdp: d.gdp_per_capita,
        population: d.population
      });
    });
    return map;
  }, [data]);

  const startAnimation = () => {
    if (!isPlaying) {
      const id = setInterval(() => {
        setSelectedYear(prev => {
          const nextYear = prev + 1;
          if (nextYear > yearRange.max) {
            clearInterval(id);
            setIsPlaying(false);
            return yearRange.max;
          }
          return nextYear;
        });
      }, 100);
      setIntervalId(id);
      setIsPlaying(true);
    }
  };

  const stopAnimation = () => {
    clearInterval(intervalId);
    setIsPlaying(false);
  };

  const toggleAnimation = () => {
    isPlaying ? stopAnimation() : startAnimation();
  };

  useEffect(() => {
   // axios.get('http://localhost:5000/api/data')
   axios.get('https://cs-837-visualization-4.onrender.com/api/data')
      .then(response => {
        setData(response.data);
        setYearRange({ min: 1800, max: 2022 });
      })
      .catch(error => console.error('Error fetching data:', error));

    return () => clearInterval(intervalId);
  }, []);

  const toggleRegion = (region) => {
    setActiveRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };
  const toggleCountry = (country) => {
    setSelectedCountries(prev => {
      const exists = prev.find(c => c.entity === country.entity);
      
      if (exists) {
        // Deselect country
        return prev.filter(c => c.entity !== country.entity);
      } else if (prev.length < 3) {
        // Select new country (if less than 3)
        return [...prev, country];
      } else {
        // Already 3 selected — block selection
        alert('You can only compare up to 3 countries.');
        return prev; // no change
      }
    });
  };
  
  

  return (
    <div style={{ padding: '20px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '40px', right: '40px' }}>
  <button
    onClick={() => setShowAbout(true)}
    style={{
      padding: '8px 14px',
      backgroundColor: '#dddddd',
      color: 'black',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    ℹ️ About Data
  </button>
</div>

      <h1>GDP vs Pollution Visualization</h1>

      {/* Horizontal Legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '20px',
        marginBottom: '20px'
      }}>
        {regionList.map(region => (
          <label key={region} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={activeRegions.includes(region)}
              onChange={() => toggleRegion(region)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                backgroundColor: activeRegions.includes(region)
                  ? regionColorMap[region]
                  : '#fff',
                border: `2px solid ${regionColorMap[region]}`,
                marginRight: '8px',
                cursor: 'pointer'
              }}
            />
            <span>{region}</span>
          </label>
        ))}
      </div>

      {/* Controls */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'row', gap: '10px' }}>
  {/* Zoom Mode Toggle */}
  <button
    onClick={() => setZoomMode(!zoomMode)}
    style={{
      padding: '8px 12px',
      backgroundColor: zoomMode ? '#007bff' : '#ccc',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    {zoomMode ? '🧭 Zoom Mode: ON' : '🔍 Enable Zoom Mode'}
  </button>

  {/* ✅ Show reset zoom button if zoom is active */}
  {zoomMode && (
    <button
      onClick={() => setZoomExtent(null)}
      style={{
        padding: '8px 12px',
        backgroundColor: '#666',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      🔄 Reset Zoom
    </button>
  )}

  {/* Select countries */}
  <button onClick={() => setShowCountrySelector(true)}>+ Select Countries</button>

  {/* Reset selections */}
  <button
    onClick={() => {
      setSelectedCountries([]);
      setActiveRegions([]);
    }}
    style={{
      backgroundColor: '#f44336',
      color: 'white',
      border: 'none',
      padding: '8px',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    Reset Selections
  </button>
</div>


     
      <div style={{ display: 'flex' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <ScatterPlot
            data={data}
            selectedYear={selectedYear}
            regionColorMap={regionColorMap}
            activeRegions={activeRegions}
            selectedCountries={selectedCountries}
            setSelectedCountries={setSelectedCountries}
            zoomMode={zoomMode}
            setHoveredCountry={setHoveredCountry}
            setHoverPos={setHoverPos}
            zoomExtent={zoomExtent}              // 👈 Pass zoom extent
            setZoomExtent={setZoomExtent} 
          />

       
          <div style={{
             display: 'flex',
            position: 'absolute-bottom',
         //   justifyContent: '',
            width: '800px',
            margin: '30px 20px 20px 0px',
            padding: '0px 20px 20px 70px',
            gap: '10px'
          }}>  
            <button
              onClick={toggleAnimation}
              style={{
                width: '40px',
                padding: '8px',
                fontSize: '14px',
                color: 'grey',
                border: '1px solid #999',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {isPlaying ? '❚❚' : '▶'}
            </button>

            <input
              type="range"
              min={yearRange.min}
              max={yearRange.max}
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                flex: 1,
                height: '6px',
                background: '#ccc',
                borderRadius: '3px',
                appearance: 'none',
                WebkitAppearance: 'none',
                outline: 'none',
                cursor: 'pointer',
                accentColor: 'grey'
              }}
            />
          </div>

          <div style={{  fontSize: '16px', marginBottom: '0px', color: '#444', padding: '0px 0px 0px 400px' }}>
            Year: {selectedYear}
          </div>
        </div>
       

        {/* Right Panel: Mini Trend Charts */}
        <div style={{ flexShrink: 0, paddingLeft: '16px' }}>
          {selectedCountries.length > 0 && (
            <MultiTrendCharts
              selectedCountries={selectedCountries}
              trendMap={countryTrendMap}
              regionColorMap={regionColorMap}
            />
          )}
        </div>

        {/* Hover Card */}
        {!zoomMode && hoveredCountry && (
          <div style={{
            position: 'absolute',
            left: `${hoverPos.x}px`,
            top: `${hoverPos.y}px`,
            background: '#fff',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            zIndex: 100,
            pointerEvents: 'none'
          }}>
            <strong>{hoveredCountry.entity}</strong><br />
            Year: {hoveredCountry.year}<br />
            GDP per capita: ${Math.round(hoveredCountry.gdp_per_capita)}<br />
            CO₂ per capita: {hoveredCountry.co2_emissions_per_capita.toFixed(2)} t<br />
            Population: {hoveredCountry.population.toLocaleString()}
          </div>
        )}
      </div>

      {/* Country Selector Panel */}
      {showCountrySelector && (
        <CountrySelector
          data={data}
          selectedCountries={selectedCountries}
          toggleCountry={toggleCountry}
          close={() => setShowCountrySelector(false)}
        />
      )}


{showAbout && (
  <div style={{
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: '#fff',
      padding: '30px 40px',
      borderRadius: '10px',
      maxWidth: '750px',
      width: '90%',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
      position: 'relative',
      fontSize: '15px',
      lineHeight: '1.6'
    }}>
      <h2 style={{ marginTop: 0 }}>About This Data</h2>
      <p>
        This visualization explores the relationship between economic development (GDP per capita)
        and carbon emissions (CO₂ per capita) across countries and regions from 1800 to 2022.
      </p>

      <h3 style={{ marginTop: '20px' }}>Source and Citation</h3>
      <ul style={{ paddingLeft: '20px' }}>
        <li>
          <strong>Global Carbon Budget (2024)</strong> – 
          <a href="https://www.globalcarbonproject.org/" target="_blank" rel="noopener noreferrer"> Visit site</a>
        </li>
        <li>
          <strong>Population based on various sources (2024)</strong> - 
          <a href="https://ourworldindata.org/population-sources" target="_blank" rel="noopener noreferrer"> Link</a>
        </li>
        <li>
          <strong>Bolt and van Zanden – Maddison Project Database (2023)</strong> – 
          <a href="https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2023" target="_blank" rel="noopener noreferrer"> Link</a>
        </li>
        
        <li>
          <strong>Gapminder – Population v7 (2022)</strong> – 
          <a href="https://www.gapminder.org/data/documentation/gd003/" target="_blank" rel="noopener noreferrer"> Data Explorer</a>
        </li>
      
        <li>
          <strong>Gapminder – Systema Globalis (2022)</strong> – 
          <a href="https://github.com/open-numbers/ddf--gapminder--systema_globalis" target="_blank" rel="noopener noreferrer"> GitHub Repository</a>
        </li>
        <li>
          <strong>Our World in Data</strong> – Major data processing and curation by OWID – 
          <a href="https://ourworldindata.org" target="_blank" rel="noopener noreferrer"> Explore</a>
        </li>
      </ul>

      <p style={{ marginTop: '16px' }}>
        <strong>Download CSV:</strong> &nbsp;
        <a
          href="https://ourworldindata.org/grapher/consumption-co2-per-capita-vs-gdppc.csv?v=1&csvType=full&useColumnShortNames=true"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#007bff' }}
        >
          View Full Dataset
        </a>
      </p>

      <button
        onClick={() => setShowAbout(false)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '14px',
          background: 'transparent',
          border: 'none',
          fontSize: '22px',
          cursor: 'pointer'
        }}
      >
        ×
      </button>
    </div>
  </div>
)}



    </div>
    
  );
};

export default Home;

