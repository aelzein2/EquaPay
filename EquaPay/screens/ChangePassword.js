import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getAuth, updatePassword } from "firebase/auth";
import { AntDesign, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

export default function ChangePassword({ navigation }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPeekingPassword, setIsPeekingPassword] = useState(false);
  const [isPeekingConfirmPassword, setIsPeekingConfirmPassword] = useState(false);
  const auth = getAuth();

  const handleChangePassword = () => {
    // Check if passwords match
    if (password !== confirmPassword) {
      Alert.alert("Passwords do not match");
      return;
    }

    // Check if password length is less than 6 characters
    if (password.length < 6) {
      Alert.alert("Password must be at least 6 characters");
      return;
    }

    // Attempt to update the password
    try {
      updatePassword(auth.currentUser, password).then(() => {
        Alert.alert("Password has been changed");
        navigation.navigate("Settings");
      });
    } catch (err) {
      Alert.alert("Error changing password");
    }
  };

  const backToPreviousScreen = () => {
    navigation.navigate("Settings");
  };


  return (
    <KeyboardAwareScrollView style={{ backgroundColor: "#153A59" }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={backToPreviousScreen} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.titleText}>Change Password</Text>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="New Password"
            placeholderTextColor="#EDEDED"
            onChangeText={setPassword}
            value={password}
            autoCapitalize="none"
            secureTextEntry={!isPeekingPassword}
            style={styles.input}
          />
          <MaterialCommunityIcons
            name={isPeekingPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="white"
            style={styles.icon}
            onPress={() => setIsPeekingPassword(!isPeekingPassword)}
          />
          <Text style={styles.subtitle}>Please enter your new password*</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Confirm New Password"
            placeholderTextColor="#EDEDED"
            onChangeText={setConfirmPassword}
            value={confirmPassword}
            autoCapitalize="none"
            secureTextEntry={!isPeekingConfirmPassword}
            style={styles.input}
          />
          <MaterialCommunityIcons
            name={isPeekingPassword ? "eye-off-outline" : "eye-outline"}
            size={22}
            color="white"
            style={styles.icon}
            onPress={() => setIsPeekingPassword(!isPeekingPassword)}
          />
          <Text style={styles.subtitle}>Please confirm your new password*</Text>
        </View>
        {password !== confirmPassword && confirmPassword !== "" && (
          <Text style={styles.errorText}>Passwords do not match</Text>
        )}
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity onPress={handleChangePassword} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Change Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: "20%",
    paddingHorizontal: '5%',
    backgroundColor: '#153A59',
  },
  titleText: {
    color: "white",
    fontSize: 30,
    fontWeight: "600",
    marginBottom: 20,
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#366B7C",
    borderRadius: 100,
    width: 35,
    height: 35,
    marginBottom: 20,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  input: {
    paddingVertical: 10,
    paddingRight: 40, 
    paddingLeft: 10,
    borderBottomColor: "white",
    borderBottomWidth: 1,
    fontSize: 20,
    color: "white",
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: 10, 
},
subtitle: {
color: 'white',
fontSize: 14,
marginTop: 5, 
},
errorText: {
color: 'red',
fontSize: 14,
marginBottom: 10,
},
submitButtonContainer: {
flexDirection: 'row',
justifyContent: 'flex-end',
marginTop: 20,
},
submitButton: {
backgroundColor: '#85E5CA',
padding: 15,
borderRadius: 10,
alignItems: 'center',
width: 200,
},
submitButtonText: {
color: '#153A59',
fontWeight: 'bold',
fontSize: 18,
},
});
