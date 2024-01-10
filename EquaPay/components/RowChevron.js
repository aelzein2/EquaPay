import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function RowChevron({ text, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.rowContainer} onPress={onPress}>
      <Text style={styles.subtitle}>{text}</Text>
      <Icon name={icon} size={30} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  subtitle: {
    fontSize: 16,
  },
});