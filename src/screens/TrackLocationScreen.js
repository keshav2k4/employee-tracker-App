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
import SimpleIcon from '../components/SimpleIcon';
import LocationService from '../services/locationService';

const { width } = Dimensions.get('window');

const TrackLocationScreen = ({ navigation }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationUpdates, setLocationUpdates] = useState(0);

  useEffect(() => {
    initializeScreen();
    const interval = setInterval(() => {
      if (LocationService.isTrackingActive()) {
        setLocationUpdates(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initializeScreen = async () => {
    try {
      setIsTracking(LocationService.isTrackingActive());
      
      try {
        const location = await LocationService.getCurrentLocationWithName();
        setCurrentLocation(location);
      } catch (error) {
        console.log('Could not get current location:', error);
      }
    } catch (error) {
      console.error('Error initializing track location screen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTracking = async () => {
    try {
      await LocationService.startTracking();
      setIsTracking(true);
      setLocationUpdates(0);
      Alert.alert('Success', 'Location tracking started!');
      
      // Update current location
      const location = await LocationService.getCurrentLocationWithName();
      setCurrentLocation(location);
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
    await initializeScreen();
    setRefreshing(false);
  };

  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await LocationService.getCurrentLocationWithName();
      setCurrentLocation(location);
      Alert.alert('Location Updated', 'Your current location has been refreshed!');
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToMap = () => navigation.navigate('Map');

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
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Track Location</Text>
          <SimpleIcon name="location-on" size={28} color="#007AFF" />
        </View>

        {/* Tracking Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SimpleIcon 
              name={isTracking ? "radio-button-checked" : "radio-button-unchecked"} 
              size={24} 
              color={isTracking ? "#4CAF50" : "#FF5722"} 
            />
            <Text style={styles.cardTitle}>Tracking Status</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: isTracking ? '#4CAF50' : '#FF5722' }]}>
              {isTracking ? 'Active' : 'Inactive'}
            </Text>
            {isTracking && (
              <Text style={styles.updateCount}>
                Updates sent: {Math.floor(locationUpdates / 30)}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.trackingButton,
              { backgroundColor: isTracking ? '#FF5722' : '#4CAF50' },
            ]}
            onPress={isTracking ? handleStopTracking : handleStartTracking}
          >
            <SimpleIcon 
              name={isTracking ? "stop" : "play-arrow"} 
              size={20} 
              color="#fff" 
              style={{ marginRight: 8 }}
            />
            <Text style={styles.trackingButtonText}>
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Current Location Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SimpleIcon name="my-location" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>Current Location</Text>
          </View>

          {currentLocation ? (
            <View style={styles.locationContainer}>
              <Text style={styles.locationName}>
                {currentLocation.locationName || 'Unknown Location'}
              </Text>
              <Text style={styles.coordinates}>
                Lat: {currentLocation.latitude?.toFixed(6)}
              </Text>
              <Text style={styles.coordinates}>
                Long: {currentLocation.longitude?.toFixed(6)}
              </Text>
              <Text style={styles.accuracy}>
                Accuracy: {currentLocation.accuracy?.toFixed(0)}m
              </Text>
              {currentLocation.timestamp && (
                <Text style={styles.timestamp}>
                  Updated: {new Date(currentLocation.timestamp).toLocaleString()}
                </Text>
              )}
            </View>
          ) : (
            <Text style={styles.noLocation}>No location data available</Text>
          )}

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleGetCurrentLocation}
          >
            <SimpleIcon name="refresh" size={20} color="#007AFF" style={{ marginRight: 8 }} />
            <Text style={styles.refreshButtonText}>Refresh Location</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <SimpleIcon name="dashboard" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>Quick Actions</Text>
          </View>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToMap}>
            <SimpleIcon name="map" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>View on Map</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <SimpleIcon name="info-outline" size={20} color="#666" />
          <Text style={styles.infoText}>
            Location tracking runs in the background and sends updates every 30 seconds when active.
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: width * 0.05,
    fontWeight: '600',
    marginBottom: 4,
  },
  updateCount: {
    fontSize: width * 0.035,
    color: '#666',
  },
  trackingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: width * 0.04,
    borderRadius: 8,
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 16,
  },
  locationName: {
    fontSize: width * 0.042,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: width * 0.038,
    color: '#666',
    marginBottom: 2,
  },
  accuracy: {
    fontSize: width * 0.038,
    color: '#666',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: width * 0.035,
    color: '#999',
    marginTop: 4,
  },
  noLocation: {
    fontSize: width * 0.04,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: width * 0.035,
    backgroundColor: '#f0f7ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  refreshButtonText: {
    color: '#007AFF',
    fontSize: width * 0.04,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: width * 0.04,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: width * 0.042,
    fontWeight: '500',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: width * 0.04,
    borderRadius: 8,
    marginBottom: width * 0.04,
  },
  infoText: {
    flex: 1,
    fontSize: width * 0.035,
    color: '#666',
    marginLeft: 8,
    lineHeight: width * 0.05,
  },
});

export default TrackLocationScreen;
