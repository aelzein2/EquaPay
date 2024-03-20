import React, { useState, useEffect, useCallback } from 'react';
import { 
  getFirestore, 
  doc, 
  addDoc, 
  deleteDoc, 
  collection, 
  Timestamp, 
  updateDoc, 
  arrayUnion, 
  getDocs, 
  query, 
  where
} from 'firebase/firestore';
import { 
  ActionSheetIOS, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  Image,
  SafeAreaView 
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import { AntDesign, MaterialIcons } from '@expo/vector-icons'; // used for the icons
import { lightBlue } from '@mui/material/colors';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { auth, firestore } from '../firebase' // used for authentication
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { stepButtonClasses } from '@mui/material';
import { Divider } from '@rneui/base';


const db = getFirestore();

// Bill details that fetches this information from async storage
const BillDetails = ({ route }) => {
  const { billId } = route.params; // Fetch the bill ID from the route params from the previous screen. This will be used to detect the corresponding data that is stored in Async Storage
  const [billName, setBillName] = useState('');
  const [currency, setBillCurrency] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(true);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [participantAmounts, setParticipantAmounts] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [billTotalAmount, setBillTotalAmount] = useState('');
  const [description, setDescription] = useState(''); // Description of the bill 
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const [splitType, setSplitType] = useState('');
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const navigation = useNavigation();
  const [amountValidationMessage, setAmountValidationMessage] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [userEmail, setUserEmail] = useState(''); // State to store users email
  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [isOpenSplit, setIsOpenSplit] = useState(false)
  const auth = getAuth();

  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  
  const cameraUpload = async () => {
    try {
      await ImagePicker.requestCameraPermissionsAsync();
      let result = await ImagePicker.launchCameraAsync({
        allowsEditing: false
      });
    
    if (!result.canceled){
      // save image
      setImage(result.assets[0].uri);
    }
      
    }catch (error) {

    }
  };

  const pickImageOptions = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', 'Camera', 'Photo Library', 'Remove'],
        destructiveButtonIndex: 3,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex == 1){
          cameraUpload();
        }else if(buttonIndex == 2){
          pickImage();
        }else if(buttonIndex == 3){
          setImage(null);
        }
      },
    );
  };

  const uploadImage = async (dbID) => {
    if (image !== null){
      try {
        const { uri } = await FileSystem.getInfoAsync(image);
        const blob = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => {
            resolve(xhr.response);
          };
          xhr.onerror = (error) => {
            reject(new TypeError('Network request failed'));
          };
          xhr.responseType = 'blob';
          xhr.open('GET', uri, true);
          xhr.send(null);
        });
  
        const filename = dbID;
        const storage = getStorage();
        const storageRef = ref(storage, "images/" + filename);
  
        uploadBytes(storageRef, blob).then((snapshot) => {
          console.log('Uploaded Image!');
          console.log(filename);
          console.log(storageRef);
          console.log(getDownloadURL(storageRef));
        });
  
  
        setImage(null);
      }catch (error){
        console.error(error);
      }
    }
    
  };

  // navigate back to the previous screen
  const backToPreviousScreen = () => {
    navigation.navigate("Add Bills");
  }


  // saves the bill so it can be reached later
  const handleSave = () => {
  };


  // deletes the current bill and redirects back to the homepage. bill gets deleted from AsyncStorage
  const handleDelete = async () => {

    try {
      await AsyncStorage.removeItem(billId);
      console.log('Bill deleted successfully!');
      navigation.navigate("View Bills"); // Redirect to the desired screen after deletion
    }
    catch (error) {
      console.error('Error deleting bill: ', error);
      Alert.alert('Error', 'Error deleting bill.'); // Show an error message if deletion fails
    }
  };


  // shows a confirmation message before deleting the bill
  const handleDeleteConfirmation = () => {
    Alert.alert(
      "Delete Bill",
      "Are you sure you want to delete this bill?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { text: "OK", onPress: () => handleDelete() }
      ]
    );
  };

  // Used to validate the bill amount and the total amount of the participants
  useEffect(() => {

    if (splitType === 'equal') {
      setAmountValidationMessage(''); // Clear the amount validation message if the split type is equal
      return;
    }

    const calculateTotalParticipantAmounts = () => {

      return selectedParticipants.reduce((total, participant) => { // reduce function to sum the amounts of the selected participants only
        const amount = parseFloat(participantAmounts[participant] || 0); // if the amount is not a number, it is set to 0
        return total + amount; // returns the total amount of the selected participants
      }, 0);
    };

    const totalParticipantAmounts = calculateTotalParticipantAmounts(); // total amount of the selected participants
    const billAmount = parseFloat(billTotalAmount); // total amount of the bill itself

    // Update validation message condition
    if (selectedParticipants.length > 0) { // if there are participants selected
      if (!isNaN(billAmount) && billAmount > 0 && totalParticipantAmounts !== billAmount) { // if the bill amount is a number and greater than 0 and the total amount of the participants does not match the bill amount
        setAmountValidationMessage(`The sum of selected participant amounts $${totalParticipantAmounts.toFixed(2)} does not match the total bill amount $${billTotalAmount}.`); // set the amount validation message. indicates that that there is no match between the bill amount and the participant amounts
      } else {
        setAmountValidationMessage(''); // Clear the amount validation message if the amounts match
      }
    } else {
      setAmountValidationMessage(''); // Clear the amount validation message if no participants are selected
    }
  }, [participantAmounts, selectedParticipants, billTotalAmount]);



  // Use effect to deal with EQUAL splits. I used this instead of a function as useEffects just work better with automatic changes
  // and it minimizes the need for more function references if a seperate function was used. again, a seperate function can be used, but this is just a more efficient way to do it
  useEffect(() => {
    if (splitType === 'equal' && selectedParticipants.length > 0 && billTotalAmount) {
      const totalAmount = parseFloat(billTotalAmount); // gets the total amount
      const equalAmount = totalAmount / selectedParticipants.length; // divides the total amount of the bill by how many participants are selected
      const updatedAmounts = {}; // used to store the updated amounts

      selectedParticipants.forEach(participant => {
        updatedAmounts[participant] = equalAmount.toFixed(2); // Keeping two decimal places for currency
      });

      setParticipantAmounts(updatedAmounts); // Update the participant amounts with the equal split amounts

      // Console log to test the split amounts for EQUAL SPLIT
      console.log("Updated participant amounts for 'Equal Split':", updatedAmounts);
    }
  }, [splitType, selectedParticipants, billTotalAmount]); // React to changes in these values



  // use Effect used to deal with PERCENTAGE splits
  useEffect(() => {
    if (splitType === 'percentage' && selectedParticipants.length > 0 && billTotalAmount) {
      const totalAmount = parseFloat(billTotalAmount); // gets the total amount
      let totalPercentage = 0;

      // Calculates the total percentage based on user inputs
      selectedParticipants.forEach(participant => {
        const percentage = parseFloat(participantAmounts[participant] || 0);
        totalPercentage += percentage;
      });

      // Checks if the total percentage equals 100
      if (totalPercentage !== 100) {
        setAmountValidationMessage(`Total percentage must equal 100%. Current total: ${totalPercentage}%`); // percentage doesnt add up to 100%
      } else {
        setAmountValidationMessage(''); // if it does add up to 100%, clear the message
      }

      let calculatedAmounts = {}; // stores the calculated amounts
      if (totalPercentage === 100) { // if the total percentage equals 100%
        selectedParticipants.forEach(participant => { // for every participant, calculate the amount based on the percentage
          const percentage = parseFloat(participantAmounts[participant] || 0); // if the percentage is not a number, it is set to 0
          const amount = (totalAmount * percentage) / 100; // calculates the amount based on the percentage
          calculatedAmounts[participant] = amount.toFixed(2); // Keeping two decimal places for currency
        });
        console.log("Calculated amounts based on percentages:", calculatedAmounts); // console log to see the amount distributed based on percentages
      }
    }
  }, [splitType, selectedParticipants, billTotalAmount, participantAmounts]); // React to changes in these values



  // functionality used to distribute the amount based on CUSTOM AMOUNT SPLIT type.
  useEffect(() => {
    if (splitType === 'amount' && selectedParticipants.length > 0 && billTotalAmount) {
      const totalBillAmount = parseFloat(billTotalAmount); // gets the total bill amount

      // Initialize variables for calculations and validation
      let totalEnteredAmounts = 0;
      let calculatedAmounts = {}; // To store entered amounts for logging
      let allParticipantsHaveAmount = true; // Flag to check if all participants have an amount greater than 0

      selectedParticipants.forEach(participant => {
        const amount = parseFloat(participantAmounts[participant] || 0);
        totalEnteredAmounts += amount;
        calculatedAmounts[participant] = amount.toFixed(2); // Store for logging

        // Check if any participant's amount is 0 or not entered
        if (amount <= 0) {
          allParticipantsHaveAmount = false; // Set flag to false if any participant has no amount entered
        }
      });

      // Handle validation based on total amounts and individual participant contributions
      if (!allParticipantsHaveAmount) {
        // If any participant has an amount of 0 or not entered
        setAmountValidationMessage('Every selected participant must have an amount greater than 0.');
      } else if (totalEnteredAmounts !== totalBillAmount) {
        // If the total of entered amounts doesn't match the total bill amount
        setAmountValidationMessage(`The total of entered amounts $${totalEnteredAmounts.toFixed(2)} does not match the total bill amount $${totalBillAmount.toFixed(2)}.`);
      } else {
        // If all validations pass
        setAmountValidationMessage('');
      }

      // Log the entire calculatedAmounts object to see the distribution
      console.log("Updated participant amounts for 'Amount Split':", calculatedAmounts);
    }
  }, [splitType, selectedParticipants, billTotalAmount, participantAmounts]);


// used to fetch bill data from async storage. it also fetches participants full names from the database 
useEffect(() => {
  const fetchBillData = async () => {
    setIsLoading(true);

    try {
      const storedBillData = await AsyncStorage.getItem(billId);
      if (storedBillData !== null) {
        const data = JSON.parse(storedBillData);
        setBillName(data.groupName);
        setBillCurrency(data.currency);
        setParticipants(data.participants); // Set all participants initially
        setIsLoading(false);

        const usersRef = collection(db, "users");
        const currentUserEmail = auth.currentUser.email.toLowerCase(); // Current user's email in lowercase

        const fetchedOptions = [];
        let otherParticipants = []; // List for bill distribution excluding current user

        await Promise.all(data.participants.map(async (participant) => {
          const q = query(usersRef, where("email", "==", participant));
          const querySnapshot = await getDocs(q);
          const participantData = querySnapshot.docs[0]?.data();

          if (participant.toLowerCase() === currentUserEmail) {
            // Include only the current user in the dropdown options
            fetchedOptions.push({
              label: `${participantData.fullName} (You)`,
              value: participant
            });
          } else {
            // Add other participants to a separate list for bill distribution
            otherParticipants.push({
              label: participantData ? participantData.fullName : "Unknown",
              value: participant
            });
          }
        }));

        setDropdownOptions(fetchedOptions); // Set dropdown options to include only the current user
        setParticipants(otherParticipants); // Update participants list to exclude the current user
      } else {
        console.log('No data available!');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching bill data and participant names: ', error);
      setIsLoading(false);
    }
  };

  fetchBillData();
}, [billId, auth.currentUser.email]);



  
  // Maps the participants to the structure of the drop down menu. CAN DELETE THIS LATER, may want to keep it for now in case something doesnt work
  const participantOptions = participants.map((participant) => ({
    label: participant,
    value: participant, // Use the participant's name as the value
  }));


  // used to select participants on who the bill is paid for
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // Function that toggles the selection of participants for the bill in the "Paid For section"
  const toggleParticipantSelection = (participant) => {
   console.log('Selected participant: ', participant); // used to see if its actually referencing the emails internally and not just names
    setHasInteracted(true);
    const updatedSelectedParticipants = selectedParticipants.includes(participant) // if the participant is already selected
      ? selectedParticipants.filter(p => p !== participant) // remove the participant from the selected participants
      : [...selectedParticipants, participant]; // if not, participant is added to the selected participants

    setSelectedParticipants(updatedSelectedParticipants); // update the selected participants
    setShowValidationMessage(updatedSelectedParticipants.length === 0); // show validation message if no participants are selected. has to have at least one participant selected
  };


  // Function that stores and updates the amount of the total bill.
  const handleBillAmountChange = (amount) => {

    if (isNaN(amount) || amount.trim() === '') {
      alert('Please enter a valid number.');
      setBillTotalAmount(''); // clears the box to an empty string so the user can just enter a new value
    }
    else {
      setBillTotalAmount(amount); // Update with the valid amount
    }
  };


  // Function that handles the split type dropdown and clears amounts to start fresh
  const handleDropdownChange = (item) => {
    console.log('Dropdown selection changed: ', item.value); // console log to see if the dropdown selection is being changed
    setSplitType(item.value);
    setParticipantAmounts({}); // clears the amounts when the split type is changed
    forceUpdate(); // Force the component to re-render
  };

  // Conditional console logs or testing purposes
  useEffect(() => {
    if (!isLoading) {  // if the data is loaded

      // console logs the bill name, currency, and participants for testing purposes to see if the data is the same as the one entered in the previous screen
      console.log('Bill name: ', billName);
      console.log('Bill currency: ', currency);
      console.log('Bill participants: ', participants);
      console.log('Email: ', userEmail);

    }
  }, [isLoading, billName, currency, participants, userEmail]); // only runs when the data is loaded

  if (isLoading) {
    return <Text>Loading...</Text>; // Display loading message --> can delete later, was just added for debugging
  }


  // function that handles the date picker
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios')
    setDate(currentDate);
  };


  // Function to update the amount for a participant that is selected
  const handleAmountChange = (participant, amount) => {
    console.log("Updating amount for participant: ", participant, " with amount: ", amount); // console log to see if the amounts are being updated correctly
    setParticipantAmounts(prevAmounts => { // sets the participant amounts
      const updatedAmounts = { ...prevAmounts };  // updates the amounts
      updatedAmounts[participant] = amount;
      return updatedAmounts;
    });
  };


  // Function that stores the entered bill details into the database. Probably the most important function here.
  const handleSubmitBill = async () => {
    // Validation to ensure all required fields are filled out
    if (!description || !billTotalAmount || !billName || selectedParticipants.length === 0 || !selectedParticipant || !splitType || !date) {
      Alert.alert('Error', 'Please complete all required fields.');
      return;
    }
  
    // Additional validation for participant amounts if split type is not 'equal'
    let amountsValidationFailed = false;
    if (splitType !== 'equal') {
      for (const participant of selectedParticipants) {
        if (!participantAmounts[participant] || participantAmounts[participant] <= 0) {
          amountsValidationFailed = true;
          break; // Exit the loop early if any validation fails
        }
      }
  
      if (amountsValidationFailed) {
        Alert.alert('Error', 'Please ensure all selected participants have valid amounts.');
        return;
      }
    }
    const billDeadlineTimestamp = Timestamp.fromDate(date); // deadline converted to a timestamp type since database field stores it in this type

    // this is to make sure it will store the correct amounts for any split type for each participant
    let participantsWithAmounts = selectedParticipants.map(participant => {
      let amount = parseFloat(participantAmounts[participant] || 0);

      // If the split type is 'percentage', convert the percentage to dollar amount ---> can also have it so it stores the percentage instead 
      if (splitType === 'percentage') {
        amount = parseFloat(billTotalAmount) * (amount / 100); // converts the percentage to a dollar amount. Every other split type stores the $ amount so its better to keep it consistent.
      }

      return { // returns the participant and the amount they were assigned
        id: participant,
        amount: amount.toFixed(2), // Ensuring amount is formatted as currency
        paidStatus: false
      };
    });

    // attempts to store the bill details in the database, with all details needed
    try {
      // all bill form data is stored in the database in 'billsCreated' table. 
      let participantEmails = ["noreplyequapay@gmail.com"];

      for (let i = 0; i < participantsWithAmounts.length; i++){
        participantEmails.push(participantsWithAmounts[i].id);

        if (participantsWithAmounts[i].id === selectedParticipant){
          participantsWithAmounts[i].paidStatus = true
          console.log("SETTTTTT")
        }
        
      }


      const docRef = await addDoc(collection(db, 'billsCreated'), {
        description: description,
        userEmail: userEmail,
        billName: billName,
        billTotalAmount: parseFloat(billTotalAmount).toFixed(2),
        currency: currency,
        participants: participantsWithAmounts, // stores selected participants with their amounts
        billOwner: selectedParticipant,
        billDeadline: billDeadlineTimestamp,
        billSplitType: splitType,
        billCreated: Timestamp.now()
      });

      await addDoc(collection(db, 'mail'), {
        to: participantEmails,
        message: {
          subject: 'ALERT: YOU HAVE BEEN ADDED TO A BILL',
          text: 'This is the plaintext section of the email body.',
          html: 'You have been added to a new bill. Please login to EquaPay to view the details.'
      }});

      uploadImage(docRef.id);

      console.log('Bill stored in database', docRef.id); // test to see if it was stored in the database
      Alert.alert('Success', 'Bill submitted successfully.');
      navigation.navigate("View Bills");
    }
    catch (error) { // bill cant be submitted and stored
      console.error("Error submitting bill: ", error);
      Alert.alert('Error', 'Error submitting bill.');
    }
  };

  const handleSplitBill = () =>{
    if (isOpenSplit == false){
      setIsOpenSplit(true);
    }
    else if (isOpenSplit == true){
      setIsOpenSplit(false)
    }
  }


  // Renders the bill details form page
  return (
    <KeyboardAwareScrollView style={{backgroundColor:'#153A59'}}>
      <View style={[styles.container]}>  
        <View style={[styles.titleContainer]}>
          <TouchableOpacity onPress={backToPreviousScreen} style={[styles.backButton]}>
            <AntDesign name="arrowleft" size={24} color="white" />
          </TouchableOpacity>
        
          <View style={styles.topRightButtons}>
            <TouchableOpacity onPress={handleDeleteConfirmation} style={styles.topButton}>
              <MaterialIcons name="delete" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
       
        <Text style={[styles.billName]}>{billName}</Text>
        <Divider color='#85E5CA'/>

        <View>
          <Text style={[styles.subtitle]}>Bill Details</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a description for the bill"
              placeholderStyle={[styles.placeholder]}
              onChangeText={setDescription}
              value={description}
            />

            <Text style={[styles.subtitle]}>Bill Owner</Text>
            <Dropdown
              style={[styles.input]}
              containerStyle={[styles.dropdown]}
              itemContainerStyle={[styles.dropdown]}
              selectedTextStyle={[styles.dropdown]}
              placeholder="Who owns this bill?"
              placeholderStyle={[styles.placeholder]}
              data={dropdownOptions}
              labelField="label"
              valueField="value"
              value={selectedParticipant}
              onChange={(item) => {
                setSelectedParticipant(item.value);
                console.log('Selected participant: ', item.value);
              }}
            />
        </View>
        <Divider color='#85E5CA'/>

        
        <TouchableOpacity style={[styles.uploadImage]} onPress={pickImageOptions}> 
          <MaterialIcons name="image" size={24} color="white" />
          <Text style={[styles.uploadImageTitle]}>Upload Image</Text>
          {image && <Image source={{ uri: image }} style={{ width: 50, height: 50 }} />}
        </TouchableOpacity>
        <Divider color='#85E5CA'/>

        <View style={[styles.dateAmountRow]}>
          <View style={[styles.dateAmountContainer]}>
            <Text style={[styles.subtitle]}>Deadline of Expense</Text>
            {/* <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={[styles.subtitle]}>Show Date Picker</Text>
            </TouchableOpacity> */}

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="compact"
                themeVariant='dark'
                style={{alignSelf:'flex-start'}}
                onChange={onChangeDate}
              />
            )}
          </View>

          <View style={[styles.dateAmountContainer]}>
            <Text style={[styles.subtitle]}>Amount</Text>
            <TextInput
              style={[styles.halfInput]}
              placeholder="$0.00"
              placeholderStyle={[styles.placeholder]}
              keyboardType="numeric"
              onChangeText={handleBillAmountChange}
              value={billTotalAmount.toString()}
            />
          </View>
        </View>
        <Divider color='#85E5CA'/>


        
          <Text style={[styles.subtitle]}>Bill Distribution</Text>
            {participants.map((option, index) => (
              <View key={index} style={[styles.participantContainer]}>
                <TouchableOpacity
                  style={[
                    styles.participantRow,
                    selectedParticipants.includes(option.value) ? styles.selectedParticipantRow : null
                  ]}
                  onPress={() => {
                    toggleParticipantSelection(option.value);
                    setHasInteracted(true);
                  }}
                >
                  <Text style={styles.participantName}>{option.label}</Text>
                    {selectedParticipants.includes(option.value) && (
                      <MaterialIcons name="check-circle" size={24} color="green"/>
                    )}
                </TouchableOpacity>

                {/* Update this condition to also check for splitType */}
                {splitType !== 'equal' && (
                  <TextInput
                    style={[
                      styles.amountInput,
                      selectedParticipants.includes(option.value) ? styles.activeAmountInput : styles.inactiveAmountInput
                    ]}
                    placeholderStyle={[styles.placeholder]}
                    onChangeText={(amount) => handleAmountChange(option.value, amount)}
                    value={participantAmounts[option.value] || ''} // value is a string and references participants email and not name
                    placeholder="Amount"
                    keyboardType="numeric"
                  />
                )}
              </View>
            ))}

            {hasInteracted && selectedParticipants.length === 0 && (
                <Text style={[styles.validationMessage]}>
                  The expense must be paid for at least one participant.
                </Text>
            )}

            {amountValidationMessage && (
              <Text style={[styles.validationMessage]}>
                {amountValidationMessage}
              </Text>
            )}

          <TouchableOpacity onPress={handleSplitBill} style={[styles.splitOptionsButton]}>
            <Text style={[styles.splitOptionsText]}>Split Options</Text>
            {isOpenSplit && (
              <Dropdown
                  style={[styles.dropDownInput]}
                  containerStyle={[styles.dropdown]}
                  itemContainerStyle={[styles.dropdown]}
                  selectedTextStyle={[styles.dropdown]}
                  data={[
                    { label: 'Equal Split', value: 'equal' },
                    { label: 'By Percentage', value: 'percentage' },
                    { label: 'By Custom Amount', value: 'amount' },

                  ]}
                  labelField="label"
                  valueField="value"
                  placeholder="Select split type"
                  placeholderStyle={[styles.placeholder]}
                  value={splitType}
                  onChange={handleDropdownChange}
                />
            )}
          </TouchableOpacity>
          
          <View style={{flexDirection:'row', justifyContent:'flex-end'}}>
            <TouchableOpacity style={[styles.submitBillButton]} onPress={handleSubmitBill} >
              <Text style={[styles.createBillButtonText]}>Submit Bill</Text>
            </TouchableOpacity>
          </View>
      </View>
  </KeyboardAwareScrollView>
    
   
    
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor:'#153A59',
    flex: 1,
    paddingTop:"20%",
    paddingHorizontal:'5%',
    gap: 12
  },

  titleContainer:{
    flex: 1,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },

  backButton: {
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#366B7C",
    borderRadius:"100%",
    width: 35,
    height: 35
  
  },

  billName: {
    color:"white",
    fontSize: 30,
    fontWeight: "600",
  },
 
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  topButton: {
    marginLeft: 10,
  },

  subContainerTitle: {
    color: 'white',
    fontSize: 17,
    fontWeight: 700,
    marginBottom: 5,
  },

  subtitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 5,
  },

  input: {
    backgroundColor: lightBlue[50],
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 10,
    flex: 1
  },

  dropDownInput: {
    backgroundColor: lightBlue[50],
    padding: 10,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 10,
    flex: 1
  },

  uploadImage: {
    flex: 1, 
    flexDirection: "row", 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    marginVertical: 10,
    gap: 5
  },

  uploadImageTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: 600,
  },

  dateAmountRow: {
    flex:1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dateAmountContainer: {
    flex: 1,
    flexDirection:'column',
    justifyContent:'flex-start'
    
   
  },

  halfInput: {
    backgroundColor: lightBlue[50],
    padding: 10,
    borderRadius: 10,
    fontSize: 18,
    flex: 1,
  },
  
  participantName: {
    fontSize: 16,
    color: '#white',
    marginTop: 5,  // Space above each name
    marginBottom: 5, // Space below each name
  },

  selectedParticipant: {
    backgroundColor: '#e0f2f1', // or any color to indicate selection
  },

  placeholder:{
    color:'#999', 
    fontSize:17
  },

  participantRow: {
    backgroundColor: lightBlue[50],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    width: '60%', // Adjusted to fit the screen
  },

  selectedParticipantRow: {
    backgroundColor: '#E0F7FA',
    borderColor: '#4DB6AC',
    borderWidth: 2,
  },

  participantName: {
    fontSize: 16,
    color: '#153A59',
  },

  participantContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'space-between',
  },
 
  amountInput: {
    borderRadius: 10,
    padding:10,
    fontSize: 16,
    backgroundColor: lightBlue[50],
    width:'35%'
  },

  activeAmountInput: {
    borderColor: '#4DB6AC',
    borderWidth: 1,
  },

  inactiveAmountInput: {
    backgroundColor: '#ECEFF1',
    borderColor: '#CFD8DC',
    borderWidth: 1,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  splitOptionsButton: {
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    gap: 10
  },

  splitOptionsText: {
    color:'white',
    fontSize: 15,
    fontWeight: 600,
    textDecorationLine: 'underline',
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  dropdown: {
    backgroundColor: lightBlue[50],
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F0F4F8',

  },
  validationOutline: {
    borderColor: 'red',
  },
  validationMessage: {
    color: 'red',
    fontSize: 12,
    fontWeight: 400

  },
  submitBillButton: {
    backgroundColor: '#85E5CA', 
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 40,
    width: 150
  },

  createBillButtonText: {
    color: '#153A59',
    fontWeight: 'bold',
    fontSize: 18,
  },

});

export default BillDetails;