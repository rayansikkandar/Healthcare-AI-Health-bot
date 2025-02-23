import { Platform } from 'react-native';
import { BlurView } from 'expo-blur';

// This is a shim for web and Android where the tab bar is generally opaque.
export default function TabBarBackground() {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint="light"
        intensity={100}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    );
  }
  return null;
}

export function useBottomTabOverflow() {
  return Platform.OS === 'ios' ? 20 : 0;
}
