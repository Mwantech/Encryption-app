import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as Contacts from 'expo-contacts';
import { encrypt } from '../utils/encryption';

export default function EncryptScreen() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [password, setPassword] = useState('');

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking document:', err);
      alert('Error picking document');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      alert('Error picking image');
    }
  };

  const pickContact = async () => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const contact = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });
        if (contact.data.length > 0) {
          const contactData = JSON.stringify(contact.data[0]);
          setSelectedFile({ name: 'contact.json', uri: 'data:application/json,' + contactData });
        } else {
          alert('No contacts found');
        }
      } else {
        alert('Permission to access contacts was denied');
      }
    } catch (err) {
      console.error('Error picking contact:', err);
      alert('Error picking contact');
    }
  };

  const handleEncrypt = async () => {
    if (!selectedFile || !password) {
      alert('Please select a file and enter a password');
      return;
    }

    try {
      const encryptedData = await encrypt(selectedFile.uri, password);
      // Here you would typically save the encrypted data
      console.log('File encrypted successfully');
      alert('File encrypted successfully');
    } catch (error) {
      console.error('Encryption failed:', error);
      alert('Encryption failed');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickDocument}>
        <Text style={styles.buttonText}>Select Document</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Select Image/Video</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={pickContact}>
        <Text style={styles.buttonText}>Select Contact</Text>
      </TouchableOpacity>
      {selectedFile && (
        <Text style={styles.fileInfo}>
          Selected: {selectedFile.name || 'File'}
        </Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Enter encryption password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleEncrypt}>
        <Text style={styles.buttonText}>Encrypt File</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#08d665',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  fileInfo: {
    marginVertical: 10,
  },
});