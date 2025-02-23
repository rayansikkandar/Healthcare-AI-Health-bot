import { View, ViewProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

type ThemedViewProps = ViewProps & {
  useBackground?: boolean;
};

export function ThemedView({ style, useBackground = false, ...props }: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = useBackground ? Colors[colorScheme ?? 'light'].background : undefined;

  return (
    <View
      style={[
        {
          backgroundColor,
        },
        style,
      ]}
      {...props}
    />
  );
}
