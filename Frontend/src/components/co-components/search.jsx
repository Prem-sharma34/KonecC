
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

function Search() {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const searchUsers = async (e) => {
    e.preventDefault();
    if (username.trim()) {
      try {
        const q = query(
          collection(db, 'users'),
          where('username', '==', username.trim())
        );
        const querySnapshot = await getDocs(q);
        setSearchResults(querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
        setSelectedUser(null);
      } catch (err) {
        setError('Error searching for users');
      }
    }
  };

  const viewProfile = (user) => {
    setSelectedUser(user);
  };

  const sendFriendRequest = async (userId, username) => {
    try {
      // Check if already friends
      const friendsCheck = await getDocs(
        query(
          collection(db, 'friends'),
          where('userId', '==', currentUser.uid),
          where('friendId', '==', userId)
        )
      );

      if (!friendsCheck.empty) {
        setError('Already friends with this user');
        return;
      }

      // Check if friend request already exists
      const existingRequest = await getDocs(
        query(
          collection(db, 'friendRequests'),
          where('from', '==', currentUser.uid),
          where('to', '==', userId),
          where('status', '==', 'pending')
        )
      );

      if (!existingRequest.empty) {
        // Cancel the request
        const requestDoc = existingRequest.docs[0];
        await deleteDoc(doc(db, 'friendRequests', requestDoc.id));
        
        // Delete the notification
        const notificationQuery = await getDocs(
          query(
            collection(db, 'notifications'),
            where('type', '==', 'friendRequest'),
            where('userId', '==', userId)
          )
        );
        
        if (!notificationQuery.empty) {
          await deleteDoc(doc(db, 'notifications', notificationQuery.docs[0].id));
        }
        
        setError('Friend request cancelled');
        return;
      }

      await addDoc(collection(db, 'friendRequests'), {
        from: currentUser.uid,
        to: userId,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      const requestDoc = await addDoc(collection(db, 'friendRequests'), {
        from: currentUser.uid,
        to: userId,
        status: 'pending',
        timestamp: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        userId,
        message: `${currentUser.email} sent you a friend request`,
        type: 'friendRequest',
        requestId: requestDoc.id,
        read: false,
        timestamp: serverTimestamp()
      });

      setError('');
    } catch (err) {
      setError('Error sending friend request');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2>Search Users</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <form onSubmit={searchUsers} style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Search
        </button>
      </form>

      {selectedUser ? (
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
          <h3>User Profile</h3>
          <p><strong>Username:</strong> {selectedUser.username}</p>
          <p><strong>Name:</strong> {selectedUser.name}</p>
          <p><strong>Bio:</strong> {selectedUser.bio}</p>
          <p><strong>Gender:</strong> {selectedUser.gender}</p>
          <button
            onClick={() => sendFriendRequest(selectedUser.id, selectedUser.username)}
            style={{ width: '100%', padding: '10px', marginTop: '10px' }}
          >
            Send Friend Request
          </button>
          <button
            onClick={() => setSelectedUser(null)}
            style={{ width: '100%', padding: '10px', marginTop: '10px' }}
          >
            Back to Search
          </button>
        </div>
      ) : (
        searchResults.map(user => (
          <div
            key={user.id}
            style={{
              padding: '15px',
              border: '1px solid #ccc',
              marginBottom: '10px',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>{user.username}</div>
            <button
              onClick={() => viewProfile(user)}
              style={{ padding: '5px 10px' }}
            >
              View Profile
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Search;
