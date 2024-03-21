import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Image, Alert, ScrollView } from 'react-native';
import { Divider } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, firestore } from '../firebase';
import { doc, getDoc, getFirestore, query, where, collection, addDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import Avatar from "../assets/img/avatar.png"; // Your default avatar
import friendAvatar from "../assets/img/friendAvatar.png"; // Your friend's avatar

const { width } = Dimensions.get('window');
const db = getFirestore();

const UserAccount = () => {
  const auth = getAuth();
  const [userFullName, setUserFullName] = useState('Loading...');
  const [userEmail, setUserEmail] = useState('Loading...');
  const [friends, setFriends] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);

        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserFullName(userData.fullName);
            setUserEmail(userData.email);

            const q = query(collection(db, "friends"), where("befriender", "==", userData.email));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
              const friendPromises = querySnapshot.docs.map(async (friendDoc) => {
                const friendData = friendDoc.data();
                const friendQuery = query(collection(db, "users"), where("email", "==", friendData.befriended));
                const friendSnapshot = await getDocs(friendQuery);
                if (!friendSnapshot.empty) {
                  return friendSnapshot.docs[0].data().fullName;
                }
                return null;
              });
              Promise.all(friendPromises).then(friendsList => setFriends(friendsList.filter(friend => friend !== null)));
            });

            return () => unsubscribe();
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };

    fetchUserData();
  }, [auth.currentUser, db]);

  async function addFriends(friend) {
    if (!friend) {
      Alert.alert('Error', 'Please enter an email.');
      return;
    }

    if (friend === userEmail) {
      Alert.alert('Error', 'You cannot add yourself as a friend.');
      return;
    }

    const alreadyFriendsQuery = query(
      collection(db, 'friends'),
      where("befriender", "==", userEmail),
      where("befriended", "==", friend)
    );

    const alreadyFriendsSnapshot = await getDocs(alreadyFriendsQuery);
    if (!alreadyFriendsSnapshot.empty) {
      Alert.alert('Error', 'This user is already your friend.');
      return;
    }

    const usersRef = collection(db, 'users');
    const queryDatabase = query(usersRef, where("email", "==", friend));
    const querySnapshot = await getDocs(queryDatabase);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const fullName = userDoc.data().fullName;

      await addDoc(collection(db, 'friends'), {
        befriender: userEmail,
        befriended: friend,
      });
    } else {
      Alert.alert('Error', 'User not found. Please try again.');
    }
  }

  function handleAddFriend() {
    Alert.prompt(
      "Add Friend", 
      "Please enter your friend's email to add them. The email must be linked to an EquaPay-registered account.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: friend => addFriends(friend),
        }
      ]
    );
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
  {id:'1', name:'Logout', icon:<MaterialIcons name="logout" size={28} color={'#EDEDED'}/>, onPress: handleLogout},
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
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
            <View style={[styles.friendContainer]}>
              <TouchableOpacity style={[styles.friendButton]} onPress={handleAddFriend}>
                <Ionicons name='add-circle-outline' size={30}/>
                <Text style={[styles.addFriend]}>Add{'\n'}Friends</Text>

              </TouchableOpacity>

            {/* Friends list rendered after the Add Friends button */}
            
            {friends.slice(0, 4).map((friend, index) => (
              <TouchableOpacity key={index} style={[styles.friendButton]}>
                <Image source={friendAvatar} style={{ resizeMode: 'contain', width: 35, height: 35 }}/>
                <Text style={[styles.friendText]}>{friend}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

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

    friendContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 20,
      gap: 10,
    },

    friendButton: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      backgroundColor: '#85E5CA',
      borderRadius: 15,
      width: 80,
      height: 90,
    },

    addFriend:{
      color:'black',
      textAlign:'center',
      fontSize: 14,
      fontWeight: 400
    },
    friendText:{
      color:'black',
      textAlign:'center',
      fontSize: 11,
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
