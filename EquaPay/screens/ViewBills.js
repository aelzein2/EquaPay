import { StyleSheet, Text, View, Alert, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native' // used to navigate between screens
import { MaterialIcons } from '@expo/vector-icons';
import { Divider } from '@rneui/themed';
import { auth, firestore } from '../firebase' // used for authentication
import { doc, getDoc, getFirestore, collection, getDocs } from 'firebase/firestore';

const db = getFirestore();

const ViewBills = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userFullName, setUserFullName] = useState('');
  const [billInfo, setBillInfo] = useState([]);
  const [otherBillInfo, setOtherBillInfo] = useState([]);
  
  const navigation = useNavigation(); // used to navigate between screens

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
  const fetchOwnerBillData = async () => {
    if (auth.currentUser) { 
      const querySnapshot = await getDocs(collection(db, "billsCreated"));
      const newBillInfo = [];

      try {
        querySnapshot.forEach((doc) => {
          
          if (doc.data().billOwner === userEmail) {
            newBillInfo.push({
              id: doc.id, // Assuming doc.id is unique
              name: doc.data().billName,
              date: doc.data().billDeadline.toDate().toDateString().split(' ').slice(1).join(' '),
              amount: doc.data().billTotalAmount,
              currency: doc.data().currency,
              icon:<MaterialIcons name="payments" size={30} color={'#EDEDED'}/>
              
            });
          }
        });

        setBillInfo(newBillInfo); 

        //console.log(billInfo)
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }
  };

  fetchOwnerBillData();
}, [auth.currentUser, userEmail]);

useEffect(() => {
  const fetchOthersBillData = async () => {
    if (auth.currentUser) { 
      const querySnapshot = await getDocs(collection(db, "billsCreated"));
      const newBillInfo = [];

      try {
        querySnapshot.forEach((doc) => {
          doc.data().participants.forEach((i) => {
            if (i.id === userEmail && doc.data().billOwner != userEmail){
              newBillInfo.push({
                id: doc.id, // Assuming doc.id is unique
                name: doc.data().billName,
                creator: doc.data().billOwner,
                date: doc.data().billDeadline.toDate().toDateString().split(' ').slice(1).join(' '),
                amount: i.amount,
                currency: doc.data().currency,
                icon:<MaterialIcons name="payments" size={30} color={'#EDEDED'}/>
                
              });
            }
          })
        });

        setOtherBillInfo(newBillInfo)

        // console.log(otherBillInfo)

      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    }
  };

  fetchOthersBillData();
}, [auth.currentUser, userEmail]);

// temporary function to redirect to account detail page for testing purposes.
  const redirectAccountDetail = () => {
    navigation.navigate("Account")
  }

  // const yourBillsOptions=[
  //   {id:'0', name:'Food', date:'Feb 12, 2024', amount:'100', currency:'CAD', icon:<MaterialIcons name="payments" size={30} color={'#EDEDED'}/>},
  //   {id:'1', name:'Food', date:'Feb 12, 2024', amount:'100', currency:'CAD', icon:<MaterialIcons name="payments" size={30} color={'#EDEDED'}/>},
  //   {id:'2', name:'Food', date:'Feb 12, 2024', amount:'100', currency:'CAD', icon:<MaterialIcons name="payments" size={30} color={'#EDEDED'}/>},
  //   // {id:'2', name:'Logout', icon:<MaterialIcons name="logout" size={28} color={'#EDEDED'}/>, onPress: handleLogout}
  // ]

  // const othersBillsOptions=[
  //   {id:'0', name:'Food', creator:'Khanh', date:'Feb 12, 2024', amount:'100', currency:'CAD', icon:<MaterialIcons name="payments" size={30} color={'#EDEDED'}/>},
  //   {id:'1', name:'Food', creator:'Khanh', date:'Feb 12, 2024', amount:'100', currency:'CAD', icon:<MaterialIcons name="payments" size={30} color={'#EDEDED'}/>},
  //   {id:'2', name:'Food', creator:'Khanh', date:'Feb 12, 2024', amount:'100', currency:'CAD', icon:<MaterialIcons name="payments" size={30} color={'#EDEDED'}/>},
  //   // {id:'2', name:'Logout', icon:<MaterialIcons name="logout" size={28} color={'#EDEDED'}/>, onPress: handleLogout}
  // ]
 


  return (
    <KeyboardAwareScrollView style={[styles.container]}>
      <Text style = {[styles.titleText]} >View Bills</Text>

      <View style={[styles.bodyContainer]}>
        <View style={[styles.headingContainer]}>
          <Text style = {[styles.headingText]} >Your Bills</Text>
          <Text style={[styles.seeAllText]}>See all</Text>
        </View>

        <View style={[styles.yourBillsContainer]}>
          {billInfo.map((option)=> (
            <TouchableOpacity style={[styles.billButton]} key={option.key} onPress={option.onPress}>
                <View style={{display:'flex', flexDirection:'row', alignItems:'center', gap:15}}>
                  <View style={[styles.iconContainer]}>
                    {option.icon}
                  </View>
                  <View style={[styles.billInfoContainer]}>
                    <Text style={[styles.optionText]}>{option.name}</Text>
                    <Text style={[styles.subOptionText]}>Deadline: {option.date}</Text>
                  </View>
                </View>
                <Text style={[styles.optionText]}>{option.amount} {option.currency}</Text> 
            </TouchableOpacity>
          ))}
        </View>
        <Divider color='#85E5CA'/>
      </View>

      <View style={[styles.bodyContainer]}>
        <View style={[styles.headingContainer]}>
          <Text style = {[styles.headingText]} >Others' Bills</Text>
          <Text style={[styles.seeAllText]}>See all</Text>
        </View>

        <View style={[styles.yourBillsContainer]}>
          {otherBillInfo.map((option)=> (
            <TouchableOpacity style={[styles.billButton]} key={option.key} onPress={option.onPress}>
                <View style={{display:'flex', flexDirection:'row', alignItems:'center', gap:15}}>
                  <View style={[styles.iconContainer]}>
                    {option.icon}
                  </View>
                  <View style={[styles.billInfoContainer]}>
                    <Text style={[styles.optionText]}>{option.name}</Text>
                    <Text style={[styles.subOptionText]}>By {option.creator}, Deadline: {option.date}</Text>
                  </View>
                </View>
                <Text style={[styles.optionText]}>{option.amount} {option.currency}</Text> 
            </TouchableOpacity>
          ))}
        </View>
        <Divider color='#85E5CA'/>
      </View>


        {/* <TouchableOpacity style={styles.button} onPress={redirectAccountDetail}>
          <Text style={styles.buttonText}>Account Details</Text>
        </TouchableOpacity>
       */}
    </KeyboardAwareScrollView>
  );
};

export default ViewBills;

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

  headingText:{
    color: 'white',
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
    justifyContent:'space-evenly',
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
    color:'white',
    fontSize: 16,
    fontWeight: 600
  },

  subOptionText:{
    color:'white',
    fontSize: 11,
    fontWeight: 400
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
});
