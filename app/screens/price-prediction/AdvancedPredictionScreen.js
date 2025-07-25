import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function AdvancedPredictionScreen({ navigation }) {
  const [rainfall, setRainfall] = useState('150');
  const [priceType, setPriceType] = useState('GR1');
  const [inflationRate, setInflationRate] = useState('12');
  const [seasonality, setSeasonality] = useState('NO');
  const [isLoading, setIsLoading] = useState(false);

  const priceTypes = [
    { label: 'GR1 (Grade 1)', value: 'GR1' },
    { label: 'GR2 (Grade 2)', value: 'GR2' },
    { label: 'White', value: 'White' }
  ];

  const seasonalityOptions = [
    { label: 'No', value: 'NO' },
    { label: 'Yes', value: 'YES' }
  ];

  const validateInputs = () => {
    const rainfallNum = parseFloat(rainfall);
    const inflationNum = parseFloat(inflationRate);
    
    if (isNaN(rainfallNum) || rainfallNum < 0 || rainfallNum > 500) {
      Alert.alert('Invalid Input', 'Rainfall must be between 0-500 mm');
      return false;
    }
    
    if (isNaN(inflationNum) || inflationNum < 0 || inflationNum > 100) {
      Alert.alert('Invalid Input', 'Inflation rate must be between 0-100%');
      return false;
    }
    
    return true;
  };

  const onPredict = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const payload = {
        rainfall: parseFloat(rainfall),
        price_type: priceType,
        inflation_rate: parseFloat(inflationRate),
        seasonality: seasonality
      };
      
      console.log('Prediction payload:', payload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock price calculation based on inputs
      const basePrices = { 'GR1': 500, 'GR2': 440, 'White': 400 };
      let basePrice = basePrices[priceType];
      
      // Adjust for rainfall (optimal rainfall around 150-200mm)
      const rainfallFactor = Math.abs(175 - parseFloat(rainfall)) / 100;
      basePrice += rainfallFactor * 20;
      
      // Adjust for inflation
      basePrice += (parseFloat(inflationRate) / 100) * basePrice * 0.8;
      
      // Adjust for seasonality
      if (seasonality === 'YES') basePrice += 50;
      
      const lowerPrice = Math.round(basePrice * 0.95);
      const upperPrice = Math.round(basePrice * 1.05);
      
      Alert.alert(
        'Advanced Price Prediction',
        `Predicted price range for ${priceType} quality:\n\n₹${lowerPrice} - ₹${upperPrice} per kg\n\nConfidence: 88%\n\nFactors considered:\n• Rainfall: ${rainfall}mm\n• Inflation: ${inflationRate}%\n• Seasonality: ${seasonality === 'NO' ? 'No' : 'Yes'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRainfallStatus = () => {
    const rainfallNum = parseFloat(rainfall) || 0;
    if (rainfallNum < 100) return { status: 'Low', color: '#dc3545', icon: '🌵' };
    if (rainfallNum <= 200) return { status: 'Optimal', color: '#28a745', icon: '🌿' };
    if (rainfallNum <= 300) return { status: 'High', color: '#ffc107', icon: '🌧️' };
    return { status: 'Excessive', color: '#dc3545', icon: '⛈️' };
  };

  const getInflationImpact = () => {
    const inflationNum = parseFloat(inflationRate) || 0;
    if (inflationNum < 5) return { impact: 'Low Impact', color: '#28a745' };
    if (inflationNum <= 15) return { impact: 'Moderate Impact', color: '#ffc107' };
    return { impact: 'High Impact', color: '#dc3545' };
  };

  const rainfallStatus = getRainfallStatus();
  const inflationImpact = getInflationImpact();

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
        <Text style={styles.headerTitle}>Advanced Prediction</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Advanced Price Prediction</Text>
          <Text style={styles.subtitle}>
            Multi-factor analysis for accurate price forecasting
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formContainer}>
          {/* Rainfall Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rainfall (mm)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={rainfall}
                onChangeText={setRainfall}
                placeholder="Enter rainfall in mm"
                keyboardType="numeric"
                maxLength={3}
              />
              <View style={[styles.statusBadge, { backgroundColor: rainfallStatus.color + '20' }]}>
                <Text style={styles.statusIcon}>{rainfallStatus.icon}</Text>
                <Text style={[styles.statusText, { color: rainfallStatus.color }]}>
                  {rainfallStatus.status}
                </Text>
              </View>
            </View>
            <Text style={styles.inputHint}>Optimal range: 150-200mm</Text>
          </View>

          {/* Price Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priceType}
                onValueChange={(itemValue) => setPriceType(itemValue)}
                style={styles.picker}
              >
                {priceTypes.map((type) => (
                  <Picker.Item 
                    key={type.value} 
                    label={type.label} 
                    value={type.value}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Inflation Rate Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Inflation Rate (%)</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={inflationRate}
                onChangeText={setInflationRate}
                placeholder="Enter inflation rate"
                keyboardType="numeric"
                maxLength={4}
              />
              <View style={[styles.statusBadge, { backgroundColor: inflationImpact.color + '20' }]}>
                <Text style={[styles.statusText, { color: inflationImpact.color }]}>
                  {inflationImpact.impact}
                </Text>
              </View>
            </View>
            <Text style={styles.inputHint}>Current economic inflation rate</Text>
          </View>

          {/* Seasonality Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Seasonality Effect</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={seasonality}
                onValueChange={(itemValue) => setSeasonality(itemValue)}
                style={styles.picker}
              >
                {seasonalityOptions.map((option) => (
                  <Picker.Item 
                    key={option.value} 
                    label={option.label} 
                    value={option.value}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
            <Text style={styles.inputHint}>Is seasonal effect present?</Text>
          </View>

          {/* Predict Button */}
          <TouchableOpacity
            style={[styles.predictButton, isLoading && styles.disabledButton]}
            onPress={onPredict}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.predictButtonText}>
              {isLoading ? 'Analyzing Factors...' : 'Get Advanced Prediction'}
            </Text>
            {!isLoading && <Text style={styles.buttonIcon}>🔬</Text>}
          </TouchableOpacity>
        </View>

        {/* Factor Explanation Section */}
        <View style={styles.factorSection}>
          <Text style={styles.sectionTitle}>Prediction Factors</Text>
          
          <View style={styles.factorCard}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorIcon}>🌧️</Text>
              <Text style={styles.factorTitle}>Rainfall Impact</Text>
            </View>
            <Text style={styles.factorDescription}>
              Rainfall directly affects pepper plant growth and yield. Optimal rainfall (150-200mm) 
              supports healthy growth, while excessive or insufficient rainfall can impact quality and supply.
            </Text>
          </View>

          <View style={styles.factorCard}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorIcon}>📈</Text>
              <Text style={styles.factorTitle}>Inflation Effect</Text>
            </View>
            <Text style={styles.factorDescription}>
              Economic inflation affects production costs, transportation, and overall market pricing. 
              Higher inflation typically leads to increased commodity prices.
            </Text>
          </View>

          <View style={styles.factorCard}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorIcon}>📅</Text>
              <Text style={styles.factorTitle}>Seasonal Variation</Text>
            </View>
            <Text style={styles.factorDescription}>
              Seasonal effects can significantly impact pepper prices due to changes in demand 
              and supply patterns throughout the year.
            </Text>
          </View>

          <View style={styles.factorCard}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorIcon}>⭐</Text>
              <Text style={styles.factorTitle}>Quality Grades</Text>
            </View>
            <Text style={styles.factorDescription}>
              Different quality grades command different prices. GR1 (premium) has highest value, 
              followed by GR2 (standard) and White (specialty variety).
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Advanced Tips</Text>
            <Text style={styles.tipText}>
              • Consider multiple factors for accurate predictions{'\n'}
              • Monitor weather patterns regularly{'\n'}
              • Track economic indicators for better insights{'\n'}
              • Seasonal trends affect long-term planning
            </Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>⚠️ Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              Advanced predictions use multiple variables and machine learning models. 
              Results are estimates and actual prices may vary due to unforeseen market conditions.
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
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
  
  // Predict Button
  predictButton: {
    backgroundColor: '#6f42c1',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6f42c1',
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
  predictButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },
  
  // Factor Section
  factorSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  factorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#6f42c1',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  factorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  factorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
  },
  factorDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  
  // Additional Info
  additionalInfo: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 16,
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
  disclaimerCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
});