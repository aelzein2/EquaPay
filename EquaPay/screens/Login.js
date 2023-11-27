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
import Modal from 'react-native-modal'; // used for the modal
import { AntDesign } from '@expo/vector-icons'; // used for the icons
import { auth } from '../firebase' // used for authentication
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth' // used for authentication
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const { width } = Dimensions.get('window'); // gets the width of the screen
const db = getFirestore(); // gets the firestore database


// Login function that returns the login page
const Login = () => {

    const [email, setEmail] = useState(''); // states for email
    const [password, setPassword] = useState(''); // states for password
    const navigation = useNavigation(); // used to navigate between screens
    const [isModalVisible, setModalVisible] = useState(false); // used to show the modal for forgot password
    const [resetEmail, setResetEmail] = useState(''); // used for the reset email

    // navigation to the homepage
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                navigation.navigate("Homepage") // when logged in, navigate to the homepage
            }
        }
        )
        return unsubscribe //leaves the listener so it stops executing or checking if its logged in. this just makes sure that logged in is checked once
    }, [])

    // handles login to homepage
    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password) // sign in with email and password
            .then((userCredentials) => {
                // Successfully signed in
                const user = userCredentials.user; // after signing in, assign the user to the userCredential
                console.log("User signed in with email: ", user.email);
            })
            .catch(error => {
                // Handling different types of authentication errors
                if (error.code === 'auth/invalid-login-credentials') { // if the email is invalid
                    // When the password is incorrect
                    alert('Invalid details. Please check your email or password.');
                }
            });
    };

    // function that is used to display the forgot password popup
    const handleForgotPassword = () => {
        setModalVisible(true);
    };

    // funciton that handles forgot password. sends an email to the user if the email is registered
    const sendResetEmail = () => {

        const usersRef = collection(db, 'users'); // reference to the users collection
        const queryDatabase = query(usersRef, where("email", "==", resetEmail)); // query to check if the email is registered in the database

        if (resetEmail === '') { // if nothing is entered, an alert is displayed
            alert('Please enter your email.');
        }

        // searches the backend database to see if an email is registered and valid.
        getDocs(queryDatabase).then(querySnapshot => {

            if (!querySnapshot.empty) {
                // Email is registered, proceed to send reset email
                sendPasswordResetEmail(auth, resetEmail)
                    .then(() => {
                        alert('Password reset email sent!');
                        setModalVisible(false);
                    })
                    .catch(error => {
                    }
                    );
            }

            else {
                // Email is not registered in the system
                alert('Email not found in our system. Please check your email address.');
            }

        }).catch(error => {
            // Error handling for Firestore query
            alert('An error occurred while checking the email: ' + error.message);
        });
    };
    // returns the structure of the login page
    return (

        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
        >

            <View style={styles.inputContainer}>

                <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={text => setEmail(text)}
                    style={styles.input}

                />

                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={text => setPassword(text)}
                    style={styles.input}
                    secureTextEntry

                />
            </View>

            <Modal isVisible={isModalVisible} style={styles.modal}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(false)}>
                        <AntDesign name="close" size={24} color="black" />
                    </TouchableOpacity>

                    <Text style={styles.modalTitle}>Forgot Password</Text>
                    <Text style={styles.forgotText}>Enter your email to reset your password. We'll send a link if the account is currently registered.</Text>

                    <TextInput
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChangeText={setResetEmail}
                        style={styles.input}
                        autoFocus
                    />
                    <TouchableOpacity onPress={sendResetEmail} style={styles.sendButton}>
                        <Text style={styles.buttonText}>Send</Text>
                    </TouchableOpacity>

                </View>
            </Modal>

            <View style={styles.buttonContainer}>

                <TouchableOpacity
                    onPress={handleLogin}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword}>
                    <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
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
        width: '100%',
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

    sendButton: {
        backgroundColor: '#40a7c3', // Light blue
        width: '40%',
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 10,

    },
    forgotPasswordText: {
        color: '#40a7c3', // You can adjust the color
        marginTop: 20,
        fontSize: 16,
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
    modal: {
        justifyContent: 'flex-start',
        margin: 0,
    },
    modalContainer: {
        backgroundColor: 'white',
        paddingTop: 22,
        paddingHorizontal: 22,
        paddingBottom: 22,
        justifyContent: 'center', // Align children vertically in the center
        alignItems: 'center',     // Align children horizontally in the center
        borderRadius: 20,
        shadowRadius: 10,
        shadowOpacity: 0.25,
        width: '90%',             // Set the modal width to 80% of the screen width
        alignSelf: 'center',      // Align the modal box itself to the center of the parent
        position: 'absolute',     // Position the modal absolutely within the parent
        top: '50%',               // Position the top edge of the modal at the middle of the screen
        transform: [{ translateY: -Dimensions.get('window').height * 0.25 }], // Shift the modal up by 25% of the screen height
    },

    modalTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 15,
        textAlign: 'center',
    },

    forgotText: {
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
    },

    iconButton: {
        alignSelf: 'flex-start',
    },
});


