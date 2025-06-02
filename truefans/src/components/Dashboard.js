import React from 'react';
import { useNavigate } from 'react-router-dom';

const brands = [
  { id: 1, name: 'Taco Bros' },
  { id: 2, name: 'Burger Queens' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', border: '1px solid #ccc', padding: '2rem', borderRadius: 8 }}>
      <h2>Welcome, [Owner Name]!</h2>
      <h3>Your Brands:</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {brands.map(brand => (
          <li key={brand.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span>[{brand.name}]</span>
            <button onClick={() => navigate(`/brand/${brand.id}`)}>Manage Brand</button>
          </li>
        ))}
      </ul>
      <button style={{ marginTop: 16 }}>[Add New Brand]</button>
    </div>
  );
} 