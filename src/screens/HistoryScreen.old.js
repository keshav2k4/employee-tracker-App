import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SimpleIcon from '../components/SimpleIcon';
import LocationService from '../services/locationService';
import LocalStorageService from '../services/localStorageService';

const { width } = Dimensions.get('window');

const HistoryScreen = () => {
  const [locationHistory, setLocationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'

  useEffect(() => {
    fetchLocationHistory();
    loadStats();
  }, [filter]);

  const fetchLocationHistory = async () => {
    try {
      let history;
      
      if (filter === 'today') {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        history = await LocationService.getEmployeeLocations(null, startOfDay.toISOString(), null);
      } else if (filter === 'week') {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        history = await LocationService.getEmployeeLocations(null, weekAgo.toISOString(), null);
      } else {
        history = await LocationService.getEmployeeLocations();
      }
      
      setLocationHistory(history || []);
    } catch (error) {
      console.error('Failed to fetch location history:', error);
      setLocationHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const locationStats = await LocalStorageService.getLocationStats();
      setStats(locationStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLocationHistory();
    await loadStats();
    setRefreshing(false);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all location history? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await LocalStorageService.clearLocationHistory();
              setLocationHistory([]);
              setStats({ total: 0, today: 0, thisWeek: 0, lastUpdate: null });
              Alert.alert('Success', 'Location history cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const renderLocationItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.itemHeader}>
        <View style={styles.historyRow}>
          <SimpleIcon name="location-on" size={18} color="#007AFF" />
          <Text style={styles.locationText} numberOfLines={2}>
            {item.locationName || 'Unknown Location'}
          </Text>
        </View>
        {item.savedLocally && (
          <View style={styles.localBadge}>
            <Text style={styles.localBadgeText}>Local</Text>
          </View>
        )}
      </View>
      
      <View style={styles.itemDetails}>
        <View style={styles.historyRow}>
          <SimpleIcon name="access-time" size={16} color="#666" />
          <Text style={styles.timeText}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
        
        {item.accuracy && (
          <View style={styles.historyRow}>
            <SimpleIcon name="my-location" size={16} color="#666" />
            <Text style={styles.accuracyText}>Accuracy: {Math.round(item.accuracy)}m</Text>
          </View>
        )}
        
        {item.latitude && item.longitude && (
          <View style={styles.coordinatesRow}>
            <Text style={styles.coordinatesText}>
              {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Location History</Text>
        <TouchableOpacity onPress={handleClearHistory}>
          <SimpleIcon name="delete" size={24} color="#FF5722" />
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Statistics</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.today}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.thisWeek}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </View>
          {stats.lastUpdate && (
            <Text style={styles.lastUpdateText}>
              Last update: {new Date(stats.lastUpdate).toLocaleString()}
            </Text>
          )}
        </View>
      )}

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'today' && styles.activeFilter]}
          onPress={() => setFilter('today')}
        >
          <Text style={[styles.filterText, filter === 'today' && styles.activeFilterText]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'week' && styles.activeFilter]}
          onPress={() => setFilter('week')}
        >
          <Text style={[styles.filterText, filter === 'week' && styles.activeFilterText]}>This Week</Text>
        </TouchableOpacity>
      </View>

      {locationHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <SimpleIcon name="location-off" size={48} color="#ccc" />
          <Text style={styles.emptyText}>No location history found</Text>
          <Text style={styles.emptySubtext}>Start tracking to see your location history here</Text>
        </View>
      ) : (
        <FlatList
          data={locationHistory}
          renderItem={renderLocationItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#333',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: width * 0.05,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  lastUpdateText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: width * 0.05,
    marginBottom: 12,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: width * 0.05,
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#333',
    flex: 1,
    fontWeight: '500',
  },
  localBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  localBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  itemDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  timeText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#666',
  },
  accuracyText: {
    fontSize: 12,
    marginLeft: 8,
    color: '#999',
  },
  coordinatesRow: {
    marginTop: 4,
    paddingLeft: 24,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'monospace',
  },
});

export default HistoryScreen;

