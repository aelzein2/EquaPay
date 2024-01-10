import { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Dimensions
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useHeaderHeight } from "@react-navigation/elements";
import { getAuth, updatePassword } from "firebase/auth"
import { AntDesign } from '@expo/vector-icons'

const { width } = Dimensions.get('window');

export default function ChangePassword({ navigation }) {
  const [password, setPassword] = useState("");
  const [isPeeking, setIsPeeking] = useState(false);
  const headerHeight = useHeaderHeight();
  const auth = getAuth();
  //Changes password in firebase
  const handleChangePassword = () => {
    try {
      updatePassword(auth.currentUser, password).then(() => {
        console.log("changed password");
        Alert.alert("Password has been changed");
        navigation.navigate("Settings");
      });
    } catch (err) {
      console.log(err);
      Alert.alert("Error changing password");
    }
  };

  const togglePeek = () => {
    setIsPeeking((currentlyPeeking) => !currentlyPeeking); //toggle peeking variable
  };
  const backToPreviousScreen = () => {
    navigation.navigate("Settings");
}
  return(
    <View style={styles.container}>
        <Text style = {styles.screenTitle} >Settings</Text>
        <TouchableOpacity onPress={backToPreviousScreen} style={styles.backButton}>
          <AntDesign name="arrowleft" size={24} color="black" />
      </TouchableOpacity>
        <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { marginBottom: headerHeight },
        ]}
      >
      <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
        <View>
        <Text>Input password</Text>
          <TextInput
              placeholder={"Enter your password"}
              onChangeText={(password) => setPassword(password)}
              value={password}
              autoCapitalize="none"
              secureTextEntry={!isPeeking}
              canPeek={password.length > 0}
              togglePeek={togglePeek}
              style={styles.textBox}
            />
                  <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleChangePassword} style={styles.button}>
          <Text style={styles.buttonText}>Change Password</Text>
        </TouchableOpacity>
      </View>
        </View>
        </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
        </View>
    )
}

//same css as forgot password
const styles = StyleSheet.create({
      screenTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#355070', 
        marginTop: 70,
        marginBottom: 20,
        fontFamily: 'Helvetica Neue', 
      },
      container: {
        flex: 1,
        justifyContent: 'flex-start', 
        alignItems: 'center',
        backgroundColor: '#e0f4f1',
      },
      backButton: {
        position: 'absolute',
        top: 80, 
        left: 20, // Safe area padding
        zIndex: 10, // Ensures that the touchable is clickable above all other elements
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
  });