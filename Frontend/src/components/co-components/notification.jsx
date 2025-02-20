import React from 'react';

function Notification() {
  return (
    <div>
      <h1>Notification Works</h1>

          <div className="notification-panel" style={{ maxHeight: '300px',width: '1300px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} className="notification-item" style={{ marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
            Notification {i + 1}
          </div>
        ))}
      </div>
    

    </div>
  );
}

export default Notification;
