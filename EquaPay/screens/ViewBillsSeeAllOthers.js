import { StyleSheet, Text, View, Alert, TouchableOpacity, Modal, Button, SafeAreaView, Pressable, TextInput, ActivityIndicator, Image } from "react-native";
import { useState, useEffect } from "react";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native' // used to navigate between screens
import { MaterialIcons, AntDesign } from '@expo/vector-icons';
import { Divider } from '@rneui/themed';
import { auth, firestore, functions } from '../firebase' // used for authentication
import { httpsCallable } from 'firebase/functions';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { doc, getDoc, updateDoc, getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';

const db = getFirestore();

const ViewBillsSeeAllOthers = () => {
  const { confirmPayment } = useStripe();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(''); // State variable for the custom amount
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [billInfo, setBillInfo] = useState([]);
  const [otherBillInfo, setOtherBillInfo] = useState([]);
  const [ownerModalVisible, setOwnerModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalBillInfo, setModalBillInfo] = useState({});
  const [paidStatus, setPaidStatus] = useState(false);
  const [modalImageVisible, setModalImageVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [billInfoData, setBillInfoData] = useState([])
  const [otherBillInfoData, setOhterBillInfoData] = useState([])
  const [isShow, setIsShow] = useState(true)
  
  const navigation = useNavigation(); // used to navigate between screens

  const fetchImage = async (data) => {
    const storage = getStorage()

    console.log(data)

    const storageRef = ref(storage, "images/" + data);

    console.log(storageRef);

    const url = await getDownloadURL(storageRef)

    console.log(url)
    setImage(url);

  }

  const handleCreatePaymentIntent = async () => {
    setIsLoading(true);
    const createPaymentIntent = httpsCallable(functions, 'createPaymentIntent');
    try {
      
      const amountInCents = Math.round(parseFloat(amount) * 100); 
      const result = await createPaymentIntent({
        amount: amountInCents,
        currency: modalBillInfo.currency,
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

      let participants = [];
      const billDocRef = doc(db, "billsCreated", modalBillInfo.id);

      modalBillInfo.participants.forEach((item) => {
        if (item.id === userEmail){
          item.paidStatus = true;
          participants = modalBillInfo.participants;
        }
      });

      await updateDoc(billDocRef, {
        participants: participants
      });
      
      Alert.alert('Success', 'Payment succeeded!');
      setPaymentModalVisible(false); // Close the modal on successful payment
      setModalVisible(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) { // If the user is logged in
        const userDocRef = doc(db, 'users', auth.currentUser.uid); // Reference to the user stored in the database.

        try {
          const docSnap = await getDoc(userDocRef); // fetches the user's data from the database
          if (docSnap.exists()) { // if the user exists
            setUserFullName(docSnap.data().fullName); // get the users name and sets it to the state
            setUserEmail(docSnap.data().email);

            console.log("User's email is: ", docSnap.data().email)
            console.log("User's full name is: ", docSnap.data().fullName);
          } 
          else { // if the user does not exist
            console.log("User record not found");
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };

    fetchUserData();
  }, []);

  
  useEffect(() => {
    if (auth.currentUser) {
      const unsubscribe = onSnapshot(collection(db, "billsCreated"), (querySnapshot) => {
        const newBillInfo = [];
  
        querySnapshot.forEach((doc) => {
          doc.data().participants.forEach((participant) => {
            if (participant.id === userEmail && doc.data().billOwner !== userEmail) {
              newBillInfo.push({
                id: doc.id, 
                name: doc.data().billName,
                creator: doc.data().billOwner,
                date: doc.data().billDeadline.toDate().toDateString().split(' ').slice(1).join(' '),
                amount: participant.amount,
                currency: doc.data().currency,
                icon: <MaterialIcons name="payments" size={30} color={'#EDEDED'}/>
              });
            }
          });
        });

        let sortedBills = newBillInfo.sort((p1, p2) => (p1.date > p2.date) ? 1 : (p1.date < p2.date) ? -1 : 0);
  
        setOtherBillInfo(sortedBills);
      });
  
      // Unsubscribe from the listener when the component unmounts
      return () => unsubscribe();
    }
  }, [auth.currentUser, userEmail]); // Dependencies array

  const hideImageModal = () => {
    if (modalImageVisible){
      setModalImageVisible(false);
    }
  }

  const showImageModal = () => {
    if (!modalImageVisible && image != null){
      setModalImageVisible(true);
    }
  }

  const showOtherModal = (data) => {
    console.log(data);
    if (!modalVisible){
      setModalVisible(true)

      const fetchBillData = async () => {
        if (auth.currentUser) {
          const userDocRef = doc(db, 'billsCreated', data);
          let participantAmount = 0;
          let newPaidStatus = false;
          let newModalBillInfo = {}

          try {
            const docSnap = await getDoc(userDocRef); // fetches the bills's data from the database
            if (docSnap.exists()) { // if the user exists

              docSnap.data().participants.forEach((participant) => {
                if (participant.id === userEmail) {
                  participantAmount = participant.amount;

                  if (participant.paidStatus)
                    newPaidStatus = true
                  else
                    newPaidStatus = false
                }
              })

              newModalBillInfo = (
                {
                  id: docSnap.id,
                  name: docSnap.data().billName,
                  billOwner: docSnap.data().billOwner,
                  description: docSnap.data().description,
                  date: docSnap.data().billDeadline.toDate().toDateString().split(' ').slice(1).join(' '),
                  amount: docSnap.data().billTotalAmount,
                  ownerParticipantAmount:  participantAmount,
                  currency: docSnap.data().currency,
                  participants: docSnap.data().participants
                }
              )
              
              
            } 
            else {
              console.log("bill not found");
            }
          } catch (error) {
            console.error("Error fetching user data: ", error);
          }
          setModalBillInfo(newModalBillInfo)
          setAmount(participantAmount)
          setPaidStatus(newPaidStatus)
          fetchImage(data);
        }
      };

      console.log(modalBillInfo);
  
      
      fetchBillData();
      
    }

  }

  const hideModal = () => {
    if (ownerModalVisible){
      setModalBillInfo({})
      setOwnerModalVisible(false)
      setImage(null)
    }else if(modalVisible){
      setModalBillInfo({})
      setModalVisible(false);
      setImage(null)
    }
  }
 
  const backToPreviousScreen = () => {
    navigation.navigate("View Bills");
  }

  return (
    <KeyboardAwareScrollView style={{backgroundColor:'#153A59'}}>
      <View style={[styles.container]}>
        <TouchableOpacity onPress={backToPreviousScreen} style={[styles.backButton]}>
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        <Text style = {[styles.titleText]} >Others' Bills</Text>

        <View style={[styles.bodyContainer]}>
          <View style={[styles.yourBillsContainer]}>
            {otherBillInfo.map((option, index)=> (
              <TouchableOpacity style={[styles.billButton]} key={index} onPress={() => showOtherModal(option.id)}>
                  <View style={{display:'flex', flexDirection:'row', alignItems:'center', gap:15}}>
                    <View style={[styles.iconContainer]}>
                      {option.icon}
                    </View>
                    <View style={[styles.billInfoContainer]}>
                      <Text style={[styles.optionText]}>{option.name}</Text>
                      <Text style={[styles.subOptionText]}>By {option.creator}</Text>
                      <Text style={[styles.deadlineText]}>Due on: {option.date}</Text>
                    </View>
                  </View>
                  <Text style={[styles.optionText]}>{option.amount} {option.currency}</Text> 
              </TouchableOpacity>
            ))}
          </View>

          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent
          >
          <KeyboardAwareScrollView style={{backgroundColor:'#153A59',}}>
            <View style={[styles.container]}>
              <TouchableOpacity style={[styles.closeButton]} onPress={hideModal}>
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>
              <View style={{flexDirection:'row', gap: 10, alignItems:'center'}}>
                <Text style={[styles.headingText]}>{modalBillInfo.name}</Text>
                {paidStatus ? (
                  <MaterialIcons name="check-circle-outline" size={24} color="#85E5CA" />
                ): null}
              </View>
              

              <Text style={[styles.amountText]}>{modalBillInfo.currency} {modalBillInfo.amount}</Text>

              <View style={[styles.bodyContainer]}>
                <Divider color='#85E5CA'/>

                <View style={[styles.modalContent]}>
                  <Text style={[styles.modalSubText]}>Created By: </Text>
                  <Text style={[styles.modalText]}>{modalBillInfo.billOwner}</Text>
                </View>

                <View style={[styles.modalContent]}>
                  <Text style={[styles.modalSubText]}>Description: </Text>
                  <Text style={[styles.modalText]}>{modalBillInfo.description}</Text>
                </View>

                <View style={[styles.modalContent]}>
                  <Text style={[styles.modalSubText]}>Amount Due: </Text>
                  <Text style={[styles.modalText]}>{modalBillInfo.currency} {amount}</Text>
                </View>

                <View style={[styles.modalContent]}>
                  <Text style={[styles.modalSubText]}>Deadline: </Text>
                  <Text style={[styles.modalText]}>{modalBillInfo.date}</Text>
                </View>
              </View>
              <View style={{marginBottom:20}}>
                <Divider color='#85E5CA'/>
              </View>
              

              <TouchableOpacity style={[styles.imageButton]} onPress={() => showImageModal()}>
                <MaterialIcons name="image" size={24} color="#153A59" />
                <Text style={[styles.imageText]}>Bill Image</Text>
              </TouchableOpacity>

              {isShow && 
                <>
                  {paidStatus ? (
                    <TouchableOpacity disabled style={[styles.paidButton]}> 
                      <Text style={[styles.paidText]}>Paid</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={[styles.payButton]} onPress={() => setPaymentModalVisible(true)}> 
                      <Text style={[styles.payText]}>Pay Now</Text>
                    </TouchableOpacity>
                  )}
                </>
              }
              <Modal visible={paymentModalVisible} animationType="slide" transparent>
                <View style={[styles.modalContainer]}>
                  <View style={styles.paymentContent}>
                    <Text style={styles.modalTitle}>Enter Payment Details</Text>
                    <TextInput style={styles.input} placeholder="Email" textColor={'#153A59'} placeholderTextColor={'#153A59'} value={email} onChangeText={setEmail} keyboardType="email-address" />
                    <TextInput style={styles.input} placeholder="Name on Card" textColor={'#153A59'} placeholderTextColor={'#153A59'} value={name} onChangeText={setName} />
                    <Text>Amount Due: {amount} </Text>
                    <CardField style={styles.cardField} onCardChange={(cardDetails) => {}} cardStyle={{textColor:'#153A59'}} />
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#0000ff" />
                    ) : (
                      <TouchableOpacity style={styles.confirmButton} onPress={handlePayment}>
                        <Text style={[styles.buttonText]}>Confirm</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setPaymentModalVisible(false)}>
                      <Text style={[styles.buttonText]}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>

            <Modal
              visible={modalImageVisible}
              animationType="fade"
              transparent
            >
              <View style = {[styles.modalImage]}>
                <Button title="Hide" onPress={hideImageModal}/>
                <Image source={{ uri: image }} style={{ width: 300, height: 300 }} />
              </View>
                
            </Modal>
          </KeyboardAwareScrollView>
            

            

          </Modal>

          <Divider color='#85E5CA'/>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ViewBillsSeeAllOthers;

const styles = StyleSheet.create({
  container:{
    backgroundColor:'#153A59',
    flex: 1,
    paddingTop:"20%",
    paddingHorizontal:'5%',
    gap:12
  },

  titleText:{
    color:"#EDEDED",
    fontSize: 30,
    fontWeight: "600",
  },

  backButton: {
    justifyContent:'center',
    alignItems:'center',
    backgroundColor:"#366B7C",
    borderRadius:"100%",
    width: 35,
    height: 35
  },

  bodyContainer:{
    flex: 1,
    gap:15,
    marginTop: 20,
    marginBottom: 10

  },

  headingText:{
    color: '#EDEDED',
    fontSize: 23,
    fontWeight: 600
  },

  headingContainer:{
    display: 'flex',
    flexDirection:'row',
    justifyContent:"space-between"
  },

  seeAllText:{
    color:'#85E5CA',
    fontSize: 15,
    fontWeight: 500,
  },
  
  yourBillsContainer:{
    display:'flex',
    justifyContent:'space-between',
    marginTop: 15,
    marginBottom: 15,
    gap: 10
  },

  billInfoContainer:{
    display:'flex',
    justifyContent:'flex-start', 
  },

  billButton:{
    display:'flex',
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },

  iconContainer:{
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:'100%', 
    backgroundColor:'#225982', 
    width: 47, 
    height: 47
  },

  optionText:{
    color:'#EDEDED',
    fontSize: 18,
    fontWeight: 600
  },

  subOptionText:{
    color:'#EDEDED',
    fontSize: 11,
  },

  deadlineText:{
    fontSize: 10, 
    color: '#85E5CA',
  },

  button: {
    backgroundColor: '#40a7c3', // Light blue
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 500,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  
  input: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  cardField: {
    width: '100%',
    height: 30,
    marginVertical: 20,
    color:'black', 


  },
  payButton: {
    flex:1,
    justifyContent:'center',
    alignSelf:'center',
    alignItems:'center',
    backgroundColor: '#40a7c3',
    padding: 15,
    borderRadius: 10,
  },

  payText:{
    color:'#153A59',
    fontSize: 18,
    fontWeight: 600,
    textTransform:'uppercase'
  },

  paidButton:{
    flex:1,
    justifyContent:'center',
    alignSelf:'center',
    alignItems:'center',
  },

  paidText:{
    color:'#85E5CA',
    fontSize: 18,
    fontWeight: 600,
    textTransform:'uppercase'
  },

  confirmButton:{
    backgroundColor: '#40a7c3',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#999',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
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

  amountText:{
    color:"#EDEDED",
    fontSize: 30,
    fontWeight: "600",
    alignSelf:'center'
  },

  modalContainer: {
    flex: 1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalContent: {
    flex: 1,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  modalImage: {
    flex: 1, 
    justifyContent: 'center', 
    padding: 80
  },

  modalText:{
    color:'#EDEDED',
    fontSize: 17,
    fontWeight: 700
  },

  modalSubText:{
    color:'#BDB3B3',
    fontSize: 15,
  },

  participantContainer:{
    flex: 1,
    gap:10
  },

  participantText:{
    color:'#EDEDED',
    fontSize: 15,
    
  },

  statustext:{
    color:'#EDEDED',
    alignSelf:'flex-end'
  },

  imageButton:{
    backgroundColor:'#85E5CA',
    flex:1,
    justifyContent:'center',
    alignSelf:'flex-start',
    alignItems:'center',
    padding: 10,
    borderRadius: 10,
  },

  imageText:{
    color: '#153A59',
  },

 paymentContent:{
  backgroundColor: '#fff',
  padding: 20,
  width: '90%',
  borderRadius: 10,
 },

 placeholder:{
  color:'#153A59', 
  fontSize:17
},

});

