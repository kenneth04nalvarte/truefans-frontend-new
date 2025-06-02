import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const brandData = {
  1: {
    name: 'Taco Bros',
    locations: [
      { id: 1, name: 'Main St.' },
      { id: 2, name: '2nd Ave.' },
    ],
    passes: [
      { id: 1, name: 'Empanada Pass' },
    ],
  },
  2: {
    name: 'Burger Queens',
    locations: [],
    passes: [],
  },
};

const tabs = ['Locations', 'Digital Passes', 'Settings'];

export default function BrandManager() {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Locations');
  const brand = brandData[brandId] || { name: '', locations: [], passes: [] };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', border: '1px solid #ccc', padding: '2rem', borderRadius: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{brand.name}</h2>
        <div>
          <button onClick={() => navigate('/dashboard')}>Back</button>
          <span style={{ marginLeft: 16 }}>[Profile Icon]</span>
        </div>
      </div>
      <div style={{ margin: '1rem 0' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ marginRight: 8, fontWeight: tab === t ? 'bold' : 'normal' }}>{t}</button>
        ))}
      </div>
      {tab === 'Locations' && (
        <div>
          <h3>Locations:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {brand.locations.map(loc => (
              <li key={loc.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span>[{loc.name}]</span>
                <button style={{ marginLeft: 8 }}>Edit</button>
                <button style={{ marginLeft: 8 }}>Remove</button>
              </li>
            ))}
          </ul>
          <button>[Add New Location]</button>
        </div>
      )}
      {tab === 'Digital Passes' && (
        <div>
          <h3>Digital Passes:</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {brand.passes.map(pass => (
              <li key={pass.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                <span>[{pass.name}]</span>
                <button style={{ marginLeft: 8 }}>Edit</button>
                <button style={{ marginLeft: 8 }}>Deactivate</button>
                <button style={{ marginLeft: 8 }}>View</button>
              </li>
            ))}
          </ul>
          <button>[Create New Pass]</button>
        </div>
      )}
      {tab === 'Settings' && (
        <div>
          <h3>Settings</h3>
          <p>Settings content goes here.</p>
        </div>
      )}
    </div>
  );
} 