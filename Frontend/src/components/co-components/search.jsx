
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

function Search() {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

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
      } catch (err) {
        setError('Error searching for users');
      }
    }
  };

  const sendFriendRequest = async (userId, username) => {
    try {
      await addDoc(collection(db, 'friendRequests'), {
        from: currentUser.uid,
        to: userId,
        status: 'pending',
        timestamp: new Date()
      });

      await addDoc(collection(db, 'notifications'), {
        userId,
        message: `${currentUser.email} sent you a friend request`,
        type: 'friendRequest',
        read: false,
        timestamp: new Date()
      });
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

      {searchResults.map(user => (
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
            onClick={() => sendFriendRequest(user.id, user.username)}
            style={{ padding: '5px 10px' }}
          >
            Add Friend
          </button>
        </div>
      ))}
    </div>
  );
}

export default Search;
