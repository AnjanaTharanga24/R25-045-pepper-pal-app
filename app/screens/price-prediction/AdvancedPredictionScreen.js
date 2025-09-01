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

export default function AdvancedPredictionScreen({ navigation }) {
  const [rainfall, setRainfall] = useState('150');
  const [priceType, setPriceType] = useState('GR1');
  const [inflationRate, setInflationRate] = useState('12');
  const [seasonality, setSeasonality] = useState('NO');
  const [isLoading, setIsLoading] = useState(false);
  
  // Error state management
  const [errors, setErrors] = useState({
    rainfall: '',
    inflationRate: ''
  });

  const priceTypes = [
    { label: 'GR1 (Grade 1)', value: 'GR1' },
    { label: 'GR2 (Grade 2)', value: 'GR2' },
    { label: 'White', value: 'WHITE' }
  ];

  const seasonalityOptions = [
    { label: 'No', value: 'NO' },
    { label: 'Yes', value: 'YES' }
  ];

  // Enhanced validation function
  const validateInputs = () => {
    const newErrors = { rainfall: '', inflationRate: '' };
    let isValid = true;

    // Rainfall validation
    const rainfallNum = parseFloat(rainfall);
    if (!rainfall.trim()) {
      newErrors.rainfall = 'Rainfall is required';
      isValid = false;
    } else if (isNaN(rainfallNum)) {
      newErrors.rainfall = 'Please enter a valid number';
      isValid = false;
    } else if (rainfallNum < 0) {
      newErrors.rainfall = 'Rainfall cannot be negative';
      isValid = false;
    } else if (rainfallNum < 150) {
      newErrors.rainfall = 'Rainfall must be at least 150mm for optimal prediction';
      isValid = false;
    } else if (rainfallNum > 200) {
      newErrors.rainfall = 'Rainfall must not exceed 200mm for optimal prediction';
      isValid = false;
    }

    // Inflation rate validation
    const inflationNum = parseFloat(inflationRate);
    if (!inflationRate.trim()) {
      newErrors.inflationRate = 'Inflation rate is required';
      isValid = false;
    } else if (isNaN(inflationNum)) {
      newErrors.inflationRate = 'Please enter a valid number';
      isValid = false;
    } else if (inflationNum < 0) {
      newErrors.inflationRate = 'Inflation rate cannot be negative';
      isValid = false;
    } else if (inflationNum > 100) {
      newErrors.inflationRate = 'Inflation rate cannot exceed 100%';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Real-time validation for rainfall
  const handleRainfallChange = (value) => {
    setRainfall(value);
    
    if (errors.rainfall) {
      const rainfallNum = parseFloat(value);
      let newError = '';
      
      if (!value.trim()) {
        newError = 'Rainfall is required';
      } else if (isNaN(rainfallNum)) {
        newError = 'Please enter a valid number';
      } else if (rainfallNum < 0) {
        newError = 'Rainfall cannot be negative';
      } else if (rainfallNum < 150) {
        newError = 'Rainfall must be at least 150mm for optimal prediction';
      } else if (rainfallNum > 200) {
        newError = 'Rainfall must not exceed 200mm for optimal prediction';
      }
      
      setErrors(prev => ({ ...prev, rainfall: newError }));
    }
  };

  // Real-time validation for inflation rate
  const handleInflationRateChange = (value) => {
    setInflationRate(value);
    
    if (errors.inflationRate) {
      const inflationNum = parseFloat(value);
      let newError = '';
      
      if (!value.trim()) {
        newError = 'Inflation rate is required';
      } else if (isNaN(inflationNum)) {
        newError = 'Please enter a valid number';
      } else if (inflationNum < 0) {
        newError = 'Inflation rate cannot be negative';
      } else if (inflationNum > 100) {
        newError = 'Inflation rate cannot exceed 100%';
      }
      
      setErrors(prev => ({ ...prev, inflationRate: newError }));
    }
  };

  const predictAdvancedPrice = async (rainfallValue, priceTypeValue, inflationRateValue, seasonalityValue) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/new-price/predict`, {
        rainfall: parseFloat(rainfallValue),
        price_type: priceTypeValue,
        inflation_rate: parseFloat(inflationRateValue),
        seasonality: seasonalityValue
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const onPredict = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    try {
      const prediction = await predictAdvancedPrice(rainfall, priceType, inflationRate, seasonality);
      
      const predictedPrice = prediction.predicted_price;
      const lowerPrice = Math.round(predictedPrice * 0.95);
      const upperPrice = Math.round(predictedPrice * 1.05);
      
      Alert.alert(
        'Advanced Price Prediction',
        `Predicted price range for ${priceType} quality:\n\nRs. ${lowerPrice} - Rs. ${upperPrice} per kg\n\nPredicted Price: Rs. ${predictedPrice.toFixed(2)}\nFactors considered:\n• Rainfall: ${rainfall}mm\n• Inflation: ${inflationRate}%\n• Seasonality: ${seasonality === 'NO' ? 'No' : 'Yes'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      let errorMessage = 'Failed to get prediction. Please try again.';
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      Alert.alert(
        'Error', 
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getRainfallStatus = () => {
    const rainfallNum = parseFloat(rainfall) || 0;
    if (rainfallNum < 150) return { status: 'Below Optimal', color: '#dc3545', icon: '🌵' };
    if (rainfallNum <= 200) return { status: 'Optimal', color: '#28a745', icon: '🌿' };
    return { status: 'Above Optimal', color: '#ffc107', icon: '⛈️' };
  };

  const getInflationImpact = () => {
    const inflationNum = parseFloat(inflationRate) || 0;
    if (inflationNum < 5) return { impact: 'Low Impact', color: '#28a745' };
    if (inflationNum <= 15) return { impact: 'Moderate Impact', color: '#ffc107' };
    if (inflationNum <= 50) return { impact: 'High Impact', color: '#dc3545' };
    return { impact: 'Critical Impact', color: '#6f42c1' };
  };

  const rainfallStatus = getRainfallStatus();
  const inflationImpact = getInflationImpact();

  // Check if form is valid for button state
  const isFormValid = !errors.rainfall && !errors.inflationRate && rainfall.trim() && inflationRate.trim();

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

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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
            <Text style={styles.label}>Rainfall (mm) *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.textInput, 
                  errors.rainfall ? styles.errorInput : null
                ]}
                value={rainfall}
                onChangeText={handleRainfallChange}
                placeholder="Enter rainfall (150-200mm)"
                keyboardType="numeric"
                maxLength={6}
                editable={!isLoading}
              />
              {!errors.rainfall && (
                <View style={[styles.statusBadge, { backgroundColor: rainfallStatus.color + '20' }]}>
                  <Text style={styles.statusIcon}>{rainfallStatus.icon}</Text>
                  <Text style={[styles.statusText, { color: rainfallStatus.color }]}>
                    {rainfallStatus.status}
                  </Text>
                </View>
              )}
            </View>
            {errors.rainfall ? (
              <Text style={styles.errorText}>❌ {errors.rainfall}</Text>
            ) : (
              <Text style={styles.inputHint}>Optimal range: 150-200mm for best predictions</Text>
            )}
          </View>

          {/* Price Type Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price Type *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priceType}
                onValueChange={(itemValue) => setPriceType(itemValue)}
                style={styles.picker}
                enabled={!isLoading}
                dropdownIconColor="#2d5c3e"
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
            <Text style={styles.label}>Inflation Rate (%) *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.textInput,
                  errors.inflationRate ? styles.errorInput : null
                ]}
                value={inflationRate}
                onChangeText={handleInflationRateChange}
                placeholder="Enter inflation rate (0-100%)"
                keyboardType="numeric"
                maxLength={5}
                editable={!isLoading}
              />
              {!errors.inflationRate && (
                <View style={[styles.statusBadge, { backgroundColor: inflationImpact.color + '20' }]}>
                  <Text style={[styles.statusText, { color: inflationImpact.color }]}>
                    {inflationImpact.impact}
                  </Text>
                </View>
              )}
            </View>
            {errors.inflationRate ? (
              <Text style={styles.errorText}>❌ {errors.inflationRate}</Text>
            ) : (
              <Text style={styles.inputHint}>Current economic inflation rate (0-100%)</Text>
            )}
          </View>

          {/* Seasonality Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Seasonality Effect</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={seasonality}
                onValueChange={(itemValue) => setSeasonality(itemValue)}
                style={styles.picker}
                enabled={!isLoading}
                dropdownIconColor="#2d5c3e"
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

          {/* Validation Summary */}
          {(errors.rainfall || errors.inflationRate) && (
            <View style={styles.validationSummary}>
              <Text style={styles.validationTitle}>⚠️ Please fix the following errors:</Text>
              {errors.rainfall && <Text style={styles.validationError}>• {errors.rainfall}</Text>}
              {errors.inflationRate && <Text style={styles.validationError}>• {errors.inflationRate}</Text>}
            </View>
          )}

          {/* Predict Button */}
          <TouchableOpacity
            style={[
              styles.predictButton, 
              (isLoading || !isFormValid) && styles.disabledButton
            ]}
            onPress={onPredict}
            disabled={isLoading || !isFormValid}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.predictButtonText}>Get Advanced Prediction</Text>
                <Text style={styles.buttonIcon}>🔬</Text>
              </>
            )}
          </TouchableOpacity>

          {!isFormValid && !isLoading && (
            <Text style={styles.buttonHint}>
              Please correct all errors above to enable prediction
            </Text>
          )}
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
              supports healthy growth, while insufficient or excessive rainfall can impact quality and supply.
            </Text>
          </View>

          <View style={styles.factorCard}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorIcon}>📈</Text>
              <Text style={styles.factorTitle}>Inflation Effect</Text>
            </View>
            <Text style={styles.factorDescription}>
              Economic inflation affects production costs, transportation, and overall market pricing. 
              Higher inflation typically leads to increased commodity prices. Must be between 0-100%.
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

        {/* Input Requirements */}
        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Input Requirements</Text>
          
          <View style={styles.requirementCard}>
            <Text style={styles.requirementTitle}>🎯 Validation Rules</Text>
            <View style={styles.requirementsList}>
              <Text style={styles.requirementItem}>• Rainfall: Must be between 150-200mm (cannot be negative)</Text>
              <Text style={styles.requirementItem}>• Inflation Rate: Must be between 0-100% (cannot exceed 100%)</Text>
              <Text style={styles.requirementItem}>• All required fields must be filled</Text>
              <Text style={styles.requirementItem}>• Only numeric values are accepted for rainfall and inflation</Text>
            </View>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>⚠️ Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              Advanced predictions use multiple variables and machine learning models. 
              Results are estimates and actual prices may vary due to unforeseen market conditions. 
              Please ensure all inputs are within the specified ranges for accurate predictions.
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
  scrollContent: {
    paddingBottom: 20,
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
  errorInput: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  inputHint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 6,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 6,
    fontWeight: '500',
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
  
  // Validation Summary
  validationSummary: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    marginTop: 8,
  },
  validationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc3545',
    marginBottom: 8,
  },
  validationError: {
    fontSize: 13,
    color: '#dc3545',
    marginBottom: 4,
    lineHeight: 18,
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
  buttonHint: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // Requirements Section
  requirementsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  requirementCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 12,
  },
  requirementsList: {
    gap: 6,
  },
  requirementItem: {
    fontSize: 13,
    color: '#1976d2',
    lineHeight: 18,
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