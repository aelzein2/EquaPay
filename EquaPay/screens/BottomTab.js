
import { StyleSheet, Text, View, TouchableOpacityr } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import React, { useState, useEffect} from "react";



// // Screens
import Login from './Login';
import ViewBills from './ViewBills';
import UserAccount from './UserAccount';
import FriendsPage from './FriendsPage';
import AddBillsPage from './AddBillsPage';
import NotificationPage from './NotificationPage';
import { pubSub } from './PubSub'; // Import PubSub


const Tab = createBottomTabNavigator();

const BottomTab = () =>{
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const handleNotificationUpdate = (count) => {
      setNotificationCount(count);
    };

    pubSub.subscribe('notificationCount', handleNotificationUpdate);

    return () => {
      // Cleanup: Remove the subscription when the component unmounts
      pubSub.events['notificationCount'] = pubSub.events['notificationCount'].filter(cb => cb !== handleNotificationUpdate);
    };
  }, []);
  
  
  
  return(
    <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor:"#85E5CA",
          tabBarInactiveTintColor: "#FFFBFB",
          labelStyle: {fontSize: 10 },
          tabBarStyle:{
            backgroundColor:"#225982",
            height: 85,
          }
        }}>

        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="receipt" color={color} size={30} />)}} name={"View Bills"} component={ViewBills}/>
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="people" color={color} size={30} />)}} name={"Friends"} component={FriendsPage} />
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="add-circle" color={color} size={30} />)}} name={"Add Bills"} component={AddBillsPage}/>
        <Tab.Screen options={{headerShown: false, tabBarBadge: notificationCount > 0 ? notificationCount : null, tabBarIcon: ({ color, size }) => (<Ionicons name="notifications" color={color} size={30} />)}} name={"Notifications"} component={NotificationPage}/>
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="person-circle" color={color} size={30} />)}} name={"Account"} component={UserAccount}/>
      </Tab.Navigator>
  )
}
export default BottomTab;