// Imports necessary libraries and components
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions
}from 'react-native'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import React, { useEffect, useState } from 'react' // states is used which is from react
import { useNavigation } from '@react-navigation/native' // used to navigate between screens
import Modal from 'react-native-modal'; // used for the modal
import Ionicons from 'react-native-vector-icons/Ionicons'; // used for the icons
import { auth } from '../firebase' // used for authentication
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth' // used for authentication
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { MaterialCommunityIcons } from "@expo/vector-icons";


const { width } = Dimensions.get('window'); // gets the width of the screen
const db = getFirestore(); // gets the firestore database


// Login function that returns the login page
const Login = () => {

    const [email, setEmail] = useState(''); // states for email
    const [password, setPassword] = useState(''); // states for password
    const navigation = useNavigation(); // used to navigate between screens
    const [isModalVisible, setModalVisible] = useState(false); // used to show the modal for forgot password
    const [resetEmail, setResetEmail] = useState(''); // used for the reset email
    const [isPeekingPassword, setIsPeekingPassword] = useState(false);


    // navigation to the homepage
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            if (user) {
                navigation.navigate("BottomTab",{screen:'View Bills'}) // when logged in, navigate to the homepage
            }
        }
        )
        return unsubscribe //leaves the listener so it stops executing or checking if its logged in. this just makes sure that logged in is checked once
    }, [])

    // handles login to homepage
    const handleLogin = () => {
        signInWithEmailAndPassword(auth, email, password) // sign in with email and password using authentication. will automa
            .then((userCredentials) => {
                // Successfully signed in
                const user = userCredentials.user; // after signing in, assign the user to the userCredential
                console.log("User signed in with email: ", user.email, user.uid); // user ID is automatically and uniquely generated for each user
                navigation.navigate("BottomTab",{screen:'View Bills'}) //navigate to next screen

            })
            .catch(error => {
                // Handling different types of authentication errors
                if (error.code === 'auth/invalid-login-credentials') { // if the email is invalid
                    // When the password is incorrect
                    alert('Invalid details. Please check your email or password.');
                }

                else if (email || password === '') { // if the email is empty
                    // When the email is empty
                    alert('Please enter your login details.');
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

    const backToPreviousScreen = () => {
        navigation.navigate("LoadingScreen");
    }

    // returns the structure of the login page
    return (

        <KeyboardAwareScrollView style={[styles.container]} behavior="padding">
            <TouchableOpacity onPress={backToPreviousScreen} style={[styles.backButton]}>
                <Ionicons name='chevron-back' size={24} color={'white'}/>
            </TouchableOpacity>
            <View>
      <Text style={[styles.titleText]}>Welcome Back</Text>
      <Text style={[styles.headingText]}>Please Login to Continue</Text>
    </View>

    <View style={[styles.bodyContainer]}>
      <View style={[styles.inputContainer]}>
        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#EDEDED"
          value={email}
          onChangeText={text => setEmail(text)}
          style={[styles.input]}
          autoCapitalize='none'
        />
        <Text style={[styles.subtitle]}>Please enter your email</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#EDEDED"
            value={password}
            onChangeText={text => setPassword(text)}
            style={[styles.input, { paddingRight: 40 }]} // paddingRight to make space for the icon
            secureTextEntry={!isPeekingPassword}
          />
          <MaterialCommunityIcons
            name={isPeekingPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="white"
            style={styles.icon}
            onPress={() => setIsPeekingPassword(!isPeekingPassword)}
          />
        </View>
        <Text style={[styles.subtitle]}>Please enter your password</Text>
      </View>

      <View style={[styles.forgotPasswordContainer]}>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={[styles.forgotPasswordText]}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      <Modal isVisible={isModalVisible} style={styles.modal}>
        <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#EDEDED" />
            </TouchableOpacity>

            <Text style={[styles.modalTitle]}>Forgot Password</Text>
            <Text style={[styles.forgotText]}>Enter your email to reset your password. We'll send a link if the account is currently registered.</Text>

            <TextInput
                value={resetEmail}
                onChangeText={setResetEmail}
                style={[styles.modalInput]}
            />
            <TouchableOpacity onPress={sendResetEmail} style={styles.sendButton}>
                <Text style={[styles.buttonText]}>Send</Text>
            </TouchableOpacity>

        </View>
        </Modal>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                onPress={handleLogin}
                style={styles.button}
            >
                <Text style={[styles.buttonText]}>Login</Text>
                </TouchableOpacity>
                <View style={{display:"flex", flexDirection:"row",gap:"3%"}}>
                    <Text style={{color:"white", fontSize: 15, marginTop: 10}}>Don't have an account?</Text>
                    <Text style={{color:"#85E5CA", fontSize: 15, marginTop: 10}} onPress={()=> navigation.navigate('Signup')}>Sign up</Text>
                </View>
                    
            </View>
        </View>
        </KeyboardAwareScrollView>
    )
}

export default Login


// Styling for the Login page
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: "20%",
        paddingLeft: "10%",
        paddingRight: "10%",
        backgroundColor: '#153A59',
      },
    
      titleText: {
        color: "white",
        fontSize: 40,
        fontWeight: "400",
      },
    
      headingText: {
        color: "white",
        fontSize: 15,
        fontWeight: "400",
      },
    
      bodyContainer: {
        paddingLeft: "2.5%",
        paddingRight: "2.5%",
      },
    
      inputContainer: {
        marginTop: "35%",
      },
    
      input: {
        paddingVertical: 10,
        borderBottomColor: "white",
        borderBottomWidth: 1,
        fontSize: 20,
        width: '100%',
        color: "white",
        marginBottom: 5, // Space between the input field and its subtitle
      },

    modalInput:{
        borderBottomColor:"#EDEDED",
        borderBottomWidth: 1,
        width:'100%',
        fontSize: 15,
        color:'#EDEDED'
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

    buttonText:{
        color: "#153A59",
        fontSize: 25,
        fontWeight: 600
    },

    sendButton: {
        backgroundColor: '#85E5CA', // Light blue
        width: '40%',
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        marginTop: "10%",

    },

    forgotPasswordContainer:{
        justifyContent:"flex-end",
        alignItems:'flex-end'
    },

    forgotPasswordText: {
        color: '#40a7c3', // You can adjust the color
        marginTop: 20,
        fontSize: 15,
    },


    buttonOutline: {
        backgroundColor: 'white',
        borderColor: '#40a7c3', // Light blue border
        borderWidth: 2,
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
        backgroundColor: '#225982',
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
        color:'white',
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 15,
        textAlign: 'center',
    },

    forgotText: {
        color:'white',
        fontSize: 16,
        marginBottom: 15,
        textAlign: 'center',
    },

    iconButton: {
        alignSelf: 'flex-start',
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
      passwordContainer: {
        position: 'relative',
        marginBottom: 5, // Adjust based on your layout
      },
    
      icon: {
        position: 'absolute',
        right: 10,
        top: 12, // Center the icon vertically within the input field
      },
    
      subtitle: {
        color: 'white',
        fontSize: 11,
        marginBottom: 40, // Space after the subtitle, before the next input field
      },
    
      buttonContainer: {
        justifyContent: "center",
        alignItems: "center",
        marginTop: 30,
      },
    
      button: {
        backgroundColor: '#85E5CA',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 5,
      },
    
      buttonText: {
        color: "#153A59",
        fontSize: 25,
        fontWeight: "600",
      },
    
      forgotPasswordContainer: {
        justifyContent: "flex-end",
        alignItems: 'flex-end',
        marginBottom: 20, // Adjust as needed
      },
    
      forgotPasswordText: {
        color: '#40a7c3',
        fontSize: 15,
      },
});


