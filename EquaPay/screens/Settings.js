import { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Divider } from '@rneui/themed';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { auth, firestore } from '../firebase'
import { useNavigation } from '@react-navigation/native';
import RowChevron from "../components/RowChevron";
import { AntDesign, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
const { width } = Dimensions.get('window');
export default function Setting(){

  const navigation = useNavigation();

// function that handles user log out. session ends
// ** Need to add some async storage stuff
  const handleLogout = () => {
      Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          {
          /* User given two options to confirm logging out */
            text: "No",
            onPress: () => console.log("Logout Cancelled"),
            style: "cancel"
          },
          { 
            text: "Yes", onPress: () => {
              console.log("Logging out");
              auth.signOut()
                .then(() => {
                  console.log("User has signed out");
                  navigation.navigate("LoadingScreen")
                })
                .catch((error) => {
                  console.log("An error occurred while signing out");
                });
            }
          }
        ],
        { cancelable: false }
      );
  }

  const backToPreviousScreen = () => {
    navigation.navigate("Account");
  }

  const handleChangePassword = () =>{
    navigation.navigate("Reauthentication", { id: 1 })
  }

  const handleChangeEmail = () =>{
    navigation.navigate("Reauthentication", { id: 1 })
  }

  const settingOptions =[
    {id:'0', name: 'Change Password', icon:<MaterialIcons name="lock-outline" size={30} color="#EDEDED" />, onPress: handleChangePassword},
    {id:'1', name: 'Change Email', icon: <MaterialCommunityIcons name="email-edit-outline" size={30} color="#EDEDED" />, onPress: handleChangeEmail},
  ]


  return(
      // <View style={styles.container}>
      // <Text style = {styles.screenTitle} >Settings</Text>
         
      // </View>

    <KeyboardAwareScrollView style={{backgroundColor:'#153A59'}}>
      <View style={[styles.container]}>
        
      <TouchableOpacity onPress={backToPreviousScreen} style={[styles.backButton]}>
        <AntDesign name="arrowleft" size={24} color="white" />
      </TouchableOpacity>
      <Text style = {[styles.titleText]} >Profile Settings</Text>

      {/* Edit Profile test */}

      {/* <TouchableOpacity onPress={() => {navigation.navigate("EditProfile")}}>
        <Text>Edit Profile</Text>
      </TouchableOpacity>
     */}


      <View style={[styles.optionContainer]}>
        {settingOptions.map((option)=> (
          <TouchableOpacity style={[styles.optionButton]} key={option.key} onPress={option.onPress}>
            <View style={{display:'flex', flexDirection:'row', alignItems:'center', gap: 33}}>
              <View style={[styles.iconContainer]}>
                {option.icon}
              </View>
              <Text style={[styles.optionText]}>{option.name}</Text>
            </View>
            <Ionicons name='chevron-forward' size={18} color={'#85E5CA'}/> 
          </TouchableOpacity>
        ))}
      </View>
      <Divider color='#85E5CA'/>
    </View>
    </KeyboardAwareScrollView>

    
  )
}

const styles = StyleSheet.create({
    container: {
      backgroundColor:'#153A59',
      flex: 1,
      paddingTop:"20%",
      paddingHorizontal:'5%',
      gap: 12
    },

    titleText:{
      color:"white",
      fontSize: 30,
      fontWeight: "600",
    },

    backButton: {
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:"#366B7C",
      borderRadius:"100%",
      width: 35,
      height: 35
    },
  
    optionContainer:{
      display:'flex',
      marginTop: 20,
      gap: 30
    },

    optionButton:{
      display:'flex',
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center'
    },

    iconContainer:{
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      borderRadius:'100%', 
      backgroundColor:'#225982', 
      width: 47, 
      height: 47
    },

    optionText:{
      textAlign:'center',
      color:'white',
      fontSize: 16,
      fontWeight: 400
    },

    accountSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: 'rgba(190, 234, 241, 0.9)', 
      marginTop: 40, 
      width: width * 0.9, 
      borderRadius: 20, 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    avatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#d0d0d0', 
      marginRight: 10,
    },
    accountText: {
      fontSize: 18,
      color: '#000',
    },

    logoutButton: {
      backgroundColor: '#40a7c3', // Light blue
      padding: 15,
      borderRadius: 15,
      alignItems: "center",
      marginTop: 550,
      width: width * 0.8,
      
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 18,
    },

    screenTitle: {
      fontSize: 30,
      fontWeight: 'bold',
      color: '#355070', 
      marginTop: 70,
      marginBottom: 20,
      fontFamily: 'Helvetica Neue', 
    },
});