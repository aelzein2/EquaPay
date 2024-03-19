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
    <KeyboardAwareScrollView style={{backgroundColor:'#153A59'}}>
      <View style={[styles.container]}>
        <TouchableOpacity onPress={backToPreviousScreen} style={[styles.backButton]}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style = {[styles.titleText]} >Change Password</Text>
        <View style={[styles.bodyContainer]}>
          <TextInput
            placeholder="Password"
            placeholderTextColor="#EDEDED"
            onChangeText={(password) => setPassword(password)}
            value={password}
            autoCapitalize="none"
            secureTextEntry={!isPeeking}
            canPeek={password.length > 0}
            togglePeek={togglePeek}
            style={[styles.input]}
          />
          <Text style={[styles.subtitle]}>Please enter new password</Text>
        </View>

        <View style={{flexDirection:'row', justifyContent:'flex-end'}}>
          <TouchableOpacity onPress={handleChangePassword} style={styles.submitButton}>
            <Text style={[styles.submitButtonText]}>Submit</Text>
          </TouchableOpacity> 
        </View>
      </View>
    </KeyboardAwareScrollView>
  )
}

//same css as forgot password
const styles = StyleSheet.create({
  container: {
    backgroundColor:'#153A59',
    flex: 1,
    paddingTop:"20%",
    paddingHorizontal:'5%',
    gap: 12
  },

  titleText:{
    color:"white",
    fontSize: 30,
    fontWeight: "600",
  },

  backButton: {
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#366B7C",
    borderRadius:"100%",
    width: 35,
    height: 35
  },

  bodyContainer:{
    justifyContent:'center',
    alignItems:'flex-start',
    marginTop: 20,
    gap:10
  },

  input: { 
    paddingVertical: 10,
    borderBottomColor:"white",
    borderBottomWidth: 1,
    fontSize: 20,
    width: '100%',
    color:"white",
  },

  subtitle: {
    color: 'white',
    fontSize: 12,
  },

  submitButton: {
    backgroundColor: '#85E5CA', 
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
    width: 150
  },

  submitButtonText: {
    color: '#153A59',
    fontWeight: 'bold',
    fontSize: 18,
  },
});