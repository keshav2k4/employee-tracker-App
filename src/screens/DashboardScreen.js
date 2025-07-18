import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../services/authService';
import LocationService from '../services/locationService';

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      setIsTracking(LocationService.isTrackingActive());
      
      // Get current location
      try {
        const location = await LocationService.getCurrentLocationWithName();
        setCurrentLocation(location);
      } catch (error) {
        console.log('Could not get current location:', error);
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error);
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
            await LocationService.stopTracking();
            await AuthService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleStartTracking = async () => {
    try {
      await LocationService.startTracking();
      setIsTracking(true);
      Alert.alert('Success', 'Location tracking started!');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to start location tracking');
    }
  };

  const handleStopTracking = () => {
    LocationService.stopTracking();
    setIsTracking(false);
    Alert.alert('Success', 'Location tracking stopped!');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
  };

  const navigateToMap = () => {
    navigation.navigate('Map');
  };

  const navigateToHistory = () => {
    navigation.navigate('History');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={styles.header}>
          <Text style={styles.title}>Employee Tracker</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.userCard}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'No email provided'}</Text>
          <Text style={styles.userDetails}>Role: {user?.usertype_name || 'Employee'}</Text>
          <Text style={styles.userDetails}>Phone: {user?.mobile_phone || 'No phone'}</Text>
          <Text style={styles.userDetails}>Employee ID: {user?.employee_id || 'N/A'}</Text>
        </View>

        <View style={styles.trackingCard}>
          <Text style={styles.cardTitle}>Location Tracking</Text>
          <View style={styles.trackingStatus}>
            <Text style={styles.statusText}>
              Status: {isTracking ? 'Active' : 'Inactive'}
            </Text>
            <View style={[styles.statusIndicator, 
              { backgroundColor: isTracking ? '#4CAF50' : '#FF5722' }]} />
          </View>
          
          {currentLocation && (
            <Text style={styles.locationText}>
              Current Location: {currentLocation.locationName || 'Unknown Location'}
            </Text>
          )}

          <TouchableOpacity
            style={[styles.trackingButton, 
              { backgroundColor: isTracking ? '#FF5722' : '#4CAF50' }]}
            onPress={isTracking ? handleStopTracking : handleStartTracking}>
            <Text style={styles.trackingButtonText}>
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={navigateToMap}>
            <Text style={styles.actionButtonText}>View Employee Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToHistory}>
            <Text style={styles.actionButtonText}>View Location History</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  logoutButtonText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '500',
  },
  userCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userDetails: {
    fontSize: 14,
    color: '#777',
    marginBottom: 3,
  },
  trackingCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  trackingButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default DashboardScreen;
