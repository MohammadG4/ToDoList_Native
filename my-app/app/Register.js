import React, { useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Register = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email.includes("@") || password.length < 6) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid email and password (at least 6 characters)."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://fake-form.onrender.com/api/todo/register",
        { email, password }
      );

      if (response.data.success) {
        Alert.alert("Registration Successful", "Welcome!");
        await AsyncStorage.setItem("userToken", response.data.token);
        router.navigate("/");
      } else {
        Alert.alert("Registration Failed", "Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again later.");
    }

    setLoading(false);
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-5">
      <Text className="text-3xl font-bold mb-5">Register</Text>

      <TextInput
        className="border border-gray-400 p-3 w-4/5 rounded-md bg-white mb-4"
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        className="border border-gray-400 p-3 w-4/5 rounded-md bg-white mb-4"
        placeholder="Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className={`bg-blue-500 p-3 w-4/5 rounded-md items-center ${
          loading ? "opacity-50" : "opacity-100"
        }`}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text className="text-white font-bold text-lg">
          {loading ? "Registering..." : "Register"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Register;
