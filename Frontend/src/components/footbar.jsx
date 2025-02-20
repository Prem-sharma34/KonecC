import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import NotificationBadge from "./NotificationBadge";
import "../css/footbar.css";

function Footbar() {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      // Listen for notifications
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        where('read', '==', false)
      );

      const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        setNotificationCount(snapshot.docs.length);
      });

      // Listen for unread messages
      const messagesQuery = query(
        collection(db, 'messages'),
        where('to', '==', currentUser.uid),
        where('read', '==', false)
      );

      const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        setMessageCount(snapshot.docs.length);
      });

      return () => {
        unsubscribeNotifications();
        unsubscribeMessages();
      };
    }
  }, [currentUser]);

  return (
    <div className="footbar">
      <Link to="/search">Search</Link>
      <Link to="/messages">
        Messages
        {messageCount > 0 && <NotificationBadge count={messageCount} />}
      </Link>
      <Link to="/random">Random</Link>
      <Link to="/notifications">
        Notifications
        {notificationCount > 0 && <NotificationBadge count={notificationCount} />}
      </Link>
      <Link to="/profile">Profile</Link>
    </div>
  );
}

export default Footbar;