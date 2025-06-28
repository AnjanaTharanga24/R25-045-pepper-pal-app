import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreens';
import PricePredictionScreen from './screens/PricePrediction';  

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Predict Price"
          component={PricePredictionScreen}
          options={{ title: 'Black Pepper Price' }}   // nicer header
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
