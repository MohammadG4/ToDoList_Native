import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  Button,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { FontAwesome } from "@expo/vector-icons";

const Task = ({ text, date, id, completed, content, onDelete }) => {
  const [isChecked, setIsChecked] = useState(completed);
  const [modalVisible, setModalVisible] = useState(false);
  const [taskTitle, setTaskTitle] = useState(text);
  const [day, setDay] = useState(date.slice(8, 10));
  const [month, setMonth] = useState(date.slice(5, 7));
  const [year, setYear] = useState(date.slice(0, 4));
  const [isLoading, setIsLoading] = useState(false);

  async function handlePress() {
    try {
      setIsLoading(true);
      const newStatus = !isChecked;
      setIsChecked(newStatus);
      await updateTaskStatus(newStatus);
    } catch (error) {
      Alert.alert("Error", "Failed to update task status");
      setIsChecked(isChecked);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateTaskStatus(status) {
    const userToken = await AsyncStorage.getItem("userToken");
    if (!userToken) return;

    try {
      await axios.patch(
        `https://fake-form.onrender.com/api/todo/${id}`,
        {
          title: taskTitle,
          content: content,
          endDate: date,
          completed: status,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      throw error;
    }
  }

  async function handleDeleteTask() {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) return;

      await axios.delete(`https://fake-form.onrender.com/api/todo/${id}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        data: {
          title: taskTitle,
          content: content,
          completed: isChecked,
          endDate: date,
        },
      });

      if (typeof onDelete === "function") {
        onDelete();
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to delete task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleLongPress() {
    setModalVisible(true);
  }

  async function handleSaveEdit() {
    if (!taskTitle.trim()) {
      Alert.alert("Error", "Task title cannot be empty!");
      return;
    }

    if (
      !day ||
      !month ||
      !year ||
      day.length !== 2 ||
      month.length !== 2 ||
      year.length !== 4
    ) {
      Alert.alert("Error", "Please enter a valid date");
      return;
    }

    try {
      setIsLoading(true);
      const newDate = `${year}-${month}-${day}`;
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) return;

      await axios.patch(
        `https://fake-form.onrender.com/api/todo/${id}`,
        {
          title: taskTitle,
          content: content,
          endDate: newDate,
          completed: isChecked,
        },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (typeof onDelete === "function") {
        onDelete();
      }
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update task. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        disabled={isLoading}
        className={`${
          isChecked ? "bg-green-200 opacity-70" : "opacity-100 bg-white"
        } shadow shadow-black rounded-lg w-full p-[15px] my-3 flex flex-row justify-between items-center`}
      >
        <View className="flex flex-row items-center flex-wrap">
          <View
            className={`flex justify-center items-center w-[24px] h-[24px] ${
              isChecked ? "bg-green-500" : "bg-[#55BCF6]"
            } opacity-[0.4] rounded-md mr-4`}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              isChecked && <FontAwesome name="check" size={16} color="white" />
            )}
          </View>
          <Text
            className={`text-black min-w-[80%] text-lg ${
              isChecked ? "line-through" : ""
            }`}
          >
            {taskTitle}
          </Text>
        </View>
        <View>
          <Text className={`w-[89px] right-[50px] h-[35px] align-middle font-bold text-center bg-transparent  ${
          isChecked ? "border-green-500" : "border-[#55bcf6]"
        }  border-2 rounded-md`}>
            {date}
          </Text>
        </View>
      </Pressable>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white w-[90%] p-5 rounded-xl">
            <Text className="text-xl font-bold mb-3">Edit Task</Text>
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
                title={isLoading ? "Saving..." : "Save"}
                disabled={isLoading}
                onPress={handleSaveEdit}
              />
              <Button
                title={isLoading ? "Deleting..." : "Delete"}
                disabled={isLoading}
                color="red"
                onPress={handleDeleteTask}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Task;
