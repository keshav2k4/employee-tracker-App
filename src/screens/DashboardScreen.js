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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthService from '../services/authService';
import LocationService from '../services/locationService';

const { width } = Dimensions.get('window');

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
    Alert.alert('Logout', 'Are you sure you want to logout?', [
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
    ]);
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

  const navigateToMap = () => navigation.navigate('Map');
  const navigateToHistory = () => navigation.navigate('History');

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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        contentContainerStyle={{ paddingBottom: width * 0.1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Employee Tracker</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.userInfo}>{user?.email || 'No email provided'}</Text>
          <Text style={styles.userInfo}>Role: {user?.usertype_name || 'Employee'}</Text>
          <Text style={styles.userInfo}>Phone: {user?.mobile_phone || 'N/A'}</Text>
          <Text style={styles.userInfo}>Employee ID: {user?.employee_id || 'N/A'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Location Tracking</Text>
          <View style={styles.trackingStatus}>
            <Text style={styles.statusText}>Status: {isTracking ? 'Active' : 'Inactive'}</Text>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isTracking ? '#4CAF50' : '#FF5722' },
              ]}
            />
          </View>

          {currentLocation && (
            <Text style={styles.locationText}>
              Current Location: {currentLocation.locationName || 'Unknown'}
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.trackingButton,
              { backgroundColor: isTracking ? '#FF5722' : '#4CAF50' },
            ]}
            onPress={isTracking ? handleStopTracking : handleStartTracking}
          >
            <Text style={styles.trackingButtonText}>
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Actions</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: width * 0.05,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.02,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  logoutButtonText: {
    color: '#FF5722',
    fontSize: width * 0.035,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    padding: width * 0.05,
    borderRadius: 10,
    marginBottom: width * 0.05,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  userName: {
    fontSize: width * 0.05,
    fontWeight: '600',
    color: '#007AFF',
  },
  userInfo: {
    fontSize: width * 0.04,
    color: '#555',
    marginBottom: 4,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: width * 0.04,
    color: '#333',
    marginRight: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationText: {
    fontSize: width * 0.04,
    color: '#666',
    marginBottom: 12,
  },
  trackingButton: {
    paddingVertical: width * 0.035,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: width * 0.045,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '500',
  },
});

export default DashboardScreen;
