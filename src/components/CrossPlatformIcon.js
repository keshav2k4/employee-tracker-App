import React from 'react';
import { Text } from 'react-native';
import { Platform } from 'react-native';

// For web, we'll use unicode symbols or text-based icons
const webIcons = {
  'location-on': '📍',
  'person': '👤',
  'history': '📚',
  'radio-button-checked': '🔘',
  'radio-button-unchecked': '⭕',
  'my-location': '🎯',
  'refresh': '🔄',
  'stop': '⏹️',
  'play-arrow': '▶️',
  'map': '🗺️',
  'dashboard': '📊',
  'info-outline': 'ℹ️',
  'email': '📧',
  'work': '💼',
  'phone': '📱',
  'badge': '🏷️',
  'settings': '⚙️',
  'chevron-right': '▶',
  'chevron-left': '◀',
  'logout': '🚪',
  'access-time': '🕐',
  'delete': '🗑️',
  'location-off': '📍',
};

const CrossPlatformIcon = ({ name, size = 24, color = '#000', style }) => {
  if (Platform.OS === 'web') {
    // For web, use emoji or unicode symbols
    const iconSymbol = webIcons[name] || '❓';
    return (
      <Text
        style={[
          {
            fontSize: size,
            color: color,
            lineHeight: size + 4,
          },
          style,
        ]}
      >
        {iconSymbol}
      </Text>
    );
  } else {
    // For mobile platforms, use react-native-vector-icons
    try {
      const Icon = require('react-native-vector-icons/MaterialIcons').default;
      return <Icon name={name} size={size} color={color} style={style} />;
    } catch (error) {
      // Fallback if vector icons aren't available
      const iconSymbol = webIcons[name] || '❓';
      return (
        <Text
          style={[
            {
              fontSize: size,
              color: color,
              lineHeight: size + 4,
            },
            style,
          ]}
        >
          {iconSymbol}
        </Text>
      );
    }
  }
};

export default CrossPlatformIcon;
