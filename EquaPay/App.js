import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import HomePage from './screens/HomePage';
import LoadingScreen from './screens/LoadingScreen';

const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen options={{headerShown: false,}} name = "LoadingScreen" component={LoadingScreen} />
      <Stack.Screen name="Login" component={Login} />
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
