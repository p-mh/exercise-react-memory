import React from 'react';

import './card.css';

export default function Card({ img, done, check, turn }) {
  const opacity = done ? { opacity: 1 } : !turn ? { opacity: 0 } : null;
  return (
    <div className="card" onClick={check}>
      <img src={img} alt="" style={opacity} />
    </div>
  );
}
