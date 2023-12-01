import { StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { auth } from "../firebase.js";
import { signOut } from "firebase/auth";

const HomePage = () => {
  const { showActionSheetWithOptions } = useActionSheet();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    try {
      showActionSheetWithOptions(
        {
          title: "Are you sure you want to logout?",
          options: ["Logout", "Cancel"],
          cancelButtonIndex: 1,
          destructiveButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            setIsLoggingOut(true);
            await signOut(auth);
          }
        }
      );
    } catch (err) {
      Alert.alert(
        "An error occurred while signing you out",
        "Please try again later"
      );
    }
  };

  return (
    <View>
      <Text>HomePage</Text>
      {isLoggingOut ? (
        <Text>Logging Out</Text>
      ) : (
        <TouchableOpacity onPress={handleLogout}>
          <Text>Logout</Text>
        </TouchableOpacity>
          
          
      )}
    </View>
  );
};

export default HomePage;

const styles = StyleSheet.create({});
