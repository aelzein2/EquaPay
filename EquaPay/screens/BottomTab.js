import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacityr } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';


// // Screens
import Login from './Login';
import HomePage from './HomePage';


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

        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="home" color={color} size={size} />)}} name={"Home"} component={HomePage}/>
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="people" color={color} size={size} />)}} name={"Friends"} component={HomePage} Ionicons={'home-outline'} />
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="add-circle" color={color} size={size} />)}} name={"Add Bills"} component={HomePage} Ionicons={'home-outline'} />
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="notifications" color={color} size={size} />)}} name={"Notification"} component={HomePage} Ionicons={'home-outline'} />
        <Tab.Screen options={{headerShown: false, tabBarIcon: ({ color, size }) => (<Ionicons name="person-circle" color={color} size={size} />)}} name={"Account"} component={HomePage} Ionicons={'home-outline'} />
        {/* <Tab.Screen options={{headerShown: false,}} name={logIn} component={Login}/> */}
        {/* <Tab.Screen name={detailsName} component={DetailsScreen} />
        <Tab.Screen name={settingsName} component={SettingsScreen} /> */}

      </Tab.Navigator>
  )
}
export default BottomTab;