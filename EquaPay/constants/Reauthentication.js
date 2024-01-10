import { useState } from "react"
import { View, Text, StyleSheet, Alert, TouchableWithoutFeedback, Keyboard, TouchableOpacity, TextInput, Dimensions} from "react-native"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useHeaderHeight } from "@react-navigation/elements";
import { getAuth, reauthenticateWithCredential, EmailAuthProvider} from "firebase/auth";
import { AntDesign } from '@expo/vector-icons'

const { width } = Dimensions.get('window');

export default function Reauthentication({navigation, route}){
    const headerHeight = useHeaderHeight();
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isPeeking, setIsPeeking] = useState(false)
    const auth = getAuth();
    const {id}=route.params
    //reauthenticates user so that they are able to change email or password
    const reauthenticateUser = async () => {
        try {
            const credential = EmailAuthProvider.credential(
                auth.currentUser.email,
                password)
                setIsLoading(true)
            await reauthenticateWithCredential(auth.currentUser, credential)
            console.log("Reauthenticated user")
            setIsLoading(false)
            if(id === 1){
            navigation.navigate("ChangePassword")
            }else{
              navigation.navigate("ChangeEmail")
            }
        } catch (err) {
          setIsLoading(false)
            console.log(err);
            Alert.alert("Error reauthenticating user")
        }
    }

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
        <TouchableOpacity onPress={reauthenticateUser} style={styles.button}>
          <Text style={styles.buttonText}>Authenticate</Text>
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