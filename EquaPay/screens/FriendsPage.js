import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
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
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import SlidingButton from "./SlidingButton";

const FriendsPage = () => {
  const [friends, setFriends] = useState([]);
  const navigation = useNavigation();
  const auth = getAuth();
  const db = getFirestore();

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
      <Text style={styles.screenTitle}>Friends</Text>
      <ScrollView style={styles.scrollView}>
        {friends.map((friend, index) => (
          <SlidingButton
            key={index}
            name={friend.name}
            docID={friend.docid}
          ></SlidingButton>
        ))}
      </ScrollView>
    </View>
  );
};

export default FriendsPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#153A59",
  },
  scrollView: {
    width: "100%",
  },
  screenTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginTop: 70,
    marginBottom: 20,
    fontFamily: "Helvetica Neue",
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
