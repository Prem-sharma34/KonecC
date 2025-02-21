
import React from 'react';

function NotificationBadge({ count }) {
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
      minWidth: '20px',
      textAlign: 'center'
    }}>
      {count}
    </span>
  );
}

export default NotificationBadge;
