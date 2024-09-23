import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function KeyManagementScreen() {
  const [keys, setKeys] = useState([]);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const storedKeys = await AsyncStorage.getItem('encryptionKeys');
      if (storedKeys !== null) {
        setKeys(JSON.parse(storedKeys));
      }
    } catch (error) {
      console.error('Error loading keys:', error);
    }
  };

  const generateNewKey = async () => {
    const newKey = Math.random().toString(36).substring(2, 15);
    const updatedKeys = [...keys, { id: Date.now().toString(), value: newKey }];
    setKeys(updatedKeys);
    try {
      await AsyncStorage.setItem('encryptionKeys', JSON.stringify(updatedKeys));
    } catch (error) {
      console.error('Error saving new key:', error);
    }
  };

  const deleteKey = async (id) => {
    const updatedKeys = keys.filter(key => key.id !== id);
    setKeys(updatedKeys);
    try {
      await AsyncStorage.setItem('encryptionKeys', JSON.stringify(updatedKeys));
    } catch (error) {
      console.error('Error deleting key:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={generateNewKey}>
        <Text style={styles.buttonText}>Generate New Key</Text>
      </TouchableOpacity>
      <FlatList
        data={keys}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.keyItem}>
            <Text>{item.value}</Text>
            <TouchableOpacity onPress={() => deleteKey(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    backgroundColor: '#08d665',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  keyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  deleteText: {
    color: 'red',
  },
});