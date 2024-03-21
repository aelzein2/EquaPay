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
      if (auth.currentUser) {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);

        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserFullName(userData.fullName);
            setUserEmail(userData.email);
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
  }, [auth.currentUser]);

  async function addFriends(friend) {
    if (!friend) {
      Alert.alert('Error', 'Please enter an email.');
      return;
    }

    if (friend === userEmail) {
      Alert.alert('Error', 'You cannot add yourself as a friend.');
      return;
    }

    // Check if already friends
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

    // Proceed to add friend since they are not already added
    const usersRef = collection(db, 'users');
    const queryDatabase = query(usersRef, where("email", "==", friend));
    const querySnapshot = await getDocs(queryDatabase);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const fullName = userDoc.data().fullName;
      console.log(`Adding friend: ${fullName}`);

      const docRef = await addDoc(collection(db, 'friends'), {
        befriender: userEmail,
        befriended: friend,
      });

      console.log(`Friend added with ID: ${docRef.id}`);
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

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);

      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const q = query(collection(db, "friends"), where("befriender", "==", userData.email));

          const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const friendPromises = querySnapshot.docs.map(async (friendDoc) => {
              const friendData = friendDoc.data();
              const friendEmail = friendData.befriended;
              const friendQuery = query(collection(db, "users"), where("email", "==", friendEmail));

              const friendSnapshot = await getDocs(friendQuery);
              if (!friendSnapshot.empty) {
                const friendUser = friendSnapshot.docs[0].data();
                return {
                  name: friendUser.fullName,
                  docid: friendDoc.id,
                  email: friendEmail
                };
              }
              return null;
            });

            Promise.all(friendPromises).then((friendsList) => {
              setFriends(friendsList.filter((friend) => friend !== null));
            });
          });

          return () => unsubscribe();
        }
      }).catch((error) => {
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
