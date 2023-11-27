import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import Signup from './screens/Signup';
import HomePage from './screens/HomePage';

const Stack = createNativeStackNavigator();

export default function App() {
  
  /* as of right now, you have to manually order the stack screens to test functionalities.
    testing signup requires signup screen to be first. testing login/forgot password requires
    login scren to be first. */

  return (
    <NavigationContainer>
      <Stack.Navigator>
      <Stack.Screen options = {{headerShown : false}} name="Signup" component={Signup} />
      <Stack.Screen options = {{headerShown : false}} name="Login" component={Login} />
      <Stack.Screen name = "Homepage" component={HomePage} />
    </Stack.Navigator>
  </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
