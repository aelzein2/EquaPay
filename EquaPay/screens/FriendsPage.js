import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { Divider } from '@rneui/themed';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from "@react-navigation/native";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  getFirestore,
  onSnapshot,
  addDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import SlidingButton from "./SlidingButton";

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) { // If the user is logged in
        const userDocRef = doc(db, 'users', auth.currentUser.uid); // Reference to the user stored in the database.

        try {
          const docSnap = await getDoc(userDocRef); // fetches the user's data from the database
          if (docSnap.exists()) {
            const userData = docSnap.data(); // Get the user's data
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

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);

      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            const q = query(
              collection(db, "friends"),
              where("befriender", "==", userData.email)
            );

            // Setup a real-time listener using onSnapshot
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
              // Use Promise.all to wait for all friend details to be fetched
              const friendPromises = querySnapshot.docs.map(
                async (friendDoc) => {
                  const friendData = friendDoc.data();
                  const friendEmail = friendData.befriended;
                  const friendQuery = query(
                    collection(db, "users"),
                    where("email", "==", friendEmail)
                  );

                  // Await the query results for each friend
                  const friendSnapshot = await getDocs(friendQuery);
                  if (!friendSnapshot.empty) {
                    const friendUser = friendSnapshot.docs[0].data();
                    return {
                      name: friendUser.fullName,
                      docid: friendDoc.id,
                      email: friendEmail
                    };
                  }
                  return null; // In case the friend doesn't exist in users collection
                }
              );

              // Resolve all promises and update state
              Promise.all(friendPromises).then((friendsList) => {
                // Filter out any null values if a friend wasn't found
                setFriends(friendsList.filter((friend) => friend !== null));
              });
            });

            // Cleanup function to unsubscribe from the listener when the component unmounts
            return () => unsubscribe();
          }
        })
        .catch((error) => {
          console.error("Error fetching friends: ", error);
        });
    }
  }, [auth.currentUser, db]);

  return (
    <View style={styles.container}>
      <Text style={[styles.title]}>Friends</Text>
      <TouchableOpacity style={[styles.addFriendButton]} onPress={handleAddFriend}>
        <Text style={[styles.addFriendText]}>
          Add Friend
        </Text>
        
      </TouchableOpacity>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
        <SafeAreaView>
          {friends.map((friend, index) => (
            <View style={{flex:1, gap: 12}}>
            <SlidingButton
                key={index}
                name={friend.name}
                docID={friend.docid}
                email={friend.email}
              ></SlidingButton>
              <Divider color='#85E5CA' style={{marginBottom:12}}/>
            </View>
              
            ))}
        </SafeAreaView>
        
      </KeyboardAwareScrollView>
    </View>
  );
};

export default FriendsPage;

const styles = StyleSheet.create({
  container: {
    backgroundColor:'#153A59',
    flex: 1,
    paddingTop:"20%",
    paddingHorizontal:'5%',
    gap: 12
  },
  scrollView: {
  },

  addFriendButton:{
    backgroundColor: "#366B7C",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    alignSelf: "flex-end", // Aligns the button to the right of its container
    alignItems: "center", // Centers the text within the button
  },

  addFriendText:{
    color: "white",
    fontSize: 16,
    fontWeight:600
  },

  title: {
    color:"white",
    fontSize: 30,
    fontWeight: "600",
  },
  friendItem: {
    backgroundColor: "white",
    padding: 20,
    marginVertical: 8,
    width: "100%",
    borderRadius: 10,
  },
  friendText: {
    fontSize: 18,
  },
});
