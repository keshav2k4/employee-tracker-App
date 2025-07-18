import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

class AuthService {
  constructor() {
    this.API_BASE_URL = 'http://app.lazyledgers.com';
    this.TOKEN_KEY = 'auth_token';
    this.USER_KEY = 'user_data';
    this.SUBDOMAIN = 'qtech.in';
  }


  async login(phone, password) {
    try {
      // Create form data for the request
      const formData = new FormData();
      formData.append('username', phone);
      formData.append('password', password);

      const response = await axios.post(`${this.API_BASE_URL}/api/auth/login`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'subdomain': this.SUBDOMAIN,
          'app-os': 'web',
          'app-auth-user': 'llapiusr_!web',
          'app-auth-pwd': 'llapiusr!11web',
          'data-format': 'j',
          'is-api-call': '1',
          'Authorization': 'Basic ' + btoa('brain:bitapi')
        }
      });

      console.log('Login response:', response.data);
      console.log('Login attempt for user:', phone);

      if (response.data.apiexec_status === 'success') {
        const { logged_user } = response.data;
        const token = logged_user.api_access_token;
        
        console.log('Login successful for user:', logged_user.full_name);
        console.log('User role:', logged_user.usertype_name);
        
        // Store user data and token
        await AsyncStorage.setItem(this.TOKEN_KEY, token);
        await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(logged_user));
        
        // Set default headers for future requests
        axios.defaults.headers.common['user-access-token'] = token;
        axios.defaults.headers.common['subdomain'] = this.SUBDOMAIN;
        
        return { success: true, user: logged_user };
      } else {
        console.log('Login failed:', response.data);
        return { success: false, error: response.data.usr_msg || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      let errorMessage = 'Login failed';
      
      if (error.response?.status === 452) {
        errorMessage = 'Account may be disabled or restricted (Error 452)';
      } else if (error.response?.data?.usr_msg) {
        errorMessage = error.response.data.usr_msg;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage,
        statusCode: error.response?.status
      };
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
      await AsyncStorage.removeItem(this.USER_KEY);
      delete axios.defaults.headers.common['Authorization'];
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  async getToken() {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  async getCurrentUser() {
    try {
      const userString = await AsyncStorage.getItem(this.USER_KEY);
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  async validateToken() {
    try {
      const token = await this.getToken();
      if (!token) return false;

      // Set up headers for Lazy Ledger API
      axios.defaults.headers.common['user-access-token'] = token;
      axios.defaults.headers.common['subdomain'] = this.SUBDOMAIN;
      axios.defaults.headers.common['Authorization'] = 'Basic ' + btoa('brain:bitapi');
      
      // For now, we'll assume the token is valid if it exists
      // You can add a specific validation endpoint if needed
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      await this.logout();
      return false;
    }
  }

  async initializeAuth() {
    try {
      const token = await this.getToken();
      if (token) {
        // Set up headers for Lazy Ledger API
        axios.defaults.headers.common['user-access-token'] = token;
        axios.defaults.headers.common['subdomain'] = this.SUBDOMAIN;
        axios.defaults.headers.common['Authorization'] = 'Basic ' + btoa('brain:bitapi');
        return await this.validateToken();
      }
      return false;
    } catch (error) {
      console.error('Initialize auth error:', error);
      // Clear any corrupted data
      try {
        await this.logout();
      } catch (logoutError) {
        console.error('Logout error during init:', logoutError);
      }
      return false;
    }
  }
}
export default new AuthService();