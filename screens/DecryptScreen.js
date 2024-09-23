import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { decrypt } from '../utils/encryption';

export default function DecryptScreen() {
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

  const handleDecrypt = async () => {
    if (!selectedFile || !password) {
      alert('Please select a file and enter a password');
      return;
    }

    try {
      const decryptedData = await decrypt(selectedFile.uri, password);
      // Here you would typically save or display the decrypted data
      console.log('File decrypted successfully');
      alert('File decrypted successfully');
    } catch (error) {
      console.error('Decryption failed:', error);
      alert('Decryption failed');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={pickDocument}>
        <Text style={styles.buttonText}>Select Encrypted File</Text>
      </TouchableOpacity>
      {selectedFile && (
        <Text style={styles.fileInfo}>
          Selected: {selectedFile.name || 'File'}
        </Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Enter decryption password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleDecrypt}>
        <Text style={styles.buttonText}>Decrypt File</Text>
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