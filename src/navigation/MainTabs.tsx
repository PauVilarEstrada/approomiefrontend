import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Importa tus pantallas ya depuradas
import HomeScreen from '../screens/HomeScreen';
import AdsScreen from '../screens/adsScreen';
// import TinderSwipeScreen from '../screens/TinderSwipeScreen';  <-- la quitamos
import ChatListScreen from '../screens/ChatListScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Ads':
              iconName = 'list';
              break;
            // case 'Tinder':
            //   iconName = 'heart';
            //   break;
            case 'Chats':
              iconName = 'chatbubble-ellipses';
              break;
            case 'Profile':
              iconName = 'person';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#D946EF',
        tabBarInactiveTintColor: 'gray'
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Ads" component={AdsScreen} />
      {/* <Tab.Screen name="Tinder" component={TinderSwipeScreen} /> */}
      <Tab.Screen name="Chats" component={ChatListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
