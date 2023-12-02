// Imports necessary libraries and components
import React, {useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native' // used to navigate between screens
import { auth, firestore } from '../firebase' // used for authentication
import { AntDesign } from '@expo/vector-icons'; // used for the icons
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth' // used for authentication
import { addDoc, collection, doc, setDoc } from 'firebase/firestore'; // used for firestore

import { 
    StyleSheet, 
    Text, 
    View, 
    TextInput, 
    TouchableOpacity, 
    KeyboardAvoidingView, 
    Dimensions, 
}        
    from 'react-native';


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
  
          // Adding user information to database
          const usersCollectionRef = collection(firestore, "users");
          setDoc(doc(usersCollectionRef, user.uid), { // assigns the document ID to user ID for better security
            fullName: fullName,
            email: email
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
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      
      <TouchableOpacity onPress={backToPreviousScreen} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>
      
      <View style={styles.inputContainer}>
      <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
        
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          keyboardType="email-address"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        
        
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleSignup} style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f4f1',
  },

  inputContainer: {
    width: width * 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    padding: 20,
  },

  input: {
    backgroundColor: '#d0f0e8',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    fontSize: 16,
  },

  buttonContainer: {
    width: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },

  button: {
    backgroundColor: '#40a7c3',
    width: '100%',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 100, // Adjust based on your header height
    left: 30, // Safe area padding
    zIndex: 10, // Ensures that the touchable is clickable above all other elements
  },

});

