import React from 'react';

export default function Card({ children, title }) {
  return (
    <div className="bg-white rounded shadow p-4">
      {title && <div className="font-semibold mb-2">{title}</div>}
      <div>{children}</div>
    </div>
  );
}
