import {
    KeyboardAvoidingView,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Dimensions
}
    from 'react-native'

import React from 'react'


const { width } = Dimensions.get('window');


const Login = () => {
    return (

        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
        >

            <View style={styles.inputContainer}>

                <TextInput
                    placeholder="Email"
                    //value = {email}
                    //onChangeText={(text) => setEmail(text)}
                    style={styles.input}

                />

                <TextInput
                    placeholder="Password"
                    //value = {password}
                    //onChangeText={(text) => setEmail(text)}
                    style={styles.input}
                    secureTextEntry

                />
            </View>

            <View style={styles.buttonContainer}>

                <TouchableOpacity
                    onPress={() => { }}
                    style={styles.button}
                >
                    <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => { }}
                    style={[styles.button, styles.buttonOutline]}
                >
                    <Text style={styles.buttonOutlineText}>Register</Text>
                </TouchableOpacity>


            </View>

        </KeyboardAvoidingView>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#e0f4f1', // Light greenish background
    },

    inputContainer: {
        width: width * 0.8, // Responsive width
        backgroundColor: '#ffffff', // White background for input container
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        padding: 20,
    },

    input: {
        backgroundColor: "#d0f0e8", // Light greenish for inputs
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginTop: 10,
        fontSize: 16,
    },

    buttonContainer: {
        width: width * 0.6, // Responsive width
        justifyContent: "center",
        alignItems: "center",
        marginTop: 40,
    },

    button: {
        backgroundColor: '#40a7c3', // Light blue
        width: '100%',
        padding: 15,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 10,
    },

    buttonOutline: {
        backgroundColor: 'white',
        borderColor: '#40a7c3', // Light blue border
        borderWidth: 2,
    },

    buttonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
    },

    buttonOutlineText: {
        color: '#40a7c3', // Light blue text
        fontWeight: 'bold',
        fontSize: 18,
    },
});


