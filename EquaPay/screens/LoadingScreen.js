import { StyleSheet, Text, View, Image, Button } from 'react-native'
import * as React from "react"

import Logo from "../assets/img/logo-removebg.png";
import { LinearGradient as Gradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg"
import { useFonts } from 'expo-font';

const LoadingScreen= () => {

  const [fontsLoaded] = useFonts({
    'Varela-Round': 'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap',
  });

  if (!fontsLoaded) {
    return null;
  }
  return (
    <View style={[styles.container]}>
      <Gradient
        // Background Linear Gradient
        colors={['rgba(231, 239, 246, 1)', 'transparent']}
      />
    
      <Image source={Logo} 
        style={{
          resizeMode:'contain',
          width: 150,
          height: 150,
        }}/>

    
      <Svg
        style={[styles.curve]}
        xmlns="http://www.w3.org/2000/svg"
        width={420}
        height={478}
        fill="none"
        
      >
        <Path
          fill="url(#a)"
          fillRule="evenodd"
          d="M420 202.829c8.369-14.964 13-30.683 13-46.54C433 79.355 323.98 0 208 0S-17 73.693-17 150.626c0 18.227 6.119 36.59 17 54.001v359.614h420V202.829Z"
          clipRule="evenodd"
        />
        <Defs>
          <LinearGradient
            id="a"
            x1={208}
            x2={208}
            y1={0}
            y2={564}
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor="#32DDAD" />
            <Stop offset={1} stopColor="#D9D9D9" stopOpacity={0} />
          </LinearGradient>
        </Defs>

        <Button title='Login' style={[styles.button]}>Login</Button>
        <Button title='SignUp' style={[styles.button]}></Button>
      </Svg>
    </View>
  )
}

export default LoadingScreen

const styles = StyleSheet.create({
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent:'space-between',
      alignItems:'center',
      gap:'120vh',
      height:'100%',
      width:'100%',
      overflow:'none'
    },

    curve: {
      width: '100%',
      height: '100%',
      marginTop: 50
    },

    button: {
      fontFamily: 'Varela Round'
    }

    
})