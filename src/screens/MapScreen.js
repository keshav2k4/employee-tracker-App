import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LocationService from '../services/locationService';
import AuthService from '../services/authService';

const MapScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [employeeLocations, setEmployeeLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [region, setRegion] = useState({
    latitude: 23.0225, // Default to Gujarat, India
    longitude: 72.5714,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
      
      // Get current location
      try {
        const location = await LocationService.getCurrentLocationWithName();
        setCurrentLocation(location);
        setRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } catch (error) {
        console.log('Could not get current location:', error);
      }

      // Get employee locations (this might fail if API endpoint doesn't exist)
      try {
        const locations = await LocationService.getAllEmployeeLocations();
        setEmployeeLocations(Array.isArray(locations) ? locations : []);
      } catch (error) {
        console.log('Could not get employee locations:', error);
        setEmployeeLocations([]);
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    initializeMap();
  };

  const handleMyLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      setCurrentLocation(location);
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please check location permissions.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Employee Locations</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentContainer}>
        {/* Current User Location Card */}
        {currentLocation && (
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Text style={styles.locationTitle}>📍 Your Current Location</Text>
              <TouchableOpacity
                style={styles.openMapButton}
                onPress={() => {
                  const url = `https://maps.google.com/maps?q=${currentLocation.latitude},${currentLocation.longitude}`;
                  Linking.openURL(url);
                }}
              >
                <Text style={styles.openMapText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.locationName}>{currentLocation.locationName}</Text>
            <View style={styles.locationDetails}>
              <Text style={styles.detailText}>Latitude: {currentLocation.latitude.toFixed(6)}</Text>
              <Text style={styles.detailText}>Longitude: {currentLocation.longitude.toFixed(6)}</Text>
              <Text style={styles.detailText}>Accuracy: {currentLocation.accuracy?.toFixed(0)}m</Text>
              <Text style={styles.detailText}>Updated: {new Date(currentLocation.timestamp).toLocaleTimeString()}</Text>
            </View>
          </View>
        )}

        {/* Employee Locations */}
        {employeeLocations && employeeLocations.length > 0 && (
          <View style={styles.employeeSection}>
            <Text style={styles.sectionTitle}>👥 Employee Locations</Text>
            {employeeLocations.map((employee, index) => (
              <View key={index} style={styles.employeeCard}>
                <View style={styles.employeeHeader}>
                  <Text style={styles.employeeName}>{employee.name || `Employee ${index + 1}`}</Text>
                  <TouchableOpacity
                    style={styles.openMapButton}
                    onPress={() => {
                      const url = `https://maps.google.com/maps?q=${employee.latitude},${employee.longitude}`;
                      Linking.openURL(url);
                    }}
                  >
                    <Text style={styles.openMapText}>View</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.employeeDept}>{employee.department || 'Employee'}</Text>
                <Text style={styles.employeeLocation}>{employee.locationName || 'Unknown Location'}</Text>
              </View>
            ))}
          </View>
        )}

        {/* No Employee Locations Message */}
        {(!employeeLocations || employeeLocations.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>🗺️ No employee locations available</Text>
            <Text style={styles.emptyStateSubtext}>Employee locations will appear here when available</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomControls}>
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={handleMyLocation}
        >
          <Text style={styles.locationButtonText}>📍 My Location</Text>
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            {currentLocation
              ? `Location: ${currentLocation.locationName}`
              : 'Location not available'
            }
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 5,
  },
  refreshButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 120,
  },
  locationCard: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  openMapButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 5,
  },
  openMapText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  locationName: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500',
  },
  locationDetails: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  employeeSection: {
    margin: 15,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  employeeCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  employeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  employeeDept: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  employeeLocation: {
    fontSize: 14,
    color: '#444',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  locationButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default MapScreen;
