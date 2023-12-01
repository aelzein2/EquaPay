import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export const myAsyncStorage = {
  getData: async (key) => {
    try {
      let data = await AsyncStorage.getItem(`@${key}`);
      return JSON.parse(data);
    } catch (err) {
      Alert.alert("Unable to retrieve data!");
    }
  },

  setData: async (key, value) => {
    try {
      await AsyncStorage.setItem(`@${key}`, JSON.stringify(value));
    } catch (err) {
      Alert.alert("Unable to set data!");
    }
  },
};