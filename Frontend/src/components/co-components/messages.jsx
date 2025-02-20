
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import EmojiPicker from 'emoji-picker-react';
import { collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';

function Messages() {
  const { currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  useEffect(() => {
    if (selectedFriend) {
      const q = query(
        collection(db, 'messages'),
        where('users', 'array-contains', currentUser.uid),
        where('friendId', '==', selectedFriend.friendId),
        orderBy('timestamp')
      );

      return onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      });
    }
  }, [selectedFriend, currentUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() && selectedFriend) {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        from: currentUser.uid,
        to: selectedFriend.friendId,
        users: [currentUser.uid, selectedFriend.friendId],
        timestamp: serverTimestamp(),
        read: false
      });
      setNewMessage('');
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
      <div style={{ width: '300px', borderRight: '1px solid #ccc', padding: '20px' }}>
        <h2>Friends</h2>
        {friends.map(friend => (
          <div
            key={friend.id}
            onClick={() => setSelectedFriend(friend)}
            style={{
              padding: '10px',
              cursor: 'pointer',
              background: selectedFriend?.id === friend.id ? '#e9ecef' : 'white'
            }}
          >
            {friend.friendName}
          </div>
        ))}
      </div>
      
      <div style={{ flex: 1, padding: '20px' }}>
        {selectedFriend ? (
          <>
            <h2>Chat with {selectedFriend.friendName}</h2>
            <div style={{ 
              height: 'calc(100vh - 200px)', 
              overflowY: 'auto',
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '20px'
            }}>
              {messages.map(message => (
                <div
                  key={message.id}
                  style={{
                    textAlign: message.from === currentUser.uid ? 'right' : 'left',
                    margin: '5px'
                  }}
                >
                  <span style={{
                    background: message.from === currentUser.uid ? '#007bff' : '#e9ecef',
                    color: message.from === currentUser.uid ? 'white' : 'black',
                    padding: '5px 10px',
                    borderRadius: '10px',
                    display: 'inline-block'
                  }}>
                    {message.text}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ position: 'relative' }}>
              {showEmojiPicker && (
                <div style={{ position: 'absolute', bottom: '100%', right: '0' }}>
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setNewMessage(prev => prev + emojiObject.emoji);
                      setShowEmojiPicker(false);
                    }}
                  />
                </div>
              )}
              <form onSubmit={sendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ flex: 1, padding: '8px' }}
                  placeholder="Type a message..."
                />
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{ padding: '8px 15px' }}
                >
                  😊
                </button>
                <button type="submit" style={{ padding: '8px 20px' }}>Send</button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            Select a friend to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Messages;
