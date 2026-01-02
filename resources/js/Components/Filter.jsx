import React from 'react';

export default function Filter({ children, onApply }) {
  return (
    <div className="bg-white p-3 rounded shadow mb-4 flex gap-3 items-center">
      {children}
      <button onClick={onApply} className="ml-auto bg-blue-400 text-white px-3 py-1 rounded">Appliquer</button>
    </div>
  );
}
