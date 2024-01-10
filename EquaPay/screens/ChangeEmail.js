import { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  TextInput,
  TouchableOpacity
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useHeaderHeight } from "@react-navigation/elements";
import { getAuth, updateEmail } from "firebase/auth"
import { AntDesign } from '@expo/vector-icons'

const { width } = Dimensions.get('window');

export default function ChangeEmail({ navigation }) {
  const [email, setEmail] = useState("");
  const headerHeight = useHeaderHeight();
  const auth = getAuth();
  const handleChangeEmail = async () => {
    try {
      updateEmail(auth.currentUser, email).then(() => {
        console.log("changed email");
        Alert.alert("Email has been changed");
        navigation.navigate("Settings");
      });
    } catch (err) {
      console.log(err);
      Alert.alert("Error changing email");
    }
  };
  const backToPreviousScreen = () => {
    navigation.navigate("Settings");
}
  return(
    <View style={styles.container}>
        <Text style = {styles.screenTitle} >Change Email</Text>
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
        <Text>Input email</Text>
          <TextInput
              placeholder={"Enter your email"}
              onChangeText={(email) => setEmail(email)}
              value={email}
              autoCapitalize="none"
            />
                  <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleChangeEmail} style={styles.button}>
          <Text style={styles.buttonText}>Change Email</Text>
        </TouchableOpacity>
      </View>
        </View>
        </TouchableWithoutFeedback>
        </KeyboardAwareScrollView>
        </View>
    )
}

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