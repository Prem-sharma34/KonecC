
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';

function Notification() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        where('read', '==', false)
      );

      return onSnapshot(q, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });
    }
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          No new notifications
        </div>
      ) : (
        notifications.map(notification => (
          <div
            key={notification.id}
            style={{
              padding: '15px',
              border: '1px solid #ccc',
              marginBottom: '10px',
              borderRadius: '5px'
            }}
          >
            <div style={{ marginBottom: '10px' }}>{notification.message}</div>
            <button
              onClick={() => markAsRead(notification.id)}
              style={{ padding: '5px 10px' }}
            >
              Mark as Read
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Notification;
