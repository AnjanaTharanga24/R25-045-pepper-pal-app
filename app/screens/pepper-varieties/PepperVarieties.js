import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { BASE_URL } from '../../config/config';

export default function PepperVarietiesScreen({ navigation }) {
  // Input states
  const [elevation, setElevation] = useState('');
  const [annualRainfall, setAnnualRainfall] = useState('');
  const [avgTemperature, setAvgTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [soilTexture, setSoilTexture] = useState('');
  const [soilQuality, setSoilQuality] = useState('');
  const [drainage, setDrainage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const soilTextureOptions = [
    { label: 'Select Soil Texture', value: '' },
    { label: 'Sandy clay loam', value: 'Sandy clay loam' },
    { label: 'Red loam', value: 'Red loam' },
    { label: 'Lateritic soils', value: 'Lateritic soils' },
    { label: 'Loamy soil', value: 'Loamy soil' },
    { label: 'Clay loam', value: 'Clay loam' },
    { label: 'Sandy loam', value: 'Sandy loam' }
  ];

  const soilQualityOptions = [
    { label: 'Select Soil Quality', value: '' },
    { label: 'Organic-rich', value: 'Organic-rich' },
    { label: 'Moderate organic', value: 'Moderate organic' },
    { label: 'Low organic', value: 'Low organic' },
    { label: 'High fertility', value: 'High fertility' },
    { label: 'Medium fertility', value: 'Medium fertility' },
    { label: 'Low fertility', value: 'Low fertility' }
  ];

  const drainageOptions = [
    { label: 'Select Drainage', value: '' },
    { label: 'Well drained', value: 'Well drained' },
    { label: 'Moderate drainage', value: 'Moderate drainage' },
    { label: 'Poor drainage', value: 'Poor drainage' },
    { label: 'Excellent drainage', value: 'Excellent drainage' }
  ];

  const validateInputs = () => {
    const elevationNum = parseFloat(elevation);
    const rainfallNum = parseFloat(annualRainfall);
    const temperatureNum = parseFloat(avgTemperature);
    const humidityNum = parseFloat(humidity);

    if (!elevation || isNaN(elevationNum) || elevationNum < 0 || elevationNum > 3000) {
      Alert.alert('Invalid Input', 'Elevation must be between 0-3000 meters');
      return false;
    }

    if (!annualRainfall || isNaN(rainfallNum) || rainfallNum < 0 || rainfallNum > 5000) {
      Alert.alert('Invalid Input', 'Annual rainfall must be between 0-5000 mm');
      return false;
    }
    
    if (!humidity || isNaN(humidityNum) || humidityNum < 0 || humidityNum > 100) {
      Alert.alert('Invalid Input', 'Humidity must be between 0-100%');
      return false;
    }
    
    if (!avgTemperature || isNaN(temperatureNum) || temperatureNum < 0 || temperatureNum > 50) {
      Alert.alert('Invalid Input', 'Average temperature must be between 0-50°C');
      return false;
    }

    if (!soilTexture) {
      Alert.alert('Missing Information', 'Please select soil texture');
      return false;
    }

    if (!soilQuality) {
      Alert.alert('Missing Information', 'Please select soil quality');
      return false;
    }

    if (!drainage) {
      Alert.alert('Missing Information', 'Please select drainage condition');
      return false;
    }

    return true;
  };

  // API call function
  const getPepperRecommendation = async (requestData) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/pepper/suggest-pepper`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 seconds timeout
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data.error || 'Server error occurred');
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something else happened
        throw new Error('An unexpected error occurred');
      }
    }
  };

  const onGetRecommendation = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    try {
      // Prepare payload for API
      const payload = {
        elevation: parseFloat(elevation),
        annual_rainfall: parseFloat(annualRainfall),
        avg_temperature: parseFloat(avgTemperature),
        humidity: parseFloat(humidity),
        soil_texture: soilTexture,
        soil_quality: soilQuality,
        drainage: drainage
      };
      
      console.log('Pepper varieties recommendation payload:', payload);
      
      // Call the API
      const result = await getPepperRecommendation(payload);
      
      if (result.success) {
        // Show successful result
        Alert.alert(
          'Pepper Variety Recommendation',
          `Recommended Variety: ${result.predicted_variety}\n\nBased on your conditions:\n• Elevation: ${payload.elevation}m\n• Rainfall: ${payload.annual_rainfall}mm\n• Temperature: ${payload.avg_temperature}°C\n• Humidity: ${payload.humidity}%\n• Soil: ${payload.soil_texture}\n• Quality: ${payload.soil_quality}\n• Drainage: ${payload.drainage}`,
          [
            {
              text: 'Get More Info',
              onPress: () => showDetailedInfo(result.predicted_variety, payload)
            },
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to get recommendation');
      }
    } catch (error) {
      Alert.alert(
        'Error', 
        error.message || 'Failed to get recommendations. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Show detailed information about the recommended variety
  const showDetailedInfo = (variety, conditions) => {
    let detailedInfo = getDetailedRecommendation(variety, conditions);
    
    Alert.alert(
      `About ${variety}`,
      detailedInfo,
      [{ text: 'OK' }]
    );
  };

  const getDetailedRecommendation = (variety, data) => {
    const { annual_rainfall: rain, humidity: hum, avg_temperature: temp, elevation: elev } = data;
    
    let info = `🌶️ ${variety}\n\n`;
    
    // Add variety-specific information based on the prediction
    if (variety.toLowerCase().includes('highland')) {
      info += `Characteristics:\n• Best suited for high elevation areas\n• Cold tolerant variety\n• Premium quality pepper\n• Slower growth but higher value\n\n`;
      info += `Growing Tips:\n• Provide wind protection\n• Use mulching for temperature control\n• Monitor for altitude-related stress\n• Harvest when fully mature for best quality`;
    } else if (variety.toLowerCase().includes('wet climate')) {
      info += `Characteristics:\n• Thrives in high rainfall conditions\n• High humidity tolerance\n• Good disease resistance\n• Suitable for monsoon cultivation\n\n`;
      info += `Growing Tips:\n• Ensure excellent drainage\n• Monitor for fungal diseases\n• Regular pruning for air circulation\n• Use raised beds if necessary`;
    } else {
      info += `Characteristics:\n• Standard variety for general cultivation\n• Good adaptability\n• Moderate yield potential\n• Suitable for diverse conditions\n\n`;
      info += `Growing Tips:\n• Regular watering schedule\n• Balanced fertilization\n• Monitor soil pH (6.0-7.0)\n• Proper spacing for growth`;
    }
    
    // Add condition-specific advice
    info += `\n\n📊 Your Conditions Analysis:\n`;
    
    if (elev > 1000) {
      info += `• High elevation: Consider wind protection and temperature management\n`;
    }
    
    if (rain > 2500) {
      info += `• High rainfall: Focus on drainage and disease prevention\n`;
    } else if (rain < 1200) {
      info += `• Low rainfall: Implement irrigation and water conservation\n`;
    }
    
    if (hum > 85) {
      info += `• High humidity: Ensure good air circulation\n`;
    }
    
    if (temp > 30) {
      info += `• High temperature: Provide shade during hottest hours\n`;
    } else if (temp < 20) {
      info += `• Cool temperature: Consider season timing and protection\n`;
    }
    
    return info;
  };

  const getEnvironmentalStatus = () => {
    const elevationNum = parseFloat(elevation) || 0;
    const rainfallNum = parseFloat(annualRainfall) || 0;
    const humidityNum = parseFloat(humidity) || 0;
    const temperatureNum = parseFloat(avgTemperature) || 0;

    let status = [];
    
    // Elevation status
    if (elevationNum < 300) status.push({ text: 'Low Elevation', color: '#28a745', icon: '🏞️' });
    else if (elevationNum <= 800) status.push({ text: 'Medium Elevation', color: '#ffc107', icon: '⛰️' });
    else status.push({ text: 'High Elevation', color: '#17a2b8', icon: '🏔️' });
    
    // Rainfall status
    if (rainfallNum < 1200) status.push({ text: 'Low Rainfall', color: '#dc3545', icon: '🌵' });
    else if (rainfallNum <= 2500) status.push({ text: 'Good Rainfall', color: '#28a745', icon: '🌧️' });
    else status.push({ text: 'High Rainfall', color: '#ffc107', icon: '⛈️' });
    
    // Humidity status
    if (humidityNum < 60) status.push({ text: 'Low Humidity', color: '#dc3545', icon: '🏜️' });
    else if (humidityNum <= 85) status.push({ text: 'Good Humidity', color: '#28a745', icon: '💧' });
    else status.push({ text: 'High Humidity', color: '#ffc107', icon: '🌫️' });
    
    // Temperature status
    if (temperatureNum < 18) status.push({ text: 'Cool', color: '#17a2b8', icon: '❄️' });
    else if (temperatureNum <= 32) status.push({ text: 'Optimal Temp', color: '#28a745', icon: '🌡️' });
    else status.push({ text: 'Hot', color: '#dc3545', icon: '🔥' });

    return status;
  };

  const environmentalStatus = getEnvironmentalStatus();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pepper Varieties</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Pepper Variety Recommendations</Text>
          <Text style={styles.subtitle}>
            Get AI-powered pepper variety suggestions based on your environmental conditions
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formContainer}>
          {/* Environmental Inputs */}
          <View style={styles.environmentalSection}>
            <Text style={styles.sectionTitle}>Environmental Conditions</Text>
            
            {/* Elevation Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Elevation (meters)</Text>
              <TextInput
                style={styles.textInput}
                value={elevation}
                onChangeText={setElevation}
                placeholder="Enter elevation in meters"
                keyboardType="numeric"
                maxLength={4}
                editable={!isLoading}
              />
              <Text style={styles.inputHint}>Typical range: 0-2500m for pepper cultivation</Text>
            </View>

            {/* Annual Rainfall Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Annual Rainfall (mm)</Text>
              <TextInput
                style={styles.textInput}
                value={annualRainfall}
                onChangeText={setAnnualRainfall}
                placeholder="Enter annual rainfall"
                keyboardType="numeric"
                maxLength={4}
                editable={!isLoading}
              />
              <Text style={styles.inputHint}>Typical range: 1200-3000mm for pepper cultivation</Text>
            </View>

            {/* Average Temperature Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Average Temperature (°C)</Text>
              <TextInput
                style={styles.textInput}
                value={avgTemperature}
                onChangeText={setAvgTemperature}
                placeholder="Enter average temperature"
                keyboardType="numeric"
                maxLength={4}
                editable={!isLoading}
              />
              <Text style={styles.inputHint}>Optimal range: 20-30°C for pepper cultivation</Text>
            </View>

            {/* Humidity Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Humidity (%)</Text>
              <TextInput
                style={styles.textInput}
                value={humidity}
                onChangeText={setHumidity}
                placeholder="Enter humidity percentage"
                keyboardType="numeric"
                maxLength={3}
                editable={!isLoading}
              />
              <Text style={styles.inputHint}>Optimal range: 70-85% for pepper growth</Text>
            </View>

            {/* Soil Texture Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Soil Texture</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={soilTexture}
                  onValueChange={setSoilTexture}
                  style={styles.picker}
                  enabled={!isLoading}
                  dropdownIconColor="#2d5c3e"
                >
                  {soilTextureOptions.map((option) => (
                    <Picker.Item 
                      key={option.value} 
                      label={option.label} 
                      value={option.value}
                      style={option.value === '' ? styles.placeholderItem : styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Soil Quality Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Soil Quality</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={soilQuality}
                  onValueChange={setSoilQuality}
                  style={styles.picker}
                  enabled={!isLoading}
                  dropdownIconColor="#2d5c3e"
                >
                  {soilQualityOptions.map((option) => (
                    <Picker.Item 
                      key={option.value} 
                      label={option.label} 
                      value={option.value}
                      style={option.value === '' ? styles.placeholderItem : styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Drainage Picker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Drainage</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={drainage}
                  onValueChange={setDrainage}
                  style={styles.picker}
                  enabled={!isLoading}
                  dropdownIconColor="#2d5c3e"
                >
                  {drainageOptions.map((option) => (
                    <Picker.Item 
                      key={option.value} 
                      label={option.label} 
                      value={option.value}
                      style={option.value === '' ? styles.placeholderItem : styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Environmental Status Display */}
          {(elevation || annualRainfall || avgTemperature || humidity) && (
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>Current Conditions</Text>
              <View style={styles.statusGrid}>
                {environmentalStatus.map((status, index) => (
                  <View key={index} style={[styles.statusCard, { borderLeftColor: status.color }]}>
                    <Text style={styles.statusIcon}>{status.icon}</Text>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Get Recommendation Button */}
          <TouchableOpacity
            style={[styles.recommendButton, isLoading && styles.disabledButton]}
            onPress={onGetRecommendation}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={[styles.recommendButtonText, { marginLeft: 8 }]}>
                  Analyzing Conditions...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.recommendButtonText}>
                  Get AI Variety Recommendations
                </Text>
                <Text style={styles.buttonIcon}>🤖</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About Pepper Varieties</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>🌱</Text>
              <Text style={styles.infoTitle}>Popular Varieties</Text>
            </View>
            <Text style={styles.infoDescription}>
              • Panniyur-1: High yielding, disease resistant{'\n'}
              • Subhakya: Good for commercial cultivation{'\n'}
              • Kottanadan: Traditional variety with strong flavor{'\n'}
              • Karimunda: Suitable for high rainfall areas
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>🤖</Text>
              <Text style={styles.infoTitle}>AI-Powered Recommendations</Text>
            </View>
            <Text style={styles.infoDescription}>
              Our system analyzes your specific environmental conditions including 
              elevation, rainfall, temperature, humidity, and soil properties to 
              recommend the most suitable pepper varieties for your location.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>💰</Text>
              <Text style={styles.infoTitle}>Economic Benefits</Text>
            </View>
            <Text style={styles.infoDescription}>
              Choosing the right variety can significantly improve yield, 
              quality, and market value. Consider local market demand and 
              processing requirements when selecting varieties.
            </Text>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🎯 Selection Tips</Text>
            <Text style={styles.tipText}>
              • Enter accurate environmental data for best results{'\n'}
              • Consider seasonal variations in your inputs{'\n'}
              • Evaluate soil texture and drainage capacity carefully{'\n'}
              • Test soil pH and nutrient levels if possible{'\n'}
              • Start with small trial plots before scaling up{'\n'}
              • Consult local agricultural officers for additional guidance
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9f0',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2d5c3e',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  placeholder: {
    width: 40,
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Title Section
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d5c3e',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Form Container
  formContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  
  // Input Groups
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#28a745',
    padding: 16,
    fontSize: 16,
    color: '#2d5c3e',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputHint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 6,
    fontStyle: 'italic',
  },
  
  // Picker
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#28a745',
    overflow: 'hidden',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  picker: {
    height: 50,
    backgroundColor: '#ffffff',
  },
  pickerItem: {
    fontSize: 16,
    color: '#2d5c3e',
  },
  placeholderItem: {
    fontSize: 16,
    color: '#6c757d',
  },
  
  // Environmental Section
  environmentalSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 16,
  },
  
  // Status Section
  statusSection: {
    marginTop: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    alignItems: 'center',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Recommend Button
  recommendButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    shadowOpacity: 0.1,
  },
  recommendButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },
  
  // Information Section
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
  },
  infoDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  
  // Tips Section
  tipsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  tipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ffa500',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});