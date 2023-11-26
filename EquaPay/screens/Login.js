// Imports necessary libraries and components
import {
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Dimensions
}
    from 'react-native'

import React, { useEffect, useState } from 'react' // states is used which is from react
import { useNavigation } from '@react-navigation/native' // used to navigate between screens
import { auth } from '../firebase' // used for authentication
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth' // used for authentication


const { width } = Dimensions.get('window'); // gets the width of the screen

// Login function that returns the login page
const Login = () => {

    const [email, setEmail] = useState(''); // states for email
    const [password, setPassword] = useState(''); // states for password
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

    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password) // sign in with email and password
        .then((userCredentials) => {
            
            const user = userCredentials.user; // after signing in, assign the user to the userCredential
            console.log("User signed in with email: " , user.email)
        })
        .catch(error => alert(error.message))
    }
    
    return (

        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
        >

            <View style={styles.inputContainer}>

                <TextInput
                    placeholder="Email"
                    value = {email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}

                />

                <TextInput
                    placeholder="Password"
                    value = {password}
                    onChangeText={text => setPassword(text)}
                    style={styles.input}
                    secureTextEntry

                />
            </View>

            <View style={styles.buttonContainer}>

                <TouchableOpacity
                    onPress={handleLogin}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                

            </View>

        </KeyboardAvoidingView>
    )
}

export default Login


// Styling for the Login page
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#e0f4f1', // Light greenish background
    },

    inputContainer: {
        width: width * 0.8, // Responsive width
        backgroundColor: '#ffffff', // White background for input container
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 20,
    },

    input: {
        backgroundColor: "#d0f0e8", // Light greenish for inputs
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 10,
        fontSize: 16,
    },

    buttonContainer: {
        width: width * 0.6, // Responsive width
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
    },

    button: {
        backgroundColor: '#40a7c3', // Light blue
        width: '100%',
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 10,
    },

    buttonOutline: {
        backgroundColor: 'white',
        borderColor: '#40a7c3', // Light blue border
        borderWidth: 2,
    },

    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },

    buttonOutlineText: {
        color: '#40a7c3', // Light blue text
        fontWeight: 'bold',
        fontSize: 18,
    },
});


