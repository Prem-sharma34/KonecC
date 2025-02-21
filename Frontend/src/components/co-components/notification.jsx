
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

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

  const handleFriendRequest = async (notification, accept) => {
    try {
      // Get request details
      const requestRef = doc(db, 'friendRequests', notification.requestId);
      const request = await getDoc(requestRef);
      
      if (accept) {
        // Add to friends collection for both users
        const senderRef = doc(db, 'users', request.data().from);
        const senderDoc = await getDoc(senderRef);
        
        await addDoc(collection(db, 'friends'), {
          userId: currentUser.uid,
          friendId: request.data().from,
          friendName: senderDoc.data().username,
          timestamp: serverTimestamp()
        });

        await addDoc(collection(db, 'friends'), {
          userId: request.data().from,
          friendId: currentUser.uid,
          friendName: currentUser.email,
          timestamp: serverTimestamp()
        });

        // Notify sender that request was accepted
        await addDoc(collection(db, 'notifications'), {
          userId: request.data().from,
          message: `${currentUser.email} accepted your friend request`,
          type: 'friendRequestAccepted',
          read: false,
          timestamp: serverTimestamp()
        });
      }

      // Delete the friend request
      await deleteDoc(requestRef);
      
      // Mark notification as read
      await updateDoc(doc(db, 'notifications', notification.id), {
        read: true
      });
    } catch (error) {
      console.error("Error handling friend request:", error);
    }
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
            {notification.type === 'friendRequest' ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleFriendRequest(notification, true)}
                  style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white' }}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleFriendRequest(notification, false)}
                  style={{ padding: '5px 10px', backgroundColor: '#f44336', color: 'white' }}
                >
                  Decline
                </button>
              </div>
            ) : (
              <button
                onClick={() => updateDoc(doc(db, 'notifications', notification.id), { read: true })}
                style={{ padding: '5px 10px' }}
              >
                Mark as Read
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Notification;
