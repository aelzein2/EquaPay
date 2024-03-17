import { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  TouchableOpacity
} from "react-native";
import { auth, firestore } from '../firebase'
import { useNavigation } from '@react-navigation/native';
import RowChevron from "../components/RowChevron";
import { AntDesign } from '@expo/vector-icons';
const { width } = Dimensions.get('window');
export default function Setting(){

    const navigation = useNavigation();

// function that handles user log out. session ends
// ** Need to add some async storage stuff
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

      const backToPreviousScreen = () => {
        navigation.navigate("Account");
    }


    return(
        <View style={styles.container}>
        <Text style = {styles.screenTitle} >Settings</Text>
            <TouchableOpacity onPress={backToPreviousScreen} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>
      <RowChevron
            text={"Change password"}
            icon={"chevron-forward"}
            onPress={() => {
              navigation.navigate("Reauthentication", { id: 1 });
            }}
          />
          <RowChevron
            text={"Change email"}
            icon={"chevron-forward"}
            onPress={() => {
              navigation.navigate("Reauthentication", { id: 2 });
            }}
          />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start', 
      alignItems: 'center',
      backgroundColor: '#e0f4f1',
    },
    accountSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      backgroundColor: 'rgba(190, 234, 241, 0.9)', 
      marginTop: 40, 
      width: width * 0.9, 
      borderRadius: 20, 
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    avatarPlaceholder: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#d0d0d0', 
      marginRight: 10,
    },
    accountText: {
      fontSize: 18,
      color: '#000',
    },
    backButton: {
        position: 'absolute',
        top: 80, 
        left: 20, // Safe area padding
        zIndex: 10, // Ensures that the touchable is clickable above all other elements
      },

      logoutButton: {
        backgroundColor: '#40a7c3', // Light blue
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 550,
        width: width * 0.8,
        
      },
      buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
      },

      screenTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#355070', 
        marginTop: 70,
        marginBottom: 20,
        fontFamily: 'Helvetica Neue', 
      },
});