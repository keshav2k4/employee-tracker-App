import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

class LocationServiceWeb {
  constructor() {
    this.API_BASE_URL = 'http://app.lazyledgers.com';
    this.SUBDOMAIN = 'qtech.in';
    this.watchId = null;
    this.isTracking = false;
  }

  async requestLocationPermission() {
    // For web, try to use navigator.geolocation
    if ('geolocation' in navigator) {
      return new Promise((resolve) => {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          resolve(result.state === 'granted' || result.state === 'prompt');
        }).catch(() => {
          resolve(true); // Assume permission if we can't check
        });
      });
    }
    return false;
  }

  async getCurrentLocation() {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      if ('geolocation' in navigator) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date().toISOString()
              });
            },
            (error) => {
              reject(new Error(`Failed to get location: ${error.message}`));
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            }
          );
        });
      } else {
        // Fallback to mock location for demo purposes
        return {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      throw new Error(`Failed to get location: ${error.message}`);
    }
  }

  async getLocationName(latitude, longitude) {
    try {
      // Use a free geocoding service for web demo
      // Note: In production, you'd want to use a proper geocoding service
      return `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
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
  }

  stopTracking() {
    if (this.watchId) {
      clearInterval(this.watchId);
      this.watchId = null;
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
      // Return mock data for demo
      return [
        {
          id: 1,
          locationName: 'San Francisco, CA',
          timestamp: new Date().toISOString(),
          latitude: 37.7749,
          longitude: -122.4194
        },
        {
          id: 2,
          locationName: 'Oakland, CA',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          latitude: 37.8044,
          longitude: -122.2711
        }
      ];
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

export default new LocationServiceWeb();
