import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { auth, firestore } from '../firebase';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pubSub } from './PubSub'; // Import PubSub
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
        <Text style={[styles.clearButtonText]}>Clear All</Text>
      </TouchableOpacity>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {notifications.length > 0 ? notifications.map((notification, index) => (
        <TouchableOpacity key={notification.id} style={[styles.notificationContainer]} onPress={handleNotificationPress}>
        <MaterialCommunityIcons name="bell-check-outline" size={30} color="#EDEDED" />
        <View style={[styles.notificationTextContainer]}>
          <Text style={[styles.notificationText]}>{notification.message}</Text>
          <Text style={styles.notificationTimestamp}>{formatTimestamp(notification.timestamp)}</Text>
        </View>
        
      </TouchableOpacity>
      
        )) : <Text style={styles.noNotificationsText}>You have no new notifications</Text>}
      </ScrollView>

    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor:'#153A59',
    flex: 1,
    paddingTop:"20%",
    paddingHorizontal:'5%',
    gap: 12
  },

  scrollView: {
    borderTopWidth:1,
    borderTopColor:'#85E5CA'

  },

  title:{
    color:"white",
    fontSize: 30,
    fontWeight: "600",
  },
  notificationContainer: {
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
    padding: 20,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor:'#85E5CA'
  },

  notificationTextContainer:{
    flex: 1,
    gap:5
  },
  
  notificationText: {
    color:'#EDEDED',
    fontSize: 16,
    fontWeight: 600
  },

  clearButton: {
    backgroundColor: "#366B7C",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-end", // Aligns the button to the right of its container
    alignItems: "center", // Centers the text within the button
},

  clearButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight:600
  },
  
  noNotificationsText: {
    color: "#EDEDED",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  notificationTimestamp: {
    fontSize: 12, 
    color: '#85E5CA', 
  },
});

export default NotificationsPage;
