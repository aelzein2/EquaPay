import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, doc, addDoc, deleteDoc, collection, Timestamp, updateDoc, arrayUnion, getDocs, query, where} from 'firebase/firestore';
import { ActionSheetIOS, ScrollView, StyleSheet, Text, TextInput, View, TouchableOpacity, Modal, Alert, Button, Image } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons'; // used for the icons
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from 'firebase/auth';
import { auth, firestore } from '../firebase' // used for authentication
import { getStorage, ref, uploadBytes } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';


const db = getFirestore();

// Bill details that fetches this information from async storage
const BillDetails = ({ route }) => {
  const { billId } = route.params; // Fetch the bill ID from the route params from the previous screen. This will be used to detect the corresponding data that is stored in Async Storage
  const [billName, setBillName] = useState('');
  const [currency, setBillCurrency] = useState('');
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
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
  const auth = getAuth();

  const [image, setImage] = useState(null);

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
        const storageRef = ref(storage, filename);
  
        uploadBytes(storageRef, blob).then((snapshot) => {
          console.log('Uploaded Image!');
          console.log(filename);
        });
  
  
        setImage(null);
      }catch (error){
        console.error(error);
      }
    }
    
  };

  // navigate back to the previous screen
  const backToPreviousScreen = () => {
    navigation.navigate("AddBillsPage");
  }


  // saves the bill so it can be reached later
  const handleSave = () => {
  };


  // deletes the current bill and redirects back to the homepage. bill gets deleted from AsyncStorage
  const handleDelete = async () => {

    try {
      await AsyncStorage.removeItem(billId);
      console.log('Bill deleted successfully!');
      navigation.navigate("ViewBills"); // Redirect to the desired screen after deletion
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
        setParticipants(data.participants);
        setIsLoading(false);

        const usersRef = collection(db, "users");
        const currentUserEmail = auth.currentUser.email.toLowerCase(); // Convert current user's email to lowercase for comparison
        const fetchedOptions = await Promise.all(
          data.participants.map(async (participant) => {
            const q = query(usersRef, where("email", "==", participant)); // Keep the participant email as it is for the query
            const querySnapshot = await getDocs(q);
            const participantData = querySnapshot.docs[0]?.data();

            let label = participantData
              ? participant.toLowerCase() === currentUserEmail // Convert participant email to lowercase only for comparison
                ? `${participantData.fullName} (You)` // Append "(You)" if current user
                : participantData.fullName
              : "Unknown";

            return {
              label: label,
              value: participant
            };
          })
        );

        setDropdownOptions(fetchedOptions);
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
    if (!description || !billTotalAmount || !billName || selectedParticipants.length === 0) {
      Alert.alert('Error', 'Please complete all required fields.');
      return;
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
        amount: amount.toFixed(2) // Ensuring amount is formatted as currency
      };
    });

    // attempts to store the bill details in the database, with all details needed
    try {
      // all bill form data is stored in the database in 'billsCreated' table. 
      const docRef = await addDoc(collection(db, 'billsCreated'), {
        description: description,
        userEmail: userEmail,
        billName: billName,
        billTotalAmount: parseFloat(billTotalAmount),
        currency: currency,
        participants: participantsWithAmounts, // stores selected participants with their amounts
        billOwner: selectedParticipant,
        billDeadline: billDeadlineTimestamp,
        billSplitType: splitType
      });

      let participantEmails = ["noreplyequapay@gmail.com"];

      for (let i = 0; i < participantsWithAmounts.length; i++){
        participantEmails.push(participantsWithAmounts[i].id);
      }

      await addDoc(collection(db, 'mail'), {
        to: participantEmails,
        message: {
          subject: 'ALERT: YOU HAVE BEEN ADDED TO A BILL',
          text: 'This is the plaintext section of the email body.',
          html: 'This is the <code>HTML</code> section of the email body.'
      }});

      uploadImage(docRef.id);

      console.log('Bill stored in database', docRef.id); // test to see if it was stored in the database
      Alert.alert('Success', 'Bill submitted successfully.');
      navigation.navigate("ViewBills");
    }
    catch (error) { // bill cant be submitted and stored
      console.error("Error submitting bill: ", error);
      Alert.alert('Error', 'Error submitting bill.');
    }
  };


  // Renders the bill details form page
  return (
    <ScrollView style={styles.container}>

      <TouchableOpacity onPress={backToPreviousScreen} style={styles.backButton}>
        <AntDesign name="arrowleft" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.topRightButtons}>
        <TouchableOpacity onPress={handleSave} style={styles.topButton}>
          <MaterialIcons name="save" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteConfirmation} style={styles.topButton}>
          <MaterialIcons name="delete" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={styles.billName}>{billName}</Text>


      <View style={styles.billDetailsContainer}>
        <Text style={styles.subContainerTitle}>Bill Details</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter a description for the bill"
          placeholderTextColor="#999"
          onChangeText={setDescription}
          value={description}
        />

        <Text style={styles.subtitle}>Bill Owner</Text>
        <Dropdown
  style={styles.input}
  placeholder="Who paid for this bill?"
  data={dropdownOptions}
  labelField="label"
  valueField="value"
  value={selectedParticipant}
  onChange={(item) => {
    setSelectedParticipant(item.value);
    console.log('Selected participant: ', item.value);
  }}
/>

        <TouchableOpacity style={{flex: 1, flexDirection: "row", justifyContent: 'flex-start', alignItems: 'center'}} onPress={pickImageOptions}> 
          <Text>Upload Image</Text>
          {image && <Image source={{ uri: image }} style={{ width: 50, height: 50 }} />}
        </TouchableOpacity>


        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={styles.subtitle}>Deadline of Expense</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text>Show Date Picker</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.subtitle}>Amount</Text>
            <TextInput
              style={styles.halfInput}
              placeholder="$0.00"
              placeholderTextColor="#999"
              keyboardType="numeric"
              onChangeText={handleBillAmountChange}
              value={billTotalAmount.toString()}
            />
          </View>
        </View>
      </View>

      <View style={styles.paidForContainer}>
        <Text style={styles.subContainerTitleTwo}>Bill Distribution</Text>
        {dropdownOptions.map((option, index) => (
          <View key={index} style={styles.participantContainer}>
            <TouchableOpacity
              style={[
                styles.participantRow,
                selectedParticipants.includes(option.value) ? styles.selectedParticipantRow : null
              ]}
              onPress={() => {
                toggleParticipantSelection(option.value);
                setHasInteracted(true);
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.participantName}>{option.label}</Text>
              {selectedParticipants.includes(option.value) && (
                <MaterialIcons name="check-circle" size={24} color="green" style={styles.checkmarkIcon} />
              )}
            </TouchableOpacity>

            {/* Update this condition to also check for splitType */}
            {splitType !== 'equal' && (
              <TextInput
                style={[
                  styles.amountInput,
                  selectedParticipants.includes(option.value) ? styles.activeAmountInput : styles.inactiveAmountInput
                ]}
                onChangeText={(amount) => handleAmountChange(option.value, amount)}
                value={participantAmounts[option.value] || ''} // value is a string and references participants email and not name
                placeholder="Amount"
                keyboardType="numeric"
              />
            )}
          </View>
        ))}

        {
          hasInteracted && selectedParticipants.length === 0 && (
            <Text style={styles.validationMessage}>
              The expense must be paid for at least one participant.
            </Text>
          )
        }

        {
          amountValidationMessage && (
            <Text style={styles.validationMessage}>
              {amountValidationMessage}
            </Text>
          )
        }

        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.splitOptionsButton}>
          <Text style={styles.splitOptionsText}>Split Options</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBillButton} onPress={handleSubmitBill} >
          <Text style={styles.createBillButtonText}>Submit Bill</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.centeredModalView}>
            <View style={styles.modalView}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="black" />
              </TouchableOpacity>

              <Text style={styles.modalText}>Choose Split Type</Text>
              <Dropdown
                style={styles.dropdown}
                data={[
                  { label: 'Equal Split', value: 'equal' },
                  { label: 'By Percentage', value: 'percentage' },
                  { label: 'By Custom Amount', value: 'amount' },

                ]}
                labelField="label"
                valueField="value"
                placeholder="Select split type"
                value={splitType}
                onChange=
                {handleDropdownChange}
              />
            </View>
          </View>
        </Modal>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#153A59', // Main container background color
  },
  billDetailsContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#85E5CA',
    borderRadius: 20,
    marginHorizontal: 20,
    paddingBottom: 30,
  },
  billName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 100, // Adjusted for better placement
    marginLeft: 30,
  },
  backButton: {
    position: 'absolute',
    top: 60, // Adjusted for standard positioning
    left: 20,
    zIndex: 10,
  },
  topRightButtons: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 100,
  },
  topButton: {
    marginLeft: 10,
  },
  subContainerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#153A59',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  subtitle: {
    color: '#153A59',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 10,
    width: '100%'
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputGroup: {
    flex: 1,
    marginRight: 10,
  },
  halfInput: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    fontSize: 18,
    marginBottom: 10,
    flex: 1,
  },
  paidForContainer: {
    marginTop: 20,
    paddingVertical: 20, // Maintain padding for internal spacing
    paddingHorizontal: 20,
    backgroundColor: '#85E5CA',
    borderRadius: 20,
    marginHorizontal: 20,
    minHeight: 350, // Example minimum height, adjust as needed
  },
  subContainerTitleTwo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#153A59',
    alignSelf: 'flex-start',
    marginBottom: 10, // Space below the title
  },
  participantName: {
    fontSize: 16,
    color: '#153A59',
    marginTop: 5,  // Space above each name
    marginBottom: 5, // Space below each name
  },
  selectedParticipant: {
    backgroundColor: '#e0f2f1', // or any color to indicate selection
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F0F4F8',
    marginBottom: 10,
    marginLeft: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginHorizontal: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F0F4F8',
    marginRight: 10,
    width: '70%',

  },

  checkmarkIcon: {
    marginLeft: 'auto',
  },

  amountInput: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: 'white',

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
  splitOptionsButton: {
    backgroundColor: '#4DB6AC',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  modalText: {
    marginTop: -10,
    textAlign: 'center',
  },
  splitOptionsButton: {
    alignItems: 'flex-start',
    marginTop: 10,
    marginLeft: 10,
  },

  splitOptionsText: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  centeredModalView: {
    flex: 1,

    alignItems: 'center',
    marginTop: 300,
  },

  modalView: {
    width: '80%', // Larger modal
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    minHeight: 200, // Adjusted to fit the screen
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginToptop: 100
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  dropdown: {
    width: '60%',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F0F4F8',
    marginBottom: 20,

  },
  validationOutline: {
    borderColor: 'red',
  },
  validationMessage: {
    color: 'red',

  },
  submitBillButton: {
    backgroundColor: '#4CAF50', // Green color for the create button
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20, // Add some bottom margin for better spacing
  }

});

export default BillDetails;