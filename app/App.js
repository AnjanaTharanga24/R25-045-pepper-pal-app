import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreens';
import PricePredictionScreen from './screens/price-prediction/PricePrediction';  
import DistrictPredictionScreen from './screens/price-prediction/DistrictLevelPrediction';  
import NationalPredictionScreen from './screens/price-prediction/NationalLevelPrediction';
import AdvancedPredictionScreen from './screens/price-prediction/AdvancedPredictionScreen'; // Add this import
import DiseaseDetectionScreen from './screens/disease-detection/DiseaseDetection';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Predict Price"
          component={PricePredictionScreen}
          options={{ title: 'Black Pepper Price' }} 
        />
        <Stack.Screen
          name="District Price"
          component={DistrictPredictionScreen}
          options={{ title: 'Black Pepper Price' }} 
        />
        <Stack.Screen
          name="National Price"
          component={NationalPredictionScreen}
          options={{ title: 'Black Pepper Price' }} 
        />
        <Stack.Screen
          name="Advanced Price"
          component={AdvancedPredictionScreen}
          options={{ title: 'Black Pepper Price' }} 
        />
        <Stack.Screen
          name="Detect Disease"
          component={DiseaseDetectionScreen}
          options={{ title: 'Black Pepper Price' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}