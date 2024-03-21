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
import { getAuth, updateEmail, verifyBeforeUpdateEmail } from "firebase/auth"
import { AntDesign } from '@expo/vector-icons'

const { width } = Dimensions.get('window');

export default function ChangeEmail({ navigation }) {
  const [email, setEmail] = useState("");
  const headerHeight = useHeaderHeight();
  const auth = getAuth();
  const handleChangeEmail = async () => {
    try {
      verifyBeforeUpdateEmail(auth.currentUser, email).then(() => {
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
    // <View style={styles.container}>
    //     <Text style = {styles.screenTitle} >Change Email</Text>
    //     <TouchableOpacity onPress={backToPreviousScreen} style={styles.backButton}>
    //       <AntDesign name="arrowleft" size={24} color="black" />
    //   </TouchableOpacity>
    //     <KeyboardAwareScrollView
    //     contentContainerStyle={[
    //       styles.contentContainer,
    //       { marginBottom: headerHeight },
    //     ]}
    //   >
    //   <TouchableWithoutFeedback
    //       onPress={() => {
    //         Keyboard.dismiss();
    //       }}
    //     >
    //     <View>
    //     <Text>Input email</Text>
    //       <TextInput
    //           placeholder={"Enter your email"}
    //           onChangeText={(email) => setEmail(email)}
    //           value={email}
    //           autoCapitalize="none"
    //         />
    //               <View style={styles.buttonContainer}>
    //     <TouchableOpacity onPress={handleChangeEmail} style={styles.button}>
    //       <Text style={styles.buttonText}>Change Email</Text>
    //     </TouchableOpacity>
    //   </View>
    //     </View>
    //     </TouchableWithoutFeedback>
    //     </KeyboardAwareScrollView>
    //     </View>

    <KeyboardAwareScrollView style={{backgroundColor:'#153A59'}}>
    <View style={[styles.container]}>
      <TouchableOpacity onPress={backToPreviousScreen} style={[styles.backButton]}>
        <AntDesign name="arrowleft" size={24} color="white" />
      </TouchableOpacity>
      <Text style = {[styles.titleText]} >Change Email</Text>
      <View style={[styles.bodyContainer]}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#EDEDED"
          onChangeText={(email) => setEmail(email)}
          value={email}
          autoCapitalize="none"
          style={[styles.input]}
        />
        <Text style={[styles.subtitle]}>Please enter a new email*</Text>
      </View>

      <View style={{flexDirection:'row', justifyContent:'flex-end'}}>
        <TouchableOpacity onPress={handleChangeEmail} style={styles.submitButton}>
          <Text style={[styles.submitButtonText]}>Change Email</Text>
        </TouchableOpacity> 
      </View>
    </View>
  </KeyboardAwareScrollView>
    )
}

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