import { Text, TextProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

type ThemedTextProps = TextProps & {
  type?: 'title' | 'subtitle' | 'default' | 'defaultSemiBold';
};

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? 'light'].text;

  let fontSize = 16;
  let fontWeight: 'normal' | 'bold' | '600' = 'normal';

  switch (type) {
    case 'title':
      fontSize = 24;
      fontWeight = 'bold';
      break;
    case 'subtitle':
      fontSize = 18;
      fontWeight = '600';
      break;
    case 'defaultSemiBold':
      fontWeight = '600';
      break;
  }

  return (
    <Text
      style={[
        {
          color,
          fontSize,
          fontWeight,
        },
        style,
      ]}
      {...props}
    />
  );
}
