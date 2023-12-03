import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const HomePage = () => {
  return (
    <View style={[styles.container]}>
      <Text>HomePage</Text>
    </View>
  )
}

export default HomePage

const styles = StyleSheet.create({

  container:{
    backgroundColor:'#153A59',
    flex: 1
  }
})