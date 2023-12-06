import { StyleSheet, Text, View, Image, Button, Pressable, TouchableOpacity } from 'react-native'
import * as React from "react"
import { useCallback } from 'react';

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

const LoadingScreen= ({ navigation }) => {
  const [fontsLoaded] = useFonts({
    'Varela-Round': require('../assets/font/Varela-Round.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <View style={[styles.container]}>
      <Gradient
        // Background Linear Gradient
        colors={['rgba(246, 249, 251, 0.45)', 'transparent']}
        style={styles.background}
      />
    
      <Image source={Logo} 
        style={{
          resizeMode:'contain',
          width: 150,
          height: 150,
        }}/>
      <Union/>
        <TouchableOpacity style={[styles.buttonLogin]} onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.baseText]} >Log in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonSignup]} onPress={() => navigation.navigate('Signup')} >
          <Text style={[styles.baseText]} >Sign up</Text>
        </TouchableOpacity>
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
      height:'100%',
      width:'100%',
      overflow:'none',
      backgroundColor:'E7EFF6',
      paddingTop:100,
      position:'relative'
    },

    background: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      height: 400,
    },

    curve: {
      width: '100%',
      height: '100%',
      marginTop: 80,
      alignItems:'center',
      justifyContent:'center',
      padding:'auto',
    },

    buttonLogin: {
      borderRadius: 50,
      backgroundColor:'#173A5A',
      width: 211,
      height: 52,
      alignItems:'center',
      position:'absolute', 
      marginTop:500,
      justifyContent:'center',
      alignItems:'center'
    },

    buttonSignup: {
      borderRadius: 50,
      backgroundColor:'#173A5A',
      width: 211,
      height: 52,
      alignItems:'center',
      position:'absolute', 
      marginTop:570,
      justifyContent:'center',
      alignItems:'center'
    },
    baseText: {
      fontFamily: 'Varela-Round',
      color:'white',
      fontSize: 30,
      fontWeight: 400
    },



    
})