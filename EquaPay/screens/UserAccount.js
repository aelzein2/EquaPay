import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image, Alert, } from 'react-native';
import { Divider } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { AntDesign } from '@expo/vector-icons'; // used for the icons
import { auth, firestore } from '../firebase' // used for authentication
import { doc, getDoc, getFirestore, query, where, collection, addDoc, getDocs, } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons'; // used for the icons
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';


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
  const auth = getAuth();
  const [addFriend, setAddFriend] = useState("");
  const navigation = useNavigation();
  const [userFullName, setUserFullName] = useState('Loading...'); // State to store the user's full name
  const [userEmail, setUserEmail] = useState('Loading...'); // State to store users email

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) { // If the user is logged in
        const userDocRef = doc(db, 'users', auth.currentUser.uid); // Reference to the user stored in the database.

        try {
          const docSnap = await getDoc(userDocRef); // fetches the user's data from the database
          if (docSnap.exists()) {
            const userData = docSnap.data(); // Get the user's data
            console.log("User's full name is: ", userData.fullName); // Log the user's full name
            console.log("User's email is: ", userData.email); // Log the user's email
          
            setUserFullName(userData.fullName); // Set the user's full name state
            setUserEmail(userData.email); // Set the user's email state
          } else {
            console.log("User record not found");
            setUserFullName("Name not found");
            setUserEmail("Email not found");
          }
          
        } catch (error) {
          console.error("Error fetching user data: ", error);
          setUserFullName("Error Loading Name"); 
        }
      }
    };

    fetchUserData();
  }, []);

  function handleAddFriend(){
    Alert.prompt("Add Friend",
    "",[
      {
        text: "Cancel",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel"
      },
      {
        text: "Ok",
        onPress: friend => addFriends(friend),
      }
    ],)
    
}

async function addFriends(friend) {
  if (friend) {
    console.log(friend); // Log the email being added

    // Reference to the users collection
    const usersRef = collection(db, 'users');

    // Query to find user by email
    const queryDatabase = query(usersRef, where("email", "==", friend)); // need this to be if the email is found capitalized or uncapitalized

    // Execute query
    const querySnapshot = await getDocs(queryDatabase);

    // Check if user with the given email exists
    if (!querySnapshot.empty) {
      // Get the first document (user) from the results
      const userDoc = querySnapshot.docs[0];

      // Retrieve user's fullName from the document
      const fullName = userDoc.data().fullName;
      console.log(`Adding friend: ${fullName}`); // to actually see if friend is being added and name is being fetched

      // Add a new document in the 'friends' collection
      const docRef = await addDoc(collection(db, 'friends'), {
        befriender: userEmail, // userEmail should be the email of the current user
        befriended: friend,
      });

      console.log(`Friend added with ID: ${docRef.id}`);
    } else if (friend !== userEmail) {
      Alert.alert('Error', 'User not found. Please try again.');
    }
  } else if (friend == ''){
    Alert.alert('Error', 'Please enter a correct email.');
  }
}

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

const handleSettingPage = () => {
  navigation.navigate("Settings");
}

const userOptions=[
  {id:'0', name:'Profile Settings', icon:<MaterialCommunityIcons name="account-settings-outline" size={30} color={'#EDEDED'}/>, onPress: handleSettingPage},
  {id:'1', name:'Activities History', icon:<MaterialIcons name="history" size={30} color={'#EDEDED'}/>},
  {id:'2', name:'Logout', icon:<MaterialIcons name="logout" size={28} color={'#EDEDED'}/>, onPress: handleLogout},
]
  return (
    
    <View style={[styles.container]}>
      <Text style = {[styles.titleText]}>Account</Text>
      
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
          <TouchableOpacity style={[styles.friendButton]} onPress={handleAddFriend}>
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
            {userOptions.map((option, index)=> (
              <TouchableOpacity style={[styles.optionButton]} key={index} onPress={option.onPress}>
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
      paddingLeft: "5%",
      paddingRight:"5%",
      backgroundColor: '#153A59'
    },

    backButton: {
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:"#366B7C",
      borderRadius:"100%",
      width: 35,
      height: 35
    },

    bodyContainer:{
      marginTop: 15
    },
    
    titleText:{
      color:"white",
      fontSize: 30,
      fontWeight: 600,
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
