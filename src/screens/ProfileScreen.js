import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../services/authService';
import LocationService from '../services/locationService';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout', 
      'Are you sure you want to logout?', 
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocationService.stopTracking();
              await AuthService.logout();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>User Information</Text>
          <Text style={styles.userName}>
            {user?.full_name || 'User'}
          </Text>
          
          <View style={styles.userDetails}>
            <Text style={styles.detailText}>
              Email: {user?.email || 'No email provided'}
            </Text>
            <Text style={styles.detailText}>
              Role: {user?.usertype_name || 'Employee'}
            </Text>
            <Text style={styles.detailText}>
              Phone: {user?.mobile_phone || 'N/A'}
            </Text>
            <Text style={styles.detailText}>
              Employee ID: {user?.employee_id || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Actions Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Actions</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => loadUserData()}
          >
            <Text style={styles.actionButtonText}>Refresh Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            Employee Tracker v1.0.0{'\n'}
            Manage your location tracking and view your profile information.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: width * 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    marginVertical: width * 0.05,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: width * 0.05,
    borderRadius: 12,
    marginBottom: width * 0.04,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  userName: {
    fontSize: width * 0.05,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 16,
  },
  userDetails: {
    width: '100%',
  },
  detailText: {
    fontSize: width * 0.04,
    color: '#555',
    marginBottom: 8,
  },
  actionButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButtonText: {
    fontSize: width * 0.04,
    color: '#007AFF',
  },
  logoutButton: {
    paddingVertical: 12,
    borderBottomWidth: 0,
    backgroundColor: '#FF5722',
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: width * 0.04,
    color: '#fff',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    padding: width * 0.04,
    borderRadius: 8,
    marginBottom: width * 0.04,
  },
  infoText: {
    fontSize: width * 0.035,
    color: '#666',
    lineHeight: width * 0.05,
  },
});

export default ProfileScreen;
