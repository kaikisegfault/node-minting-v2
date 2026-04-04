import React from 'react';

const Grid = ({ header, rows }) => {
  return (
    <div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
      <h3 className='gr-h' style={{ marginBottom: '10px' }}>{header}</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr>
            {rows[0].map((cell, index) => (
              <th className='gr-content' key={index} style={{ border: '1px solid rgba(51,51,51,0.5)', padding: '8px' }}>{cell}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex} style={rowIndex === rows.length - 2 ? { fontWeight: 'bold' } : {}}>
              {row.map((cell, cellIndex) => (
                <td className='gr-content'key={cellIndex} style={{ border: '1px solid rgba(51,51,51,0.5)', padding: '8px' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Grid;