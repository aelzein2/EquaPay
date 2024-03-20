import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './screens/Login';
import Signup from './screens/Signup';
import ViewBills from './screens/ViewBills';
import ViewBillsSeeAll from './screens/ViewBillsSeeAll';
import ViewBillsSeeAllOthers from './screens/ViewBillsSeeAllOthers';
import LoadingScreen from './screens/LoadingScreen';
import BottomTab from './screens/BottomTab';
import UserAccount from './screens/UserAccount';
import EditProfile from './screens/EditProfile'; //TESTING PAGE !!!!!!!!!!!!!!!!!
import Settings from './screens/Settings';
import Reauthentication from './constants/Reauthentication';
import ChangeEmail from './screens/ChangeEmail';
import ChangePassword from './screens/ChangePassword';
import AddBillsPage from './screens/AddBillsPage';
import BillDetails from './screens/BillDetails';
import { StripeProvider } from '@stripe/stripe-react-native';
import NotificationsPage from './screens/NotificationPage';
import { LogBox } from 'react-native';



const Stack = createNativeStackNavigator();
const stripePublishableKey = 'pk_test_51OsL50LoVnwBJvv3xXEPKGByLPCSwEnQqvzUiOMMBt0zCxbPzLfeuAh04kguoqLmq97GMYtWUXIUwnzXqw4MCLrR00j9gIAPDL'


export default function App() {
  LogBox.ignoreAllLogs();

  return (
    <StripeProvider publishableKey={stripePublishableKey}>
    <NavigationContainer>
    <Stack.Navigator>
      
      <Stack.Screen options={{headerShown: false,}} name = "LoadingScreen" component={LoadingScreen} />
      <Stack.Screen options = {{headerShown : false}} name="Login" component={Login} />
      <Stack.Screen options={{headerShown: false,}} name = "BottomTab" component={BottomTab} />
      <Stack.Screen options={{headerShown: false,}} name = "UserAccount" component={UserAccount} />
      <Stack.Screen options = {{headerShown: false,}} name = "Settings" component={Settings} />
      <Stack.Screen options = {{headerShown: false,}} name = "Reauthentication" component={Reauthentication} />
      <Stack.Screen options = {{headerShown: false,}} name = "ChangePassword" component={ChangePassword} />
      <Stack.Screen options = {{headerShown: false,}} name = "ChangeEmail" component={ChangeEmail} />
      <Stack.Screen options = {{headerShown : false}} name="Signup" component={Signup} />
      <Stack.Screen options={{headerShown: false,}} name = "EditProfile" component={EditProfile} />
      <Stack.Screen options={{headerShown: false,}} name = "AddBillsPage" component={AddBillsPage} />
      <Stack.Screen options={{headerShown: false,}} name = "BillDetails" component={BillDetails} />
      <Stack.Screen options={{headerShown: false,}} name = "NotificationsPage" component={NotificationsPage} />

      <Stack.Screen options={{headerShown: false,}} name = "ViewBills" component={ViewBills} />
      <Stack.Screen options={{headerShown: false,}} name = "ViewBillsSeeAll" component={ViewBillsSeeAll} />
      <Stack.Screen options={{headerShown: false,}} name = "ViewBillsSeeAllOthers" component={ViewBillsSeeAllOthers} />
      {/* <Stack.Screen name = "Homepage" component={HomePage} /> */}
      {/* <Stack.Screen options = {{headerShown : false}} name = "Homepage" component={HomePage} />
      <Stack.Screen options={{headerShown: false,}} name = "UserAccount" component={UserAccount} /> */}
    </Stack.Navigator>
  </NavigationContainer>
  </StripeProvider>
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