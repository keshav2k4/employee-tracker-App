import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimpleIcon from '../components/SimpleIcon';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState({
    latitude: 37.7749,
    longitude: -122.4194,
  });

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <SimpleIcon name="chevron-left" size={24} color="#007AFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Employee Map</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <SimpleIcon name="map" size={48} color="#666" />
          <Text style={styles.mapText}>Interactive Map</Text>
          <Text style={styles.locationText}>
            Current Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
          <Text style={styles.noteText}>
            Note: Interactive maps are not available on web version.{'\n'}
            Please use the mobile app for full map functionality.
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <SimpleIcon name="info-outline" size={20} color="#666" />
        <Text style={styles.infoText}>
          The web version shows a simplified map view. For full GPS tracking and map features, please use the mobile application.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  mapContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e8e8e8',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: width * 0.8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    lineHeight: 20,
  },
});

export default MapScreen;
