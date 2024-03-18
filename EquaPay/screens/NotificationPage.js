import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from '../firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pubSub } from './PubSub'; // Import PubSub

const NotificationsPage = () => {
  const [userEmail, setUserEmail] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [lastClearedTime, setLastClearedTime] = useState(0); // Initialize to 0 to handle cases where there's no value in AsyncStorage
  const navigation = useNavigation();

  useEffect(() => {
    // Load the last cleared time
    const loadLastClearedTime = async () => {
      const time = await AsyncStorage.getItem('lastClearedTime');
      setLastClearedTime(parseInt(time) || 0); // Default to 0 if there's no value
    };

    loadLastClearedTime();

    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserEmail(docSnap.data().email);
        }
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (userEmail) {
      const billsCreatedRef = collection(firestore, "billsCreated");
      
      const unsubscribe = onSnapshot(billsCreatedRef, (querySnapshot) => {
        const changes = querySnapshot.docChanges();
        if (initializing) {
          setInitializing(false);
          return;
        }
  
        changes.forEach((change) => {
          if (change.type === "added") {
            const data = change.doc.data();
            const billCreatedTime = data.billCreated?.seconds * 1000 || 0;
          
            if (billCreatedTime > lastClearedTime) {
              const notificationId = change.doc.id; // Use the document ID as a unique identifier
              const notificationTimeStamp = new Date();
              
              const notificationMessage = data.billOwner === userEmail ? 
                `You created a bill: ${data.billName}` : 
                data.participants?.some(participant => participant.id === userEmail) ? 
                `You have been added to a bill: ${data.billName}` : null;
                console.log()
              if (notificationMessage && !notifications.find(n => n.id === notificationId)) {
                setNotifications(prev => [...prev, { id: notificationId, message: notificationMessage, timestamp: notificationTimeStamp}]);
              }
            }
          }
        });
      });
  
      return () => unsubscribe();
    }
  }, [userEmail, initializing, lastClearedTime]);
  
  useEffect(() => {
    // Whenever `notifications` changes, publish the new count
    pubSub.publish('notificationCount', notifications.length);
  }, [notifications]);

  const clearNotifications = async () => {
    const currentTime = Date.now();
    await AsyncStorage.setItem('lastClearedTime', currentTime.toString());
    setLastClearedTime(currentTime);
    setNotifications([]);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${formattedDate} at ${formattedTime}`;
  };
  

  const handleNotificationPress = () => {
    navigation.navigate("View Bills");
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <TouchableOpacity style={styles.clearButton} onPress={clearNotifications}>
        <Text style={styles.clearButtonText}>Clear</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scrollView}>
  {notifications.length > 0 ? notifications.map((notification, index) => (
   <TouchableOpacity key={notification.id} style={styles.notificationContainer} onPress={handleNotificationPress}>
   <Text style={styles.notificationText}>{notification.message}</Text>
   <Text style={styles.notificationTimestamp}>{formatTimestamp(notification.timestamp)}</Text>
 </TouchableOpacity>
 
  )) : <Text style={styles.noNotificationsText}>You have no new notifications</Text>}
</ScrollView>

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#153A59", 
    paddingTop: 50, 
  },
  scrollView: {
    marginTop: 10,
  },
  title:{
    color:"white",
    fontSize: 30,
    fontWeight: "600",
    // move it to the right a bit
    marginLeft: 22,
    paddingTop: 30,
  },
  notificationContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10, // Rounded corners for notifications
    marginHorizontal: 20,
    marginTop: 10,
    shadowOpacity: 0.1, // Added shadow for a nicer look
    shadowRadius: 5,
    shadowOffset: { height: 3, width: 0 },
  },
  notificationText: {
    fontSize: 16,
  },
  clearButton: {
    margin: 20,
    backgroundColor: "#40a7c3",
    padding: 10,
    borderRadius: 5,
    alignSelf: "flex-end", // Aligns the button to the right of its container
    width: 100, // Ensures the button is not too wide
    alignItems: "center", // Centers the text within the button
}
,
  clearButtonText: {
    color: "white",
    fontSize: 16,
    
  },
  noNotificationsText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
  notificationTimestamp: {
    fontSize: 12, 
    color: '#A9A9A9', 
    marginTop: 4, 
  },
});

export default NotificationsPage;
