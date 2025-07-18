import * as Location from 'expo-location';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class LocationService {
  constructor() {
    this.API_BASE_URL = 'http://app.lazyledgers.com';
    this.SUBDOMAIN = 'qtech.in';
    this.watchId = null;
    this.isTracking = false;
    this.locationSubscription = null;
  }

  async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to get location: ${error.message}`);
    }
  }

  async getLocationName(latitude, longitude) {
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      
      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const parts = [];
        
        if (address.name) parts.push(address.name);
        if (address.street) parts.push(address.street);
        if (address.district) parts.push(address.district);
        if (address.city) parts.push(address.city);
        if (address.region) parts.push(address.region);
        
        return parts.join(', ') || 'Unknown Location';
      }
      
      return 'Unknown Location';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Unknown Location';
    }
  }

  async getCurrentLocationWithName() {
    try {
      const location = await this.getCurrentLocation();
      const locationName = await this.getLocationName(location.latitude, location.longitude);
      
      return {
        ...location,
        locationName
      };
    } catch (error) {
      throw error;
    }
  }

  async sendLocationUpdate(locationData) {
    try {
      const employeeId = await this.getCurrentEmployeeId();
      const token = await this.getAuthToken();
      
      if (!employeeId) {
        throw new Error('Employee ID not found');
      }
      
      if (!token) {
        throw new Error('Auth token not found');
      }
      
      const formData = new FormData();
      formData.append('employee_id', employeeId);
      formData.append('latitude', locationData.latitude.toString());
      formData.append('longitude', locationData.longitude.toString());
      formData.append('accuracy', locationData.accuracy.toString());
      formData.append('timestamp', locationData.timestamp);
      if (locationData.locationName) {
        formData.append('location_name', locationData.locationName);
      }
      
      const response = await axios.post(`${this.API_BASE_URL}/api/employee/location/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'subdomain': this.SUBDOMAIN,
          'app-os': 'web',
          'app-auth-user': 'llapiusr_!web',
          'app-auth-pwd': 'llapiusr!11web',
          'data-format': 'j',
          'is-api-call': '1',
          'user-access-token': token,
          'Authorization': 'Basic ' + btoa('brain:bitapi')
        }
      });
      
      console.log('Location update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to send location update:', error);
      throw error;
    }
  }

  async startTracking(intervalMs = 30000) {
    if (this.isTracking) {
      return;
    }

    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    this.isTracking = true;
    
    const trackLocation = async () => {
      try {
        const location = await this.getCurrentLocationWithName();
        await this.sendLocationUpdate(location);
        console.log('Location updated:', location);
      } catch (error) {
        console.error('Location tracking error:', error);
      }
    };

    // Initial location update
    await trackLocation();

    // Set up interval for continuous tracking
    this.watchId = setInterval(trackLocation, intervalMs);

    // Alternative: Use Location.watchPositionAsync for more efficient tracking
    // this.locationSubscription = await Location.watchPositionAsync(
    //   {
    //     accuracy: Location.Accuracy.High,
    //     timeInterval: intervalMs,
    //     distanceInterval: 10,
    //   },
    //   async (location) => {
    //     try {
    //       const locationData = {
    //         latitude: location.coords.latitude,
    //         longitude: location.coords.longitude,
    //         accuracy: location.coords.accuracy,
    //         timestamp: new Date().toISOString()
    //       };
    //       await this.sendLocationUpdate(locationData);
    //     } catch (error) {
    //       console.error('Location tracking error:', error);
    //     }
    //   }
    // );
  }

  stopTracking() {
    if (this.watchId) {
      clearInterval(this.watchId);
      this.watchId = null;
    }
    
    if (this.locationSubscription) {
      this.locationSubscription.remove();
      this.locationSubscription = null;
    }
    
    this.isTracking = false;
  }

  async getEmployeeLocations(employeeId = null, startDate = null, endDate = null) {
    try {
      const params = new URLSearchParams();
      if (employeeId) params.append('employeeId', employeeId);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axios.get(`${this.API_BASE_URL}/location/history?${params}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch location history:', error);
      throw error;
    }
  }

  async getAllEmployeeLocations() {
    try {
      const response = await axios.get(`${this.API_BASE_URL}/location/all-employees`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch all employee locations:', error);
      throw error;
    }
  }

  async getCurrentEmployeeId() {
    try {
      const userString = await AsyncStorage.getItem('user_data');
      const user = userString ? JSON.parse(userString) : null;
      return user ? user.employee_id : null;
    } catch (error) {
      console.error('Error getting current employee ID:', error);
      return null;
    }
  }

  async getAuthToken() {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  isTrackingActive() {
    return this.isTracking;
  }
}

export default new LocationService();
