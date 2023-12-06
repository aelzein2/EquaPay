// Imports necessary libraries and components
import React, {useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native' // used to navigate between screens
import { auth, firestore } from '../firebase' // used for authentication
import Ionicons from 'react-native-vector-icons/Ionicons'; // used for the icons
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth' // used for authentication
import { addDoc, collection, doc, setDoc } from 'firebase/firestore'; // used for firestore

import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity,  
    Dimensions, 
}from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';


const { width } = Dimensions.get('window');

// Function that returns the signup page
const Signup = () => {
  
    // states for email, password and full name
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation(); // used to navigate between screens
   
    useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
        if (user) {
            navigation.navigate("Homepage") // when logged in, navigate to the homepage
        }
    }
    )
    return unsubscribe //leaves the listener so it stops executing or checking if its logged in. this just makes sure that logged in is checked once
    }, [])


    const handleSignup = () => {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredentials) => {
          const user = userCredentials.user;
          console.log("User has signed up! Details are: ", user.email);
          alert('Thanks for signing up');
          navigation.navigate('Login')
  
          // Adding user information to database
          const usersCollectionRef = collection(firestore, "users");
          setDoc(doc(usersCollectionRef, user.uid), { // assigns the document ID to user ID for better security
            fullName: fullName,
            email: email,
            isActive: true
          })
          .then(() => {
            console.log("User information added to Firestore");
          })
          .catch((error) => {
            console.error("Error adding user information to Firestore", error);
          });
        })
        .catch(error => {
          if (error.code === 'auth/email-already-in-use') {
            alert('An account is already associated with that email. Please log in.');
            navigation.navigate('Login');
          } else {
            alert(error.message);
          }
        });
  };
  

      const backToPreviousScreen = () => {
        navigation.navigate("LoadingScreen");
    }
      
// returns the structure of the signup page
  return (
    <KeyboardAwareScrollView style={[styles.container]}>
      
      <TouchableOpacity onPress={backToPreviousScreen} style={[styles.backButton]}>
        <Ionicons name='chevron-back' size={24} color={'white'}/>
      </TouchableOpacity>

      <View>
        <Text style={[styles.titleText]}>Create Account</Text>
      </View>

     
      <View style={[styles.bodyContainer]}>
        <View style={[styles.inputContainer]}>
          <TextInput
              placeholder="Full Name"
              placeholderTextColor="white"
              value={fullName}
              onChangeText={setFullName}
              style={[styles.input]}
            />
            
            <TextInput
              placeholder="Email"
              placeholderTextColor="white"
              value={email}
              onChangeText={setEmail}
              style={[styles.input]}
              keyboardType="email-address"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="white"
              value={password}
              onChangeText={setPassword}
              style={[styles.input]}
              secureTextEntry
            />
        </View>
    
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSignup} style={styles.button}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    
      
      
    </KeyboardAwareScrollView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    paddingTop:"20%",
    paddingLeft: "10%",
    paddingRight:"10%",
    backgroundColor: '#153A59'
  },

  titleText:{
    color:"white",
    fontSize: 40,
    fontWeight: 400
  },

  bodyContainer:{
    paddingLeft:"2.5%",
    paddingRight:"2.5%",
  },

  inputContainer: {
    marginTop: "35%",
    gap: 51  
  },

  input: {
    paddingVertical: 10,
    borderBottomColor:"white",
    borderBottomWidth: 1,
    fontSize: 20,
    width: '100%',
    color:"white",
  },

  buttonContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
    gap:"8%"
  },

  button: {
    backgroundColor: '#85E5CA',
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#153A59",
    fontSize: 25,
    fontWeight: 600
  },

  backButton: {
    justifyContent:'center',
    alignItems:'center',       
    marginBottom:"10%",
    backgroundColor:"#366B7C",
    borderRadius:"100%",
    width: 35,
    height: 35
  },

});

