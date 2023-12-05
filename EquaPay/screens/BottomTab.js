import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacityr } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';


// // Screens
import Login from './Login';
import HomePage from './HomePage';
import UserAccount from './UserAccount';
import FriendsPage from './FriendsPage';
import AddBillsPage from './AddBillsPage';
import NotificationPage from './NotificationPage';


const Tab = createBottomTabNavigator();

const BottomTab = () =>{
  return(
    <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor:"#44AFFB",
          tabBarInactiveTintColor: "#FFFBFB",
          labelStyle: {fontSize: 10 },
          tabBarStyle:{
            backgroundColor:"#225982",
            height: 85,
          }
        }}>

        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="home" color={color} size={30} />)}} name={"Home"} component={HomePage}/>
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="people" color={color} size={30} />)}} name={"Friends"} component={FriendsPage} />
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="add-circle" color={color} size={30} />)}} name={"Add Bills"} component={AddBillsPage}/>
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="notifications" color={color} size={30} />)}} name={"Notification"} component={NotificationPage}/>
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="person-circle" color={color} size={30} />)}} name={"Account"} component={UserAccount}/>
      </Tab.Navigator>
  )
}
export default BottomTab;