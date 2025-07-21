import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AdsBuscoScreen from './ads/adsBuscoScreen';
import AdsOfrezcoScreen from './ads/adsOfrezcoScreen';

const Tab = createMaterialTopTabNavigator();

export default function AdsScreen() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#D946EF',
        tabBarLabelStyle: { fontWeight: 'bold' },
        tabBarIndicatorStyle: { backgroundColor: '#D946EF' }
      }}
    >
      <Tab.Screen name="Ofrezco" component={AdsOfrezcoScreen} />
      <Tab.Screen name="Busco" component={AdsBuscoScreen} />
    </Tab.Navigator>
  );
}
