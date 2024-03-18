import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { functions } from '../firebase'; // Adjust this import path as necessary
import { httpsCallable } from 'firebase/functions';

const NotificationPage = () => {
  const { confirmPayment } = useStripe();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(''); // State variable for the custom amount
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePaymentIntent = async () => {
    setIsLoading(true);
    const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
    try {
      
      const amountInCents = Math.round(parseFloat(amount) * 100); 
      const result = await createPaymentIntent({
        amount: amountInCents,
        email: email, // Pass the email to the function
      });
      setIsLoading(false);
      return result.data.clientSecret;
    } catch (error) {
      setIsLoading(false);
      console.error('Error creating payment intent:', error);
      Alert.alert('Payment error', error.message);
      return null;
    }
  };
  
const handlePayment = async () => {
  if (!email || !name || !amount) { // Ensure amount is provided
    Alert.alert('Error', 'Please provide email, name, and amount');
    return;
  }

  // Log the email to the console
  console.log('Submitting payment for email:', email);

  const clientSecret = await handleCreatePaymentIntent();
  if (!clientSecret) return;

  const { error } = await confirmPayment(clientSecret, {
    paymentMethodType: 'Card',
    billingDetails: { email, name },
  });

  if (error) {
    Alert.alert('Payment failed', error.message);
  } else {
    Alert.alert('Success', 'Payment succeeded!');
    setModalVisible(false); // Close the modal on successful payment
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Payment</Text>
      <TouchableOpacity style={styles.payButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Pay Now</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Payment Details</Text>
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Name on Card" value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
            <CardField style={styles.cardField} onCardChange={(cardDetails) => {}} />
            {isLoading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#40a7c3',
    padding: 15,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#999',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    width: '90%',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default NotificationPage;
