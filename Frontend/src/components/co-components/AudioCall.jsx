import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc, query, where } from 'firebase/firestore';

function AudioCall({ partner, onEndCall }) {
  const { currentUser } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const localAudioRef = useRef();
  const remoteAudioRef = useRef();
  const peerConnectionRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    let pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    });
    peerConnectionRef.current = pc;

    pc.ontrack = (event) => {
      remoteAudioRef.current.srcObject = event.streams[0];
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(collection(db, 'calls'), {
          type: 'candidate',
          candidate: event.candidate.toJSON(),
          from: currentUser.uid,
          to: partner
        });
      }
    };

    // Listen for remote signals
    const unsubscribe = onSnapshot(
      query(collection(db, 'calls'), 
        where('to', '==', currentUser.uid)),
      async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await addDoc(collection(db, 'calls'), {
                type: 'answer',
                answer,
                from: currentUser.uid,
                to: partner
              });
            } else if (data.type === 'answer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
            } else if (data.type === 'candidate') {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
            await deleteDoc(change.doc.ref);
          }
        });
      }
    );

    // Add connection state monitoring
    pc.onconnectionstatechange = (event) => {
      switch(pc.connectionState) {
        case "disconnected":
        case "failed":
          onEndCall();
          break;
        case "closed":
          onEndCall();
          break;
      }
    };


    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        localAudioRef.current.srcObject = stream;
      });

    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      pc.close();
    };
  }, []);

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    const stream = localAudioRef.current.srcObject;
    stream.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMuted(!isMuted);
  };

  const toggleSpeaker = () => {
    remoteAudioRef.current.setSinkId(isSpeaker ? 'default' : 'speaker')
      .then(() => setIsSpeaker(!isSpeaker));
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: 70, 
      left: 0, 
      right: 0,
      background: '#fff',
      padding: '20px',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />

      <div style={{ marginBottom: '20px' }}>
        Call Duration: {formatDuration(callDuration)}
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={toggleMute} style={{ padding: '10px 20px' }}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        <button onClick={toggleSpeaker} style={{ padding: '10px 20px' }}>
          {isSpeaker ? 'Speaker Off' : 'Speaker On'}
        </button>
        <button 
          onClick={onEndCall} 
          style={{ padding: '10px 20px', background: 'red', color: 'white' }}
        >
          End Call
        </button>
      </div>
    </div>
  );
}

export default AudioCall;