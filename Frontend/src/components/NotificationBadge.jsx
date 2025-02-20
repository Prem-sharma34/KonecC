
import React from 'react';

function NotificationBadge({ count }) {
  if (!count) return null;
  
  return (
    <span style={{
      position: 'absolute',
      top: '-8px',
      right: '-8px',
      background: 'red',
      color: 'white',
      borderRadius: '50%',
      padding: '2px 6px',
      fontSize: '12px',
      minWidth: '16px',
      textAlign: 'center'
    }}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

export default NotificationBadge;
