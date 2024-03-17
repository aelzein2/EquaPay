import { StyleSheet, Text, View, Image, Button, Pressable, TouchableOpacity } from 'react-native'
import * as React from "react"
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import Logo from "../assets/img/logo-removebg.png";
import Union from "../assets/img/Union.svg";
import { LinearGradient as Gradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg"

import { useFonts } from 'expo-font';


const LoadingScreen= () => {

  const navigation = useNavigation();
  return (
    <View style={[styles.container]}>
      <Image source={Logo} 
        style={{
          resizeMode:'contain',
          width: 200,
          height: 200,
        }}/>
      <Union/>
      
      <View style={[styles.buttonContainer]}>
        <TouchableOpacity style={[styles.button]} onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.baseText]}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button]} onPress={() => navigation.navigate('Signup')}>
          <Text style={[styles.baseText]}>Sign up</Text>
        </TouchableOpacity>
      </View>
      
      
      
    </View>
  )
}

export default LoadingScreen

const styles = StyleSheet.create({
    container: {
      flex:1,
      flexDirection: 'column',
      justifyContent:'space-between',
      alignItems:'center',
      overflow:'none',
      backgroundColor:'FFFBFB',
      paddingTop:100,
      position:'relative',
      overflow:"scroll"
    },

    curve: {
      width: '100%',
      height: '100%',
      marginTop: 80,
      alignItems:'center',
      justifyContent:'center',
      padding:'auto',
    },

    buttonContainer:{
      position:"absolute",
      display:"flex",
      alignItems:'center',
      margin: "135%",
      justifyContent:'space-between',
      gap: 48
    },
    button:{
      borderRadius: 15,
      backgroundColor:'#85E5CA',
      width: 211,
      height: 45,
      alignItems:'center',
      justifyContent:'center',
      alignItems:'center',
    },

    baseText: {
      color:'#153A59',
      fontSize: 25,
      fontWeight: 500
    },



    
})