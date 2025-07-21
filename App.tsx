import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { AuthProvider } from './src/context/auth.context'
import LoginScreen from './src/screens/auth/LoginScreen'
import RegisterScreen from './src/screens/auth/RegisterScreen'
import VerifyEmailScreen from './src/screens/auth/VerifyEmailScreen'
import BuscoFormScreen from './src/screens/forms/BuscoFormScreen'
import OfrezcoFormScreen from './src/screens/forms/OfrezcoFormScreen'
import MainTabs from './src/navigation/MainTabs'

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen}/>
          <Stack.Screen name="Register" component={RegisterScreen}/>
          <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen}/>
          <Stack.Screen name="BuscoForm" component={BuscoFormScreen}/>
          <Stack.Screen name="OfrezcoForm" component={OfrezcoFormScreen}/>
          <Stack.Screen name="Tabs" component={MainTabs}/>
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  )
}