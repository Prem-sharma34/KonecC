
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';

function Profile() {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (currentUser?.uid) {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUsername(data.username || '');
          setBio(data.bio || '');
          setGender(data.gender || '');
        }
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        username,
        bio,
        gender,
        email: currentUser.email
      });
      setMessage('Profile updated successfully!');
      setError('');
    } catch (err) {
      setError('Failed to update profile');
      setMessage('');
    }
  };

  const [friends, setFriends] = useState([]);

useEffect(() => {
  if (currentUser) {
    const q = query(
      collection(db, 'friends'),
      where('userId', '==', currentUser.uid)
    );

    return onSnapshot(q, (snapshot) => {
      setFriends(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    });
  }
}, [currentUser]);

return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3>Friends List</h3>
        {friends.map(friend => (
          <div key={friend.id} style={{
            padding: '10px',
            border: '1px solid #ccc',
            marginBottom: '10px',
            borderRadius: '5px'
          }}>
            {friend.friendName}
          </div>
        ))}
      </div>
      <h2>Profile</h2>
      {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ width: '100%', padding: '8px', minHeight: '100px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;
