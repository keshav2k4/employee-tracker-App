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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AuthService from '../services/authService';
import LocationService from '../services/locationService';
import SimpleIcon from '../components/SimpleIcon';

const { width } = Dimensions.get('window');

// Animated Button Component
const AnimatedButton = ({ children, style, onPress, gradient, disabled, isLoading, ...props }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.setValue(0);
    }
  }, [isLoading]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (gradient) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
        {...props}
      >
        <Animated.View
          style={[{
            transform: [{ scale: scaleAnim }],
            opacity: disabled ? 0.6 : 1,
          }]}
        >
          <LinearGradient colors={gradient} style={[style, styles.gradientButton]}>
            {isLoading ? (
              <Animated.View style={{ transform: [{ rotate }] }}>
                <SimpleIcon name="refresh" size={20} color="#fff" />
              </Animated.View>
            ) : (
              children
            )}
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      <Animated.View
        style={[style, {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.6 : 1,
        }]}
      >
        {isLoading ? (
          <Animated.View style={{ transform: [{ rotate }] }}>
            <SimpleIcon name="refresh" size={20} color="#fff" />
          </Animated.View>
        ) : (
          children
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    initializeDashboard();
    
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
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
      setTrackingLoading(true);
      await LocationService.startTracking();
      setIsTracking(true);
      Alert.alert('✅ Success', 'Location tracking started successfully!', [{ text: 'OK' }]);
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'Failed to start location tracking');
    } finally {
      setTrackingLoading(false);
    }
  };

  const handleStopTracking = () => {
    setTrackingLoading(true);
    LocationService.stopTracking();
    setIsTracking(false);
    setTrackingLoading(false);
    Alert.alert('🛑 Stopped', 'Location tracking stopped!', [{ text: 'OK' }]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await initializeDashboard();
    setRefreshing(false);
  };

  const navigateToMap = async () => {
    setMapLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    navigation.navigate('Map');
    setMapLoading(false);
  };
  
  const navigateToHistory = async () => {
    setHistoryLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    navigation.navigate('History');
    setHistoryLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Animated.View style={{ transform: [{ rotate: '0deg' }] }}>
          <ActivityIndicator size="large" color="#424447ff" />
        </Animated.View>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          contentContainerStyle={{ paddingBottom: width * 0.1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={['#fffdfdff', '#9a999bff']}
              style={styles.titleBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.title}> Employee Tracker</Text>
            </LinearGradient>
          </View>

          {/* Welcome Card */}
          <View style={[styles.card, styles.welcomeCard]}>
            <View style={styles.welcomeHeader}>
              <SimpleIcon name="person" size={24} color="#99978dff" />
              <Text style={styles.cardHeader}>Welcome back!</Text>
            </View>
            <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
            <View style={styles.userInfoContainer}>
              <View style={styles.userInfoRow}>
                <SimpleIcon name="email" size={16} color="#666" />
                <Text style={styles.userInfo}>{user?.email || 'No email provided'}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <SimpleIcon name="business" size={16} color="#666" />
                <Text style={styles.userInfo}>{user?.usertype_name || 'Employee'}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <SimpleIcon name="phone" size={16} color="#666" />
                <Text style={styles.userInfo}>{user?.mobile_phone || 'N/A'}</Text>
              </View>
              <View style={styles.userInfoRow}>
                <SimpleIcon name="badge" size={16} color="#666" />
                <Text style={styles.userInfo}>ID: {user?.employee_id || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Tracking Card */}
          <View style={[styles.card, styles.trackingCard]}>
            <View style={styles.cardHeaderContainer}>
             
              <Text style={styles.cardHeader}>Location Tracking</Text>
            </View>
            
            <View style={styles.statusContainer}>
              <View style={styles.trackingStatus}>
                <Text style={styles.statusText}>Status:</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: isTracking ? '#3b3f3bff' : '#f0eceaff' }
                ]}>
                 
                  <Text style={styles.statusBadgeText}>
                    {isTracking ? 'Active' : 'Inactive'}
                  </Text>
                </View>
              </View>

              {currentLocation && (
                <View style={styles.locationContainer}>
             
                  <Text style={styles.locationText} numberOfLines={2}>
                    {currentLocation.locationName || 'Unknown location'}
                  </Text>
                </View>
              )}
            </View>

            <AnimatedButton
              gradient={isTracking ? ['#a2a1a0ff', '#655c58c8'] : ['#515151ff', '#939393ff']}
              style={styles.trackingButton}
              onPress={isTracking ? handleStopTracking : handleStartTracking}
              isLoading={trackingLoading}
            >
              <View style={styles.buttonContent}>
              
                <Text style={styles.trackingButtonText}>
                  {isTracking ? 'Stop Tracking' : 'Start Tracking'}
                </Text>
              </View>
            </AnimatedButton>
          </View>

          {/* Actions Card */}
          <View style={[styles.card, styles.actionsCard]}>
            <View style={styles.cardHeaderContainer}>
     
              <Text style={styles.cardHeader}>Quick Actions</Text>
            </View>
            
            <AnimatedButton
              gradient={['#918f8fff', '#515151ff']}
              style={styles.actionButton}
              onPress={navigateToMap}
              isLoading={mapLoading}
            >
              <View style={styles.buttonContent}>
                <SimpleIcon name="map" size={20} color="#515151ff" />
                <Text style={styles.actionButtonText}>View Employee Map</Text>
              </View>
            </AnimatedButton>
            
            <AnimatedButton
              gradient={['#918f8fff', '#515151ff']}
              style={[styles.actionButton, { marginTop: 12 }]}
              onPress={navigateToHistory}
              isLoading={historyLoading}
            >
              <View style={styles.buttonContent}>
                <SimpleIcon name="history" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>View Location History</Text>
              </View>
            </AnimatedButton>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <SimpleIcon name="info-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Location tracking runs in the background and sends updates every 30 seconds when active. 
              Your privacy is protected and data is encrypted.
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#80827bff',
  },
  scrollView: {
    paddingHorizontal: width * 0.05,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6aa8f9ff',
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
    shadowColor: '#b9ac62ff',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: '#b9ac62ff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#a2a2a2ff',
    padding: width * 0.05,
    borderRadius: 20,
    marginBottom: width * 0.04,
    shadowColor: '#000000ff',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#b9ac62ff',
  },
  trackingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#b9ac62ff',
  },
  actionsCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#b9ac62ff',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeader: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1a202c',
  },
  userName: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 16,
  },
  userInfoContainer: {
    gap: 8,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  userInfo: {
    fontSize: width * 0.038,
    color: '#94928671',
    marginLeft: 8,
  },
  statusContainer: {
    marginBottom: 20,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusText: {
    fontSize: width * 0.04,
    color: '#2d3748',
    fontWeight: '600',
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: width * 0.035,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f7fafc',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: width * 0.036,
    color: '#4a5568',
    lineHeight: 20,
  },
  gradientButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  trackingButton: {
    marginTop: 8,
  },
  actionButton: {
    marginTop: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  trackingButtonText: {
    color: '#fff',
    fontSize: width * 0.042,
    fontWeight: '600',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#ebf4ff',
    padding: width * 0.04,
    borderRadius: 12,
    marginBottom: width * 0.04,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: width * 0.035,
    color: '#0f1113ff',
    lineHeight: width * 0.05,
  },
});

export default DashboardScreen;
