import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image } from 'react-native';
import { Divider } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; // used for the icons
import { auth, firestore } from '../firebase' // used for authentication
import { Alert } from 'react-native';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons'; // used for the icons
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';


//profile picture
import Avatar from "../assets/img/avatar.png";
import friendAvatar from "../assets/img/friendAvatar.png";

const { width } = Dimensions.get('window');
const db = getFirestore();


const friendsData=[
  {id:'0', name: 'Friend A'},
  {id: '1', name: 'Friend B'},
  {id: '2', name: 'Friend C'}  
]



const UserAccount = () => {
 
    const navigation = useNavigation();
    const [userFullName, setUserFullName] = useState('Loading...'); // State to store the user's full name
    const [userEmail, setUserEmail] = useState('Loading...'); // State to store users email

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) { // If the user is logged in
        const userDocRef = doc(db, 'users', auth.currentUser.uid); // Reference to the user stored in the database.

        try {
          const docSnap = await getDoc(userDocRef); // fetches the user's data from the database
          if (docSnap.exists()) { // if the user exists
            setUserFullName(docSnap.data().fullName); // get the users name and sets it to the state
            console.log("User's full name is: ", userFullName);

            setUserEmail(docSnap.data().email); // get the users email
            console.log("User's email is: ", userEmail);
        } 
          else { // if the user does not exist
            console.log("User record not found");
            setUserFullName("Name not found"); 
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
          setUserFullName("Error Loading Name"); 
        }
      }
    };

    fetchUserData();
  }, []);


  // function that handles the press of the users name/avatar block. this will be pressed so a user can change account details.
  const handlePressAccountSection = () => {
  };


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

const userOptions=[
  {id:'0', name:'Profile Settings', icon:<MaterialCommunityIcons name="account-settings-outline" size={30} color={'#EDEDED'}/>},
  {id:'1', name:'Activities History', icon:<MaterialIcons name="history" size={30} color={'#EDEDED'}/>},
  {id:'2', name:'Logout', icon:<MaterialIcons name="logout" size={28} color={'#EDEDED'}/>, onPress: handleLogout}
]

  return (
    
    <View style={[styles.container]}>
      <Text style = {[styles.titleText]} >Account</Text>
      
      <View style={[styles.profilePictureContainer]}>
        <Image source={Avatar}
          style={{
            resizeMode:'contain',
            width: 100,
            height: 100
        }}/>

        <Text style={[styles.userNameText]}>{userFullName}</Text>
        <Text style={[styles.userEmailText]}>{userEmail}</Text>
      </View>

      <View style={[styles.bodyContainer]}>
        <Text style={[styles.headingText]}>Friends</Text>
        <View style={[styles.friendContainer]}>
          <TouchableOpacity style={[styles.friendButton]}>
            <Ionicons name='add-circle-outline' size={30}/>
            <Text style={[styles.friendText]}>Add Friends</Text>
          </TouchableOpacity>
          {friendsData.map((friend) => (
            <TouchableOpacity key={friend.key} style={[styles.friendButton]}>
              <Image source={friendAvatar} style={{ resizeMode:'contain', width: 35, height: 35 }}/>
              <Text style={[styles.friendText]}>{friend.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{display:'flex', flexDirection:'row', justifyContent:'flex-end', marginVertical: 10}}>
          <Text style={[styles.showAllText]}  onPress={()=>navigation.navigate('Friends')}>Show all</Text>
        </View>
        <Divider color='#85E5CA'/>
      
        <View style={[styles.optionContainer]}>
            {userOptions.map((option)=> (
              <TouchableOpacity style={[styles.optionButton]} key={option.key} onPress={option.onPress}>
                <View style={{display:'flex', flexDirection:'row', alignItems:'center', gap:33}}>
                  <View style={[styles.iconContainer]}>
                    {option.icon}
                  </View>
                  <Text style={[styles.optionText]}>{option.name}</Text>
                </View>
                <Ionicons name='chevron-forward' size={18} color={'#85E5CA'}/> 
              </TouchableOpacity>
            ))}
        </View>
      </View>
    </View>
  );
};

export default UserAccount;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop:"20%",
      paddingLeft: "10%",
      paddingRight:"10%",
      backgroundColor: '#153A59'
    },

    bodyContainer:{
      marginTop: 15
    },

    titleText:{
      color:"white",
      fontSize: 40,
      fontWeight: 400
    },

    profilePictureContainer:{
      display: 'flex',
      justifyContent:'center',
      alignItems: 'center',
      gap: 5,
      marginTop:"10%"
    },

    userNameText:{
      color:'white',
      fontSize: 16,
      fontWeight: 700
    },

    userEmailText:{
      color:'#85E5CA',
      fontSize: 12,
      fontWeight: 300
    },  

    headingText:{
      color:'white',
      fontSize: 20,
      fontWeight: 600
    },

    friendContainer:{
      display:'flex',
      flexDirection:'row',
      justifyContent:'space-between',
      alignItems:'center',
      marginTop: 20,
    },

    friendButton:{
      display:'flex',
      justifyContent:'center',
      alignItems:'center',
      textAlign:'center',
      backgroundColor:'#85E5CA',
      borderRadius: 15,
      width: 71,
      height: 90,
      gap: 10
    },

    friendText:{
      color:'black',
      textAlign:'center',
      fontSize: 13,
      fontWeight: 400
    },

    showAllText:{
      color:'#85E5CA',
      fontSize: 12,
      fontWeight: 300
    },

    optionContainer:{
      display:'flex',
      marginTop: 20,
      gap: 20
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
