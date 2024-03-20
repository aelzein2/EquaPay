import React, { useEffect, useState, useCallback} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, SafeAreaView, Modal } from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Ca, Eu, Us, Jp, Gb, Vn } from 'react-native-svg-circle-country-flags'; // country flags for currency
import { lightBlue } from '@mui/material/colors';
import { MaterialIcons } from '@expo/vector-icons'; // Importing MaterialIcons for the garbage can icon
import firebase from 'firebase/app';
import { auth, firestore } from '../firebase'
import { collection, addDoc, serverTimestamp, query, getFirestore, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native' // used to navigate between screens
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

const currencyOptions=[
  {id:'0', currency:'GBP', name:'British Pound', icon: <Gb style={{width:40, height:40}}/>},
  {id:'1', currency:'CAD', name:'Canadian Dollar', icon: <Ca style={{width:40, height:40}}/>},
  {id:'2', currency:'EUR', name:'Euro', icon: <Eu style={{width:40, height:40}}/>},
  {id:'3', currency:'USD', name:'United State Dollar', icon: <Us style={{width:40, height:40}}/>},
]

const CurrencyModal = (props) => {
  const getCurrency = (option) =>{
    props.setFlag(option);
  }
  const onPressItem = (option) =>{
    props.changeModalVisibility(false);
    props.setData(option);
  }
  return(
      <KeyboardAwareScrollView style={{backgroundColor:'#153A59',}}>
        <View style={[styles.container]}>
          <SafeAreaView>
            <TouchableOpacity style={[styles.closeButton]} onPress={() => props.changeModalVisibility(false)}>
              <MaterialIcons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={[styles.titleText]}>Choose a currency</Text>
            <View style={[styles.bodyContainer]}>
              {currencyOptions.map((option, index)=> (
                <TouchableOpacity style={{display:'flex', flexDirection: 'row', gap: 15, alignItems:'center', borderBottomWidth: 1 ,borderBottomColor:'#85E5CA', height:80}} key={index} onPress={() => {getCurrency(option.icon); onPressItem(option.currency)}}>
                  {option.icon}
                  <View style={{display:'flex', justifyContent:'flex-start'}}>
                    <Text style={[styles.optionText]}>{option.currency}</Text>
                    <Text style={[styles.subOptionText]}>{option.name}</Text>
                  </View>
                </TouchableOpacity>          
              ))}
            </View>       
          </SafeAreaView>
        </View>
      </KeyboardAwareScrollView>
  );
};

const AddBillsPage = () => {
  const auth = getAuth();
  const [groupName, setGroupName] = useState('');
  const [currency, setCurrency] = useState('');
  const [flag, setFlag] = useState();
  const [userEmail, setUserEmail] = useState(''); // State to store users email
  const [participants, setParticipants] = useState([{ label: '', value: '' }]);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false); // create modal 
  const [participantModalVisible, setParticipantModalVisible] = useState(false); // create modal 
  const placeholder = []
  const [friends, setFriends] = useState([])
  const navigation = useNavigation(); // used to navigate between screens
  const [currentUser, setCurrentUser] = useState('');
  const [forceUpdate, setForceUpdate] = useState(false);
  const [isOpen, setIsOpen] = useState(true)


  //useEffect to fetch the userEmail to assign with the bill
  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) { // If the user is logged in
        const userDocRef = doc(db, 'users', auth.currentUser.uid); // Reference to the user stored in the database.

        try {
          const docSnap = await getDoc(userDocRef); // fetches the user's data from the database
          if (docSnap.exists()) {
            const userData = docSnap.data(); // Get the user's data
            setUserEmail(userData.email); // Set the user's email state
            console.log("User's email is: ", userData.email);
          } else {
            console.log("User record not found");
            setUserEmail("Email not found");
          }
          
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };

    fetchUserData();
  }, []);

  const handleForceUpdate = () => {
    setForceUpdate(prevState => !prevState);
  };
  useFocusEffect(
    useCallback(() => {
      handleForceUpdate();
    }, [])
  )

  // new use effect to fetch friends in real time for constant updates.
  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
  
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          const q = query(collection(db, "friends"), where("befriender", "==", userData.email));
  
          // real-time listener using onSnapshot
          const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const friendsList = [{ label: `${userData.fullName} (You)`, value: userData.email }];
  
            const friendPromises = querySnapshot.docs.map(async (friendDoc) => {
              const friendData = friendDoc.data();
              const friendEmail = friendData.befriended;
              const friendQuery = query(collection(db, "users"), where("email", "==", friendEmail));
  
              const friendSnapshot = await getDocs(friendQuery);
              if (!friendSnapshot.empty) {
                const friendUser = friendSnapshot.docs[0].data();
                return {
                  label: friendUser.fullName,
                  value: friendUser.email,
                };
              }
              return null; // if friend doesn't exist in users collection for some reason
            });
  
            // resolve all promises and update state
            const friendsFromPromises = await Promise.all(friendPromises);
            // Filter out any null values if a friend wasn't found and append to the initial list
            const updatedFriendsList = friendsList.concat(friendsFromPromises.filter(friend => friend !== null));
            setFriends(updatedFriendsList);
          });
  
          // Cleanup function to unsubscribe from the listener when the component unmounts
          return () => unsubscribe();
        }
      }).catch(error => {
        console.error("Error fetching friends: ", error);
      });
    }
  }, [auth.currentUser, db]);
  

  // adds a new participant to the participants array when the user clicks the "Add participant" button
  const handleAddParticipant = () => {
    setParticipants([...participants, { label: '', value: '' }]);
  };
  
  // updates the participants array when the user selects a participant from the dropdown. filtering out the participant that was just added or selected
  const handleParticipantChange = (selectedItem, index) => {
    const newParticipants = participants.map((participant, idx) => 
      idx === index ? { label: selectedItem.label || '', value: selectedItem.value || '' } : participant
    );
    setParticipants(newParticipants);
    console.log(`Participant added: ${selectedItem.label}`);
  };
  
  
  // deletes a participant from the participants array when the user clicks the garbage can icon
  const handleDeleteParticipant = (index) => {
    setParticipants(participants.filter((_, idx) => idx !== index));
  };

  const handleCreateBill = async () => {
    if (!groupName || !currency || participants.length === 0) {
      Alert.alert('Error', 'Please complete all fields.');
      return;
    }
  
    try {
      const participantValues = participants.map(participant => participant.value); // passes the email of the participant to the participants array for unique identification. cannot send an entire object
      const billData = {
        userEmail,
        groupName,
        currency,
        participants: participantValues,
        timeCreated: new Date().toISOString(),
      };
      const billId = 'bill_' + new Date().getTime(); //  unique ID for the bill
      await AsyncStorage.setItem(billId, JSON.stringify(billData)); // saves the bill data to Async Storage
  
     
      navigation.navigate('BillDetails', { billId: billId }); // navigates to the bill details page and passes the bill ID as a parameter
    } 
     catch (error) {

      console.error("Error saving data: ", error); // logs the error to the console if data cannot be saved to Async Storage
      Alert.alert('Error', 'Error creating bill.');
    }
  };

// Currency Modal Functionalities
  const changeCurrencyModalVisibility = (bool) => {
    setCurrencyModalVisible(bool)
    setIsOpen(false)
  }

  const setCurrencyData = (option) => {
    setCurrency(option)
  }

  const setFlagData = (option) => {
    setFlag(option)
  }  
// structure of the add bill page. 
  return (
    <KeyboardAwareScrollView style={{backgroundColor:'#153A59',}}>

      <View style={[styles.container]}>
        <SafeAreaView>
          <Text style={[styles.titleText]}>Add Bill</Text>
          <View style={[styles.bodyContainer]}>
             {/* Bill Name Section */} 
            <Text style={[styles.subtitle]}>Bill Name</Text>
            <TextInput
              style={[styles.input]}
              placeholder="Court rental"
              placeholderStyle={[styles.placeholder]}
              onChangeText={setGroupName}
              value={groupName}
            />
            <Text style={styles.instructions}>Enter a name for your bill.</Text>
            

            {/* Currency Selector Section */}
            <Text style={[styles.subtitle]}>Currency Selector</Text>
            {/* Currency Modal */}
            <TouchableOpacity style={[styles.selector]} onPress={() => changeCurrencyModalVisibility(true)} placeholder="sss">
                <View style={[styles.currencyContainer]}>
                  {isOpen && 
                    <Text style={[styles.placeholder]} onPress={()=> setIsOpen(false)}>
                      Click to select currency
                    </Text> 
                  }
                
                  {flag} 
                  <Text style={[styles.currencyText]}> {currency} </Text>
                </View>
                
            </TouchableOpacity>
            <Text style={[styles.instructions]}>We'll use it to display amounts.</Text>
            
            
            <Modal
              transparent={false}
              animationType='slide'
              visible={currencyModalVisible}
              onRequestClose={() => setCurrencyModalVisible(!currencyModalVisible)}
            >
              <CurrencyModal 
                changeModalVisibility={changeCurrencyModalVisibility}
                setData={setCurrencyData}  
                setFlag={setFlagData}
              /> 
            </Modal>
            
            

            {/* Participants Section */}
            <Text style={[styles.subtitle]}>Participants</Text>
              {participants.map((participant, index) => (
                <View key={index} style={[styles.participantRow]}>
                  <Dropdown
                    style={[styles.input]}
                    containerStyle={[styles.dropdown]}
                    itemContainerStyle={[styles.dropdown]}
                    selectedTextStyle={[styles.dropdown]}
                    data={friends.filter(friend => 
                      !participants.some(p => p.value === friend.value) || participant.value === friend.value
                    )}
                    placeholder="Select participant"
                    placeholderStyle={[styles.placeholder]}
                    labelField="label"
                    valueField="value"
                    onChange={(item) => handleParticipantChange(item, index)}
                    value={participant.value}  // Use the value from the participant object
                  />
                  <TouchableOpacity 
                    style={[styles.deleteButton]}
                    onPress={() => handleDeleteParticipant(index)}
                  >
                    <MaterialIcons name="delete" size={24} color="white" />
                  </TouchableOpacity>
              </View>
              ))}

            <View >
              <TouchableOpacity style={styles.button} onPress={handleAddParticipant}>
                <MaterialIcons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Create Bill Button */}
            <View style={{display:'flex', justifyContent:'center', alignItems:'flex-end'}}>
              <TouchableOpacity style={[styles.createBillButton]} onPress={handleCreateBill} >
                <Text style={[styles.createBillButtonText]}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAwareScrollView>
   
  );
};

export default AddBillsPage;

// Styles for the add bill page. Its a bit messy but it works. Can be organized later. 
const styles = StyleSheet.create({
  container:{
    backgroundColor:'#153A59',
    flex: 1,
    paddingTop:"20%",
    paddingLeft: "5%",
    paddingRight:"5%",
  },

  titleText:{
    color:"white",
    fontSize: 30,
    fontWeight: "600",
  },

  bodyContainer:{
    marginTop: "15%"
  },

  screenSubTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
    marginTop: 50,
  },

  input: {
    backgroundColor: lightBlue[50],
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 10,
    flex: 1
  },

  dropdown: {
    backgroundColor: lightBlue[50],
    borderRadius: 10,
    fontSize: 18,
   
  },

  selector:{
    backgroundColor: lightBlue[50],
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 10,
    flex: 1,
    flexDirection:'row'
  },
  button: {
    backgroundColor: '#40a7c3',
    display:'flex',
    borderRadius: '100%',
    justifyContent:'center',
    alignItems: 'center',
    width:40,
    height:40
  },
  buttonText:
  {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },  
  subtitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 5,
  },

  instructions: {
  color: 'white',
  fontSize: 14,
  marginBottom: 15,
  },
  
  placeholder:{
    color:'#999', 
    fontSize:17
  },

  participantRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  createBillButton: {
    backgroundColor: '#85E5CA', 
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 25,
    width: 150
  },
  createBillButtonText: {
    color: '#153A59',
    fontWeight: 'bold',
    fontSize: 18,
  },

  optionText:{
    color:'white',
    fontSize: 16,
    fontWeight: 600
  },

  subOptionText:{
    color:'white',
    fontSize: 11,
    fontWeight: 400
  },

  currencyContainer:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent:'flex-start',
    alignItems:'center',
    gap: 12
  },

  currencyText:{
    color:'black',
    fontSize: 18,
    fontWeight: 600
  },

  closeButton: {
    justifyContent:'center',
    alignItems:'center',
    marginBottom: 20,
    backgroundColor:"#366B7C",
    borderRadius:"100%",
    width: 35,
    height: 35
  
  },
});