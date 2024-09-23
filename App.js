import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

// Import screens
import HomeScreen from './screens/HomeScreen';
import EncryptScreen from './screens/EncryptScreen';
import DecryptScreen from './screens/DecryptScreen';
import KeyManagementScreen from './screens/KeyManagementScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Encrypt') {
            iconName = focused ? 'lock-closed' : 'lock-closed-outline';
          } else if (route.name === 'Decrypt') {
            iconName = focused ? 'lock-open' : 'lock-open-outline';
          } else if (route.name === 'Keys') {
            iconName = focused ? 'key' : 'key-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#08d665',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          paddingBottom: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Encrypt" component={EncryptScreen} />
      <Tab.Screen name="Decrypt" component={DecryptScreen} />
      <Tab.Screen name="Keys" component={KeyManagementScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function AuthScreen({ onAuthSuccess }) {
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    authenticateUser();
  }, []);

  const authenticateUser = async () => {
    try {
      const useBiometrics = await AsyncStorage.getItem('useBiometrics');

      if (useBiometrics === 'true') {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to access the app',
          fallbackLabel: 'Use passcode',
        });

        if (result.success) {
          onAuthSuccess();
        } else {
          console.log('Authentication failed');
        }
      } else {
        onAuthSuccess();
      }
    } catch (error) {
      console.error('Error authenticating', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      {isAuthenticating ? (
        <ActivityIndicator size="large" color="#08d665" />
      ) : (
        <Text>Authentication failed. Please try again.</Text>
      )}
    </View>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!isAuthenticated ? (
          <Stack.Screen
            name="Auth"
            options={{ headerShown: false }}
          >
            {props => <AuthScreen {...props} onAuthSuccess={handleAuthSuccess} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});