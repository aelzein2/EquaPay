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
import { auth } from '../firebase'
import { getFirestore, collection, query, where, getDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, deleteUser } from 'firebase/auth' // used for authentication
import { useNavigation } from '@react-navigation/native';
import RowChevron from "../components/RowChevron";
import { AntDesign, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
const { width } = Dimensions.get('window');

const db = getFirestore(); // gets the firestore database

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
    navigation.navigate("Reauthentication", { id: 2 })
  }

  // deletes the account
  const handleDeleteAccount = async () => {
    if (auth.currentUser) { // If the user is logged in
      const userDocRef = doc(db, 'users', auth.currentUser.uid); // Reference to the user stored in the database.

      Alert.alert('CONFIRM', 'Are you sure you want to delete your account?', [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => {
          deleteDoc(userDocRef);
          deleteUser(auth.currentUser).then(() => {
            console.log("Auth Deleted");
          }).catch((error) => {
            console.log(error);
          })
          navigation.navigate("LoadingScreen");
          console.log("Deleted Account");
        
        }},
      ]);  
      
      
    };

  }

  

  const settingOptions =[
    {id:'0', name: 'Change Password', icon:<MaterialIcons name="lock-outline" size={30} color="#EDEDED" />, onPress: handleChangePassword},
    {id:'1', name: 'Change Email', icon: <MaterialCommunityIcons name="email-edit-outline" size={30} color="#EDEDED" />, onPress: handleChangeEmail},
    {id:'2', name: 'Delete Account', icon: <MaterialCommunityIcons name="account-remove-outline" size={30} color="#EDEDED" />, onPress: handleDeleteAccount},
  ]


  return(
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
        {settingOptions.map((option, index)=> (
          <TouchableOpacity style={[styles.optionButton]} key={index} onPress={option.onPress}>
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
});