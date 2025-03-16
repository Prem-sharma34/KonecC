
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

function CallHistory() {
  const { currentUser } = useAuth();
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, 'calls'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('timestamp', 'desc')
      );

      return onSnapshot(q, (snapshot) => {
        setCalls(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });
    }
  }, [currentUser]);

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h3>Call History</h3>
      {calls.map(call => (
        <div key={call.id} style={{ 
          padding: '10px', 
          border: '1px solid #ccc',
          marginBottom: '10px',
          borderRadius: '5px'
        }}>
          <div>Partner: {call.partnerName}</div>
          <div>Duration: {call.duration}s</div>
          <div>Date: {new Date(call.timestamp.toDate()).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}

export default CallHistory;
