import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Alert, Image, Animated } from "react-native";
import { Divider } from '@rneui/themed';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import friendAvatar from "../assets/img/friendAvatar.png";

const db = getFirestore();

const SlidingButton = ({ name, docID, email }) => {
  const[isShow, setIsShow]=useState(false);

  function handleAlert() {
    Alert.alert("Delete Friend", "Are You Sure?", [
      {
        text: "Cancel",
        onPress: () => {
          console.log("Cancelled");
        },
        style: "cancel",
      },
      {
        text: "Confirm",
        onPress: () => {
          handleDeleteFriend();
        },
      },
    ]);
  }

  async function handleDeleteFriend() {
    console.log("works");
    await deleteDoc(doc(db, "friends", docID));
  }

  const handleShowDelete = () => {
    if (isShow == false){
      setIsShow(true);
    }
    else if (isShow == true){
      setIsShow(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.nameContainer]}>
        <Image source={friendAvatar} style={{ resizeMode:'contain', width: 50, height: 50 }}/>
        <View style={[styles.textContainer]}>
          <Text style={[styles.text]}>{name}</Text>
          <Text style={[styles.subText]}>{email}</Text>
        </View>
      </View>

      <View style={styles.button}>
        <TouchableOpacity style={{marginRight:10}}  onPress={handleShowDelete}>
          <AntDesign name="left" size={18} color="#85E5CA" />
        </TouchableOpacity>
        {isShow &&
        <View style={[styles.deleteButton]}>
          <TouchableOpacity onPress={handleAlert} >
            <MaterialIcons name="delete-outline" size={24} color="#EDEDED" />
          </TouchableOpacity>
        </View>
        }   
      </View>
      
      
     
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent:'space-between',
    alignItems: "center",
  },

  nameContainer:{
    flex: 1,
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
    gap: 20
  },

  textContainer:{
    flex: 1, 
    gap:5,
  },

  button:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    gap: 5,
  },

  deleteButton:{
    backgroundColor:'#D83434',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:'100%',
    width: 40, 
    height: 40

  },

  buttonText: {
    color: "#EDEDED",
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    flex: 1,
  },
  text: {
    color:'#EDEDED',
    fontSize: 16,
    fontWeight: 600,
  },
  subText:{
    color:'#EDEDED',
    fontSize: 10,
    fontWeight: 400
  },
});

export default SlidingButton;
