import React from 'react';

export default function Table({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-4 py-2 border-b">{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={i % 2 ? 'bg-gray-50' : ''}>
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-2 border-b">{c.render ? c.render(row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
