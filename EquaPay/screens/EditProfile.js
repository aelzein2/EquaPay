
import { 
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Dimensions } from "react-native";
import { useState } from "react";
import { useNavigation } from '@react-navigation/native' // used to navigate between screens
import { addDoc, collection, doc, setDoc } from 'firebase/firestore'; // used for firestore

const EditProfile = () => {

    const [name, setName] = useState(''); // states for name
    const [password, setPassword] = useState(''); // states for password
    const navigation = useNavigation(); // used to navigate between screens
 
 
// temporary function to redirect to account detail page for testing purposes.
  const redirectAccountDetail = () => {
    navigation.navigate("BottomTab",{screen:'Account'})
  }


  return (
    <View style={[styles.container]}>
        <View style = {{flexDirection: "column", marginBottom: 6}}>
            <Text style = {styles.name}>Name</Text>
        </View>
        <TextInput
                placeholder="Abdelrahman"
                placeholderTextColor="white"
                value={name}
                onChangeText={text => setName(text)}
                style={styles.input}
            />

        <TouchableOpacity style={[styles.button]} onPress={redirectAccountDetail}>
          <Text style={[styles.buttonText]}>SAVE</Text>
        </TouchableOpacity>
      
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({

  container:{
    backgroundColor:'#153A59',
    flex: 1,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  
  button: {
    backgroundColor: '#40a7c3', // Light blue
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 500,
  },
  name: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
