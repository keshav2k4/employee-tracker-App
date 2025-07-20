import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorageService {
  constructor() {
    this.LOCATION_HISTORY_KEY = 'location_history';
    this.MAX_HISTORY_ITEMS = 1000; // Limit to prevent storage bloat
  }

  // Save location to local history
  async saveLocationToHistory(locationData) {
    try {
      const existingHistory = await this.getLocationHistory();
      const newEntry = {
        ...locationData,
        id: Date.now().toString(),
        savedAt: new Date().toISOString(),
      };

      const updatedHistory = [newEntry, ...existingHistory];
      
      // Limit the number of stored items
      const trimmedHistory = updatedHistory.slice(0, this.MAX_HISTORY_ITEMS);
      
      await AsyncStorage.setItem(this.LOCATION_HISTORY_KEY, JSON.stringify(trimmedHistory));
      console.log('Location saved to local history:', newEntry);
      return newEntry;
    } catch (error) {
      console.error('Error saving location to history:', error);
      throw error;
    }
  }

  // Get all location history
  async getLocationHistory() {
    try {
      const historyString = await AsyncStorage.getItem(this.LOCATION_HISTORY_KEY);
      return historyString ? JSON.parse(historyString) : [];
    } catch (error) {
      console.error('Error getting location history:', error);
      return [];
    }
  }

  // Get location history with date filter
  async getLocationHistoryByDate(startDate, endDate) {
    try {
      const allHistory = await this.getLocationHistory();
      
      if (!startDate && !endDate) {
        return allHistory;
      }

      return allHistory.filter(item => {
        const itemDate = new Date(item.timestamp);
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        
        return itemDate >= start && itemDate <= end;
      });
    } catch (error) {
      console.error('Error filtering location history:', error);
      return [];
    }
  }

  // Clear location history
  async clearLocationHistory() {
    try {
      await AsyncStorage.removeItem(this.LOCATION_HISTORY_KEY);
      console.log('Location history cleared');
    } catch (error) {
      console.error('Error clearing location history:', error);
      throw error;
    }
  }

  // Get location stats
  async getLocationStats() {
    try {
      const history = await this.getLocationHistory();
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      const todayEntries = history.filter(item => 
        new Date(item.timestamp) >= startOfDay
      );

      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekEntries = history.filter(item => 
        new Date(item.timestamp) >= thisWeek
      );

      return {
        total: history.length,
        today: todayEntries.length,
        thisWeek: weekEntries.length,
        lastUpdate: history[0]?.timestamp || null,
      };
    } catch (error) {
      console.error('Error getting location stats:', error);
      return { total: 0, today: 0, thisWeek: 0, lastUpdate: null };
    }
  }

  // Export history as JSON
  async exportHistory() {
    try {
      const history = await this.getLocationHistory();
      return JSON.stringify(history, null, 2);
    } catch (error) {
      console.error('Error exporting history:', error);
      throw error;
    }
  }
}

export default new LocalStorageService();
