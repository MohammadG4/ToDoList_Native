import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
} from "react-native";
import Task from "./components/Task";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import '../global.css';

const Index = () => {
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [content, setContent] = useState("NaN");
  const [toggle, setToggle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, [toggle]);

  async function fetchTodos() {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        router.navigate("/Login");
        return;
      }

      const res = await axios.get("https://fake-form.onrender.com/api/todo", {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      setTodos(res.data.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }

  function handleToggle() {
    setToggle(prev => !prev);
  }

  function handleLogout() {
    AsyncStorage.removeItem("userToken")
      .then(() => {
        router.replace("/Login");
      })
      .catch((error) => {
        Alert.alert("Error", "Failed to logou",error);
      });
  }

  async function handleAdd() {
    if (taskTitle.trim() === "") {
      Alert.alert("Error", "Please enter a task title");
      return;
    }

    if (!day || !month || !year) {
      Alert.alert("Error", "Please enter a valid date");
      return;
    }

    try {
      setIsLoading(true);
      const fullDate = `${year}-${month}-${day}`;
      const userToken = await AsyncStorage.getItem("userToken");
      
      if (!userToken) {
        router.navigate("/Login");
        return;
      }

      const response = await axios.post(
        "https://fake-form.onrender.com/api/todo",
        {
          title: taskTitle,
          content: content,
          endDate: fullDate,
          completed: false
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      
      handleToggle();
      
      setIsOpen(false);
      setTaskTitle("");
      setDay("");
      setMonth("");
      setYear("");
    } catch (error) {
      Alert.alert("Error", "Failed to asd task");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="w-screen">
      <LinearGradient colors={["#e8eaed", "#e8eaed", "#e8eaed", "#e8eaed"]}>
        <View className="w-screen h-screen flex pt-[50px] px-[20px]">
          <View>
            <View className="flex flex-row justify-between items-center mb-6">
              <Text className="text-[24px] font-bold align-middle text-center">
                Today's Tasks
              </Text>
              <View>
                <TouchableOpacity
                  onPress={handleLogout}
                  className="bg-red-500 p-3 rounded-md"
                >
                  <Text className="text-white text-center font-bold">
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <ScrollView className="mb-16">
              {isLoading && todos.length === 0 ? (
                <Text className="text-center py-4 text-gray-500">Loading tasks...</Text>
              ) : todos.length === 0 ? (
                <Text className="text-center py-4 text-gray-500">No tasks available. Add a new task!</Text>
              ) : (
                todos.map((t) => (
                  <Task
                    key={t._id}
                    text={t.title}
                    date={t.endDate.slice(0, 10)}
                    id={t._id}
                    completed={t.completed}
                    content={t.content}
                    onDelete={handleToggle}
                  />
                ))
              )}
            </ScrollView>
          </View>
          
          <View className="absolute bg-[#55BCF6] justify-center items-center bottom-[30px] right-[30px] w-[60px] h-[60px] rounded-2xl">
            <TouchableOpacity onPress={() => setIsOpen(true)}>
              <Text className="text-white text-[34px]">+</Text>
            </TouchableOpacity>
          </View>

          <Modal
            animationType="fade"
            transparent={true}
            visible={isOpen}
            onRequestClose={() => setIsOpen(false)}
          >
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white w-[90%] p-5 rounded-xl">
                <Text className="text-xl font-bold mb-3">Add New Task</Text>
                <TextInput
                  className="border border-gray-300 p-2 rounded-md mb-4"
                  placeholder="Enter task title..."
                  value={taskTitle}
                  onChangeText={setTaskTitle}
                />
                <Text className="text-lg font-semibold mb-2">End Date:</Text>
                <View className="flex-row justify-between">
                  <TextInput
                    className="border border-gray-300 p-2 rounded-md text-center w-[30%]"
                    placeholder="DD"
                    maxLength={2}
                    keyboardType="numeric"
                    value={day}
                    onChangeText={setDay}
                  />
                  <TextInput
                    className="border border-gray-300 p-2 rounded-md text-center w-[30%]"
                    placeholder="MM"
                    maxLength={2}
                    keyboardType="numeric"
                    value={month}
                    onChangeText={setMonth}
                  />
                  <TextInput
                    className="border border-gray-300 p-2 rounded-md text-center w-[30%]"
                    placeholder="YYYY"
                    maxLength={4}
                    keyboardType="numeric"
                    value={year}
                    onChangeText={setYear}
                  />
                </View>
                <View className="flex-row justify-between mt-4">
                  <Button
                    title="Cancel"
                    color="red"
                    onPress={() => setIsOpen(false)}
                  />
                  <Button 
                    title={isLoading ? "Adding..." : "Add"} 
                    disabled={isLoading}
                    onPress={handleAdd} 
                  />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </LinearGradient>
    </View>
  );
};

export default Index;