import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

export default function SettingsScreen() {
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [cloudBackup, setCloudBackup] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const biometrics = await AsyncStorage.getItem('useBiometrics');
      const backup = await AsyncStorage.getItem('cloudBackup');
      setUseBiometrics(biometrics === 'true');
      setCloudBackup(backup === 'true');
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const toggleBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert('Incompatible Device', 'Your device doesn\'t support biometric authentication.');
      return;
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) {
      Alert.alert('No Biometrics Found', 'Please set up biometric authentication in your device settings.');
      return;
    }

    const newValue = !useBiometrics;
    setUseBiometrics(newValue);
    updateSetting('useBiometrics', newValue);

    if (newValue) {
      Alert.alert('Biometrics Enabled', 'You will now use biometric authentication to open the app.');
    } else {
      Alert.alert('Biometrics Disabled', 'You will no longer use biometric authentication to open the app.');
    }
  };

  const toggleCloudBackup = () => {
    setCloudBackup(!cloudBackup);
    updateSetting('cloudBackup', !cloudBackup);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Use Biometrics for Authentication</Text>
        <Switch
          trackColor={{ false: '#ccc', true: '#2cfc89' }}
          thumbColor={useBiometrics ? '#08d665' : '#f4f3f4'}
          value={useBiometrics}
          onValueChange={toggleBiometrics}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingText}>Enable Cloud Backup</Text>
        <Switch
          trackColor={{ false: '#ccc', true: '#2cfc89' }}
          thumbColor={cloudBackup ? '#08d665' : '#f4f3f4'}
          value={cloudBackup}
          onValueChange={toggleCloudBackup}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  settingText: {
    fontSize: 18,
    color: '#333',
  },
});
