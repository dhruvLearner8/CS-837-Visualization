import React, { useState } from 'react';

const CountrySelector = ({ data, selectedCountries, toggleCountry, close }) => {
  const [search, setSearch] = useState('');

  const allCountries = Array.from(
    new Set(data.map(d => d.entity))
  ).sort((a, b) => a.localeCompare(b));

  const filtered = allCountries.filter(country =>
    country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '300px',
      height: '100%',
      backgroundColor: '#fff',
      borderLeft: '1px solid #ccc',
      boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
      padding: '20px',
      zIndex: 999,
      overflowY: 'scroll'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Select Countries</h3>
        <button onClick={close} style={{ fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>×</button>
      </div>

      <input
        type="text"
        placeholder="Search country..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          marginBottom: '12px',
          borderRadius: '4px',
          border: '1px solid #ccc'
        }}
      />

      <div>
        {filtered.map(country => {
          const selected = selectedCountries.some(c => c.entity === country);
          return (
            <label key={country} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => {
                  toggleCountry({ entity: country });
                }}
                style={{ marginRight: '8px' }}
              />
              {country}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default CountrySelector;
