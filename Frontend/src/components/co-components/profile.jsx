
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: '',
    name: '',
    bio: '',
    gender: '',
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [friends, setFriends] = useState([]);
  const [showFriends, setShowFriends] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchFriends();
  }, [currentUser]);

  const fetchProfile = async () => {
    if (currentUser?.uid) {
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfileData(docSnap.data());
      }
    }
  };

  const fetchFriends = async () => {
    if (currentUser) {
      const q = query(
        collection(db, 'friends'),
        where('userId', '==', currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      setFriends(querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out');
    }
  };

  const checkUsernameUnique = async (username) => {
    const q = query(
      collection(db, 'users'),
      where('username', '==', username)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty || 
           (querySnapshot.docs.length === 1 && 
            querySnapshot.docs[0].id === currentUser.uid);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!profileData.username.trim()) {
        setError('Username is required');
        return;
      }

      const isUnique = await checkUsernameUnique(profileData.username);
      if (!isUnique) {
        setError('Username already exists');
        return;
      }

      await setDoc(doc(db, 'users', currentUser.uid), {
        ...profileData,
        email: currentUser.email
      });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setError('');
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2>Profile</h2>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      {message && <div style={{ color: 'green', marginBottom: '10px' }}>{message}</div>}
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label>Username</label>
            <input
              type="text"
              value={profileData.username}
              onChange={(e) => setProfileData({...profileData, username: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
              required
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Name</label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
              style={{ width: '100%', padding: '8px', minHeight: '100px' }}
            />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label>Gender</label>
            <select
              value={profileData.gender}
              onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
              style={{ width: '100%', padding: '8px' }}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            Save Profile
          </button>
          <button type="button" onClick={() => setIsEditing(false)} style={{ width: '100%', padding: '10px' }}>
            Cancel
          </button>
        </form>
      ) : (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <p><strong>Username:</strong> {profileData.username}</p>
            <p><strong>Name:</strong> {profileData.name}</p>
            <p><strong>Bio:</strong> {profileData.bio}</p>
            <p><strong>Gender:</strong> {profileData.gender}</p>
          </div>
          <button onClick={() => setIsEditing(true)} style={{ width: '100%', padding: '10px', marginBottom: '10px' }}>
            Edit Profile
          </button>
          <button onClick={handleLogout} style={{ width: '100%', padding: '10px', backgroundColor: '#dc3545', color: 'white' }}>
            Logout
          </button>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => setShowFriends(!showFriends)} 
          style={{ 
            width: '100%', 
            padding: '10px', 
            marginBottom: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          {showFriends ? 'Hide Friends' : 'Show Friends'}
        </button>
        {showFriends && friends.map(friend => (
          <div key={friend.id} style={{
            padding: '10px',
            border: '1px solid #ccc',
            marginBottom: '10px',
            borderRadius: '5px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {friend.friendName}
              <button 
                onClick={async () => {
                  // Remove friend relationship for both users
                  const q1 = query(
                    collection(db, 'friends'),
                    where('userId', '==', currentUser.uid),
                    where('friendId', '==', friend.friendId)
                  );
                  const q2 = query(
                    collection(db, 'friends'),
                    where('userId', '==', friend.friendId),
                    where('friendId', '==', currentUser.uid)
                  );
                  
                  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
                  
                  const batch = writeBatch(db);
                  snap1.docs.forEach(doc => batch.delete(doc.ref));
                  snap2.docs.forEach(doc => batch.delete(doc.ref));
                  await batch.commit();
                }}
                style={{ 
                  padding: '5px 10px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
