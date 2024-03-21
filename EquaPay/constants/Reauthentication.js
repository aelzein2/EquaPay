import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useHeaderHeight } from "@react-navigation/elements";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function Reauthentication({ navigation, route }) {
  const headerHeight = useHeaderHeight();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);
  const auth = getAuth();
  const { id } = route.params;
  //reauthenticates user so that they are able to change email or password
  const reauthenticateUser = async () => {
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      setIsLoading(true);
      await reauthenticateWithCredential(auth.currentUser, credential);
      console.log("Reauthenticated user");
      setIsLoading(false);
      if (id === 1) {
        navigation.navigate("ChangePassword");
      } else {
        navigation.navigate("ChangeEmail");
      }
    } catch (err) {
      setIsLoading(false);
      console.log(err);
      Alert.alert("Error reauthenticating user");
    }
  };

  const togglePeek = () => {
    setIsPeeking((currentlyPeeking) => !currentlyPeeking); //toggle peeking variable
  };
  const backToPreviousScreen = () => {
    navigation.navigate("Settings");
  };

    return(
      <KeyboardAwareScrollView style={{backgroundColor:'#153A59'}}>
        <View style={[styles.container]}>
          <TouchableOpacity onPress={backToPreviousScreen} style={[styles.backButton]}>
            <AntDesign name="arrowleft" size={24} color="white" />
          </TouchableOpacity>
          <Text style = {[styles.titleText]} >Authentication</Text>
          <View style={[styles.bodyContainer]}>
            <View style={{flex: 1, flexDirection:'row', alignItems:'center'}}>
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
              <MaterialCommunityIcons
                name={isPeeking ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="white"
                style={styles.icon}
                onPress={() => setIsPeeking(!isPeeking)}
              />
            </View>
           
            <Text style={[styles.subtitle]}>Please enter your password for re-authentication*</Text>
          </View>

          <View style={{flexDirection:'row', justifyContent:'flex-end'}}>
            <TouchableOpacity onPress={reauthenticateUser} style={styles.submitButton}>
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
    fontSize: 11,
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

  icon: {
    position: 'absolute',
    right: 10,
    top: 12, 
},
});