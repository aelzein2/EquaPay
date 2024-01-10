import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import Signup from './screens/Signup';
import HomePage from './screens/HomePage';
import LoadingScreen from './screens/LoadingScreen';
import BottomTab from './screens/BottomTab';
import UserAccount from './screens/UserAccount';
import Settings from './screens/Settings';
import Reauthentication from './constants/Reauthentication';
import ChangeEmail from './screens/ChangeEmail';
import ChangePassword from './screens/ChangePassword';

const Stack = createNativeStackNavigator();


export default function App() {
  
  /* as of right now, you have to manually order the stack screens to test functionalities.
    testing signup requires signup screen to be first. testing login/forgot password requires
    login scren to be first. */

  /* All main pages are inside the "BottomTab  nested stack screens, 
    therefore you don't need to call new screen inside the Stack Navigator" */

  return (
    <NavigationContainer>
    <Stack.Navigator>
      
      <Stack.Screen options={{headerShown: false,}} name = "LoadingScreen" component={LoadingScreen} />
      <Stack.Screen options = {{headerShown : false}} name="Login" component={Login} />
      <Stack.Screen options = {{headerShown : false}} name = "Homepage" component={HomePage} />
      <Stack.Screen options={{headerShown: false,}} name = "UserAccount" component={UserAccount} />
      <Stack.Screen options = {{headerShown: false,}} name = "Settings" component={Settings} />
      <Stack.Screen options = {{headerShown: false,}} name = "Reauthentication" component={Reauthentication} />
      <Stack.Screen options = {{headerShown: false,}} name = "ChangePassword" component={ChangePassword} />
      <Stack.Screen options = {{headerShown: false,}} name = "ChangeEmail" component={ChangeEmail} />
      <Stack.Screen options = {{headerShown : false}} name="Signup" component={Signup} />
      <Stack.Screen options={{headerShown: false,}} name = "BottomTab" component={BottomTab} />
      {/* <Stack.Screen name = "Homepage" component={HomePage} /> */}
      {/* <Stack.Screen options = {{headerShown : false}} name = "Homepage" component={HomePage} />
      <Stack.Screen options={{headerShown: false,}} name = "UserAccount" component={UserAccount} /> */}
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