import React from 'react';
import { Text } from 'react-native';

// Universal icons using unicode symbols
const iconMap = {
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

const SimpleIcon = ({ name, size = 24, color = '#000', style }) => {
  const iconSymbol = iconMap[name] || '❓';
  
  return (
    <Text
      style={[
        {
          fontSize: size,
          color: color,
          lineHeight: size + 4,
          textAlign: 'center',
          minWidth: size,
        },
        style,
      ]}
    >
      {iconSymbol}
    </Text>
  );
};

export default SimpleIcon;
