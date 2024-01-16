import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import { lightBlue } from '@mui/material/colors';
import { MaterialIcons } from '@expo/vector-icons'; // Importing MaterialIcons for the garbage can icon
import firebase from 'firebase/app';
import {firestore } from '../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Alert } from 'react-native';

const AddBillsPage = () => {
  const [groupName, setGroupName] = useState('');
  const [currency, setCurrency] = useState(null);
  const [participants, setParticipants] = useState(['']);

  // currencies available. may add more later, but for now we'll just use these three for now. 
  const currencyData = [
    { label: 'CAD - $', value: 'CAD' },
    { label: 'EUR - €', value: 'EUR' },
    { label: 'JPY - ¥', value: 'JPY' },
  ];

  // adds a new participant to the participants array when the user clicks the "Add participant" button
  const handleAddParticipant = () => {
    setParticipants([...participants, '']);
  };

  // updates the participants array when the user types in a participant's name
  const handleParticipantChange = (text, index) => {
    const newParticipants = [...participants];
    newParticipants[index] = text;
    setParticipants(newParticipants);
  };

  // deletes a participant from the participants array when the user clicks the garbage can icon
  const handleDeleteParticipant = (index) => {
    setParticipants(participants.filter((_, idx) => idx !== index));
  };

  // function that handles creating the bill and storing it in the backend database.
  const handleCreateBill = async () => {
    if (!groupName || !currency || participants.length === 0) { // if any of the fields are empty
      Alert.alert('Error', 'Please complete all fields.'); // show an error message
      return;
    }
  
    try {
      // Creates a new document in the 'billsCreated' collection
      const docRef = await addDoc(collection(firestore, 'billsCreated'), { // adds a new document to the billsCreated collection
        // these are the fields that will be stored in the bills table in the database. 
        groupName,
        currency,
        participants,
        timeCreated: serverTimestamp(),
      });
  
      console.log('Document written with ID: ', docRef.id);
      Alert.alert('Success', 'Bill created successfully.'); // displays alert if bill was actually created and stored in the backend. 
  
     
    } catch (error) { // bill wasnt created. 
      console.error("Error adding document: ", error);
      Alert.alert('Error', 'Error creating bill.');
    }
  };

// structure of the add bill page. 
  return (
    <ScrollView style={styles.container}>

      <Text style={styles.screenTitle}>Add Bill</Text>

         <Text style={styles.screenSubTitle}>Bill Information</Text>
      
      {/* Bill Name Section */} 
      <Text style={styles.subtitle}>Bill Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Court rental"
        placeholderTextColor="#999"
        onChangeText={setGroupName}
        value={groupName}
      />
      <Text style={styles.instructions}>Enter a name for your bill.</Text>
      

      {/* Currency Selector Section */}
      <Text style={styles.subtitle}>Currency Selector</Text>
      <Dropdown
        style={[styles.dropdown, styles.input]}
        data={currencyData}
        labelField="label"
        valueField="value"
        placeholder="$, €, ¥..."
        value={currency}
        onChange={item => setCurrency(item.value)}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={'black'}
            name="Safety"
            size={20}
          />
        )}
      />
      <Text style={styles.instructions}>We'll use it to display amounts.</Text>
      

      {/* Participants Section */}
      <Text style={styles.screenSubTitle}>Participants</Text>
      {participants.map((participant, index) => (
        <View key={index} style={styles.participantRow}>
          <TextInput
            style={styles.input}
            placeholder="Enter participant name"
            placeholderTextColor="#999"
            onChangeText={(text) => handleParticipantChange(text, index)}
            value={participant}
          />
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteParticipant(index)}
          >
            <MaterialIcons name="delete" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.button} onPress={handleAddParticipant}>
        <Text style={styles.buttonText}>Add participant</Text>
      </TouchableOpacity>


       {/* Create Bill Button */}
       <TouchableOpacity style={styles.createBillButton} onPress = {handleCreateBill} >
        <Text style={styles.createBillButtonText}>Create Bill</Text>
      </TouchableOpacity>

    </ScrollView>
    
  );
};

export default AddBillsPage;

// Styles for the add bill page. Its a bit messy but it works. Can be organized later. 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#153A59',
  },
  screenTitle: {
    color:"white",
    fontSize: 40,
    fontWeight: 400,
    marginTop: 50,
    // center the title
    alignSelf: 'center',
    
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
    width: 345
  },
  icon: {
    marginRight: 5,
  },
  button: {
    backgroundColor: '#40a7c3',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    width: 200
  },
  buttonText:
  {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },  
  subtitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 15,
    },

  instructions: {
    color: 'white',
    fontSize: 14,
    marginBottom: 15,
      },
      participantRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      deleteButton: {
        marginLeft: 10,
      },

      createBillButton: {
        backgroundColor: '#4CAF50', // Green color for the create button
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 20, // Add some bottom margin for better spacing
      },
      createBillButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
      },
    
});