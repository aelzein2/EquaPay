import { StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useNavigation } from '@react-navigation/native' // used to navigate between screens

const FriendsPage = () => {
  
  const navigation = useNavigation(); // used to navigate between screens
 
 
// temporary function to redirect to account detail page for testing purposes.
  const redirectAccountDetail = () => {
    navigation.navigate("BottomTab",{screen:'Account'})
  }









  return (
    <View style={styles.container}>
        <Text> Friends </Text>

        <TouchableOpacity style={styles.button} onPress={redirectAccountDetail}>
          <Text style={styles.buttonText}>Account Details</Text>
        </TouchableOpacity>
      
    </View>
  );
};

export default FriendsPage;

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
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
