
import { 
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from '@react-navigation/native' // used to navigate between screens
import { auth } from '../firebase' // used for authentication
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth' // used for authentication
import { getFirestore, collection, query, where, getDoc, updateDoc, doc } from 'firebase/firestore';

const db = getFirestore(); // gets the firestore database

const EditProfile = () => {

    const [fullName, setFullName] = useState(''); // states for name
    const [password, setPassword] = useState(''); // states for password
    const navigation = useNavigation(); // used to navigate between screens
 
 

    useEffect(() => {
      const fetchUserData = async () => {
        if (auth.currentUser) { // If the user is logged in
          const userDocRef = doc(db, 'users', auth.currentUser.uid); // Reference to the user stored in the database.
  
          try {
            const docSnap = await getDoc(userDocRef); // fetches the user's data from the database
            if (docSnap.exists()) { // if the user exists
              setFullName(docSnap.data().fullName); // get the users name and sets it to the state
              console.log("User's full name is: ", docSnap.data().fullName);
          } 
            else { // if the user does not exist
              console.log("User record not found");
            }
          } catch (error) {
            console.error("Error fetching user data: ", error);
          }
        }
      };
  
      fetchUserData();
    }, []);

    const saveInformation = async () => {
      if (auth.currentUser) { // If the user is logged in
        const userDocRef = doc(db, 'users', auth.currentUser.uid); // Reference to the user stored in the database.

          const docSnap = await getDoc(userDocRef); // fetches the user's data from the database
          updateDoc(userDocRef, {
            fullName: fullName,

          }).then(() => {
            console.log(fullName + " Saved!");
          }).catch((error) => {
            console.log(error)
          })
    };
    navigation.navigate("BottomTab",{screen:'Home'})
  }


  return (
    <View style={[styles.container]}>
        <View style = {{flexDirection: "column", marginBottom: 6}}>
            <Text style = {styles.name}>Name</Text>
        </View>
        <TextInput
                placeholder={fullName}
                placeholderTextColor="white"
                value={fullName}
                onChangeText={text => setFullName(text)}
                style={styles.input}
            />

        <TouchableOpacity style={[styles.button]} onPress={saveInformation}>
          <Text style={[styles.buttonText]}>SAVE</Text>
        </TouchableOpacity>
      
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({

  container:{
    backgroundColor:'#153A59',
    flex: 1,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  
  button: {
    backgroundColor: '#40a7c3', // Light blue
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 500,
  },
  name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
