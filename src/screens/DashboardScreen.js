import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AuthService from '../services/authService';
import LocationService from '../services/locationService';
import SimpleIcon from '../components/SimpleIcon';

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
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.titleBackground}
          >
            <Text style={styles.title}>📍 Employee Tracker</Text>
          </LinearGradient>
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
          <Text style={styles.cardHeader}>Quick Actions</Text>
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
    backgroundColor: '#f8fafc',
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
    alignItems: 'center',
    marginVertical: width * 0.06,
  },
  titleBackground: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: width * 0.05,
    borderRadius: 20,
    marginBottom: width * 0.04,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1a202c',
  },
  userName: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 8,
  },
  userInfo: {
    fontSize: width * 0.038,
    color: '#4a5568',
    marginBottom: 4,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: width * 0.04,
    color: '#2d3748',
    fontWeight: '600',
    marginRight: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  locationText: {
    fontSize: width * 0.038,
    color: '#4a5568',
    marginBottom: 16,
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 8,
  },
  trackingButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: width * 0.042,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
});

export default DashboardScreen;
