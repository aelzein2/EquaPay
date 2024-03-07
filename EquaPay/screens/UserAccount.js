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

async function addFriends(friend){
  setAddFriend(friend)
  console.log(addFriend);
  const usersRef = collection(db, 'users'); // reference to the users collection
  const queryDatabase = query(usersRef, where("email", "==", addFriend));
  if (addFriend !== null){
    getDocs(queryDatabase).then(querySnapshot => {
      if (!querySnapshot.empty) {
        const docRef = addDoc(collection(db, 'friends'), {
          befriender: userEmail,
          befriended: addFriend,
      })
      console.log(docRef.id)
      }  
    })
  } else {
      Alert.alert('Error', 'Please enter a correct email.');
  }
}


  // function that handles the press of the users name/avatar block. this will be pressed so a user can change account details.
  const handlePressAccountSection = () => {
  };

  // back button redirects back to the homepage
  const backToPreviousScreen = () => {
    navigation.navigate("Homepage");
}

const userOptions=[
  {id:'0', name:'Profile Settings', icon:<MaterialCommunityIcons name="account-settings-outline" size={30} color={'#EDEDED'}/>},
  {id:'1', name:'Activities History', icon:<MaterialIcons name="history" size={30} color={'#EDEDED'}/>},
  // {id:'2', name:'Logout', icon:<MaterialIcons name="logout" size={28} color={'#EDEDED'}/>, onPress: handleLogout}
]
  return (
    
    <View style={[styles.container]}>
      <Text style = {[styles.titleText]} >Account</Text>
      <TouchableOpacity style={styles.accountSection} onPress={handlePressAccountSection}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.accountText}>{userFullName}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={backToPreviousScreen} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>      

      <TouchableOpacity onPress={() => {navigation.navigate("Settings")}} style={styles.settings}>
          <AntDesign name="setting" size={24} color="black" />
      </TouchableOpacity>
      
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
    backButton: {
        position: 'absolute',
        top: 80, 
        left: 20, // Safe area padding
        zIndex: 10, // Ensures that the touchable is clickable above all other elements
      },
      settings: {
        position: 'absolute',
        top: 80, 
        right: 20, // Safe area padding
        zIndex: 10, // Ensures that the touchable is clickable above all other elements
      },

    bodyContainer:{
      marginTop: 15
    },

    titleText:{
      color:"white",
      fontSize: 40,
      fontWeight: 400,
      alignSelf: 'center',
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
