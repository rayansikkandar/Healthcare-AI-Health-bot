import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={32} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarStyle: {
          height: 85,
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
          paddingBottom: 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: { 
          fontSize: 12,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          color: '#000',
          fontSize: 18,
          fontWeight: '600',
        },
        tabBarItemStyle: {
          paddingTop: 8,
        },
        tabBarActiveBackgroundColor: '#E3F2FD',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Health Chat',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="questionnaire"
        options={{
          title: 'Check-in',
          tabBarIcon: ({ color }) => <TabBarIcon name="clipboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <TabBarIcon name="clock-o" color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
    </Tabs>
  );
}
