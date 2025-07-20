import { Dimensions } from 'react-native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../services/authService';
import { Card } from 'react-native-paper';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('Error', 'Please enter both phone number and password');
      return;
    }

    setLoading(true);

    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - Please check your internet connection')), 30000);
      });

      const loginPromise = AuthService.login(phone, password);

      const result = await Promise.race([loginPromise, timeoutPromise]);

      console.log('Login result:', result);

      if (result && result.success) {
        console.log('Login successful, navigating to Dashboard');
        setTimeout(() => {
          navigation.replace('Dashboard');
        }, 100);
      } else {
        console.log('Login failed:', result?.error);
        Alert.alert('Login Failed', result?.error || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error caught:', error);
      Alert.alert('Error', error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          <View style={styles.loginContainer}>
            <Card style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.title}>Employee Tracker</Text>
                <Text style={styles.subtitle}>Login to your account</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
                    secureTextEntry
                    autoCapitalize="none"
                  />
                </View>

                <TouchableOpacity
                  style={[styles.loginButton, loading && styles.disabledButton]}
                  onPress={handleLogin}
                  disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={styles.loginButtonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Card>

            <View style={styles.testCredentialsContainer}>
              <Text style={styles.testCredentialsTitle}>Available Credentials:</Text>
              <TouchableOpacity
                style={[styles.testButton, styles.primaryButton]}
                onPress={() => {
                  setPhone('9898119868');
                  setPassword('superadmin');
                }}>
                <Text style={[styles.testButtonText, styles.primaryButtonText]}>✅ Admin User (Working)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.testButton, styles.disabledButton]}
                onPress={() => {
                  Alert.alert(
                    'Credentials Invalid',
                    'Manager credentials (9924310757) are invalid.\n\nServer response: "Invalid username and/or password"\n\nThe password may have been changed or the account disabled.',
                    [{ text: 'OK' }]
                  );
                }}>
                <Text style={[styles.testButtonText, styles.disabledButtonText]}>❌ Manager User (Invalid)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.testButton}
                onPress={async () => {
                  try {
                    setLoading(true);
                    const test1 = await AuthService.login('9898119868', 'superadmin');
                    const test2 = await AuthService.login('9924310757', 'superadmin');

                    Alert.alert(
                      'Credential Test Results',
                      `Admin (9898119868): ${test1.success ? '✅ Working' : '❌ Failed'}\n` +
                      `Manager (9924310757): ${test2.success ? '✅ Working' : '❌ Failed'}\n\n` +
                      `Error details:\n` +
                      `Admin: ${test1.error || 'None'}${test1.statusCode ? ` (${test1.statusCode})` : ''}\n` +
                      `Manager: ${test2.error || 'None'}${test2.statusCode ? ` (${test2.statusCode})` : ''}`
                    );
                  } catch (error) {
                    Alert.alert('Test Error', error.message);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}>
                <Text style={styles.testButtonText}>🧪 Test All Credentials</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.footerText}>Employee Tracker v1.0 - Expo</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9eef6',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: width * 0.07,
    paddingVertical: height * 0.05,
  },
  card: {
    borderRadius: 16,
    paddingVertical: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  cardContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1e1e1e',
  },
  subtitle: {
    fontSize: width * 0.045,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: width * 0.04,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: width * 0.04,
    fontSize: width * 0.045,
    backgroundColor: '#fefefe',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: width * 0.04,
    alignItems: 'center',
    marginTop: width * 0.05,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 30,
  },
  testCredentialsContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  testCredentialsTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#e8f5e8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  primaryButtonText: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  disabledButtonText: {
    color: '#999',
    fontWeight: '500',
  },
});

export default LoginScreen;
