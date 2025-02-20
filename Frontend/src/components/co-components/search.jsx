
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

function Search() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const q = query(
        collection(db, 'users'),
        where('username', '==', searchTerm)
      );
      
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUser.uid);
      
      setSearchResults(results);
      if (results.length === 0) {
        setError('No users found');
      } else {
        setError('');
      }
    } catch (err) {
      setError('Error searching for users');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2>Search Users</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by username"
            style={{ flex: 1, padding: '8px' }}
          />
          <button type="submit" style={{ padding: '8px 20px' }}>
            Search
          </button>
        </div>
      </form>
      <div>
        {searchResults.map(user => (
          <div
            key={user.id}
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              marginBottom: '10px',
              borderRadius: '5px'
            }}
          >
            <div><strong>{user.username}</strong></div>
            <div style={{ color: '#666' }}>{user.bio}</div>
            <button
              style={{
                marginTop: '10px',
                padding: '5px 10px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Add Friend
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;
