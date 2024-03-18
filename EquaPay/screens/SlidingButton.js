import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, TouchableOpacity, StyleSheet, Text, Alert } from "react-native";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";

const db = getFirestore();

const SlidingButton = ({ name, docID }) => {
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

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.text}>{name}</Text>
      </View>
      <TouchableOpacity onPress={handleAlert} style={styles.button}>
        <Text style={styles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  row: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default SlidingButton;
