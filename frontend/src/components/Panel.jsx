import React from 'react';

export default function Panel({ children, title, accentHex, className = '', style = {} }) {
  return (
    <div
      className={`relative flex flex-col h-full rounded overflow-hidden ${className}`}
      style={{
        border: `1px solid ${accentHex}33`,
        background: 'linear-gradient(135deg, rgba(10,20,30,0.95) 0%, rgba(5,10,14,0.98) 100%)',
        boxShadow: `inset 0 0 30px ${accentHex}08, 0 0 0 1px ${accentHex}22`,
        ...style,
      }}
    >
      {/* Panel header */}
      {title && (
        <div
          className="px-3 py-1.5 text-xs tracking-widest font-mono flex items-center justify-between shrink-0"
          style={{
            color: accentHex + 'cc',
            borderBottom: `1px solid ${accentHex}22`,
            background: `${accentHex}08`,
          }}
        >
          <span>{title}</span>
          <span style={{ color: accentHex + '55' }}>■</span>
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
