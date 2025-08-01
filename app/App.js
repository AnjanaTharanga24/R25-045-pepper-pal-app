import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreens';
import PricePredictionScreen from './screens/price-prediction/PricePrediction';  
import DistrictPredictionScreen from './screens/price-prediction/DistrictLevelPrediction';  
import NationalPredictionScreen from './screens/price-prediction/NationalLevelPrediction';
import AdvancedPredictionScreen from './screens/price-prediction/AdvancedPredictionScreen';
import DiseaseDetectionScreen from './screens/disease-detection/DiseaseDetection';
import FertilizerGuideScreen from './screens/fertilizer-guide/FertilizerGuide'; // Add this import

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // Hide default headers since we have custom ones
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
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
          options={{ title: 'Disease Detection' }} 
        />
        <Stack.Screen
          name="Fertilizer"
          component={FertilizerGuideScreen}
          options={{ title: 'Fertilizer Guide' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}