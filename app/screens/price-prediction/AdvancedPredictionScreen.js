import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import ModalSelector from 'react-native-modal-selector';
import axios from 'axios';
import { BASE_URL } from '../../config/config';

export default function AdvancedPredictionScreen({ navigation }) {
  const [rainfall, setRainfall] = useState('150');
  const [priceType, setPriceType] = useState('GR1');
  const [priceTypeLabel, setPriceTypeLabel] = useState('GR1 (Grade 1)');
  const [inflationRate, setInflationRate] = useState('12');
  const [seasonality, setSeasonality] = useState('NO');
  const [seasonalityLabel, setSeasonalityLabel] = useState('No');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ rainfall: '', inflationRate: '' });

  const priceTypes = [
    { key: 'GR1', label: 'GR1 (Grade 1)' },
    { key: 'GR2', label: 'GR2 (Grade 2)' },
    { key: 'WHITE', label: 'White' },
  ];

  const seasonalityOptions = [
    { key: 'NO', label: 'No' },
    { key: 'YES', label: 'Yes' },
  ];

  // Set initial labels for priceType and seasonality
  useEffect(() => {
    const initialPriceType = priceTypes.find((t) => t.key === priceType);
    setPriceTypeLabel(initialPriceType ? initialPriceType.label : 'Select Price Type');

    const initialSeasonality = seasonalityOptions.find((s) => s.key === seasonality);
    setSeasonalityLabel(initialSeasonality ? initialSeasonality.label : 'Select Seasonality');
  }, [priceType, seasonality]);

  const validateInputs = () => {
    const newErrors = { rainfall: '', inflationRate: '' };
    let isValid = true;

    const rainfallNum = parseFloat(rainfall);
    if (!rainfall.trim()) {
      newErrors.rainfall = 'Rainfall is required';
      isValid = false;
    } else if (isNaN(rainfallNum) || rainfallNum < 0) {
      newErrors.rainfall = 'Invalid value';
      isValid = false;
    } else if (rainfallNum < 150 || rainfallNum > 200) {
      newErrors.rainfall = 'Must be 150-200mm';
      isValid = false;
    }

    const inflationNum = parseFloat(inflationRate);
    if (!inflationRate.trim()) {
      newErrors.inflationRate = 'Inflation rate is required';
      isValid = false;
    } else if (isNaN(inflationNum) || inflationNum < 0 || inflationNum > 100) {
      newErrors.inflationRate = 'Must be 0-100%';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRainfallChange = (value) => {
    setRainfall(value);
    if (errors.rainfall) {
      const rainfallNum = parseFloat(value);
      let newError = '';
      if (!value.trim() || isNaN(rainfallNum) || rainfallNum < 0) {
        newError = 'Invalid value';
      } else if (rainfallNum < 150 || rainfallNum > 200) {
        newError = 'Must be 150-200mm';
      }
      setErrors((prev) => ({ ...prev, rainfall: newError }));
    }
  };

  const handleInflationRateChange = (value) => {
    setInflationRate(value);
    if (errors.inflationRate) {
      const inflationNum = parseFloat(value);
      let newError = '';
      if (!value.trim() || isNaN(inflationNum) || inflationNum < 0 || inflationNum > 100) {
        newError = 'Must be 0-100%';
      }
      setErrors((prev) => ({ ...prev, inflationRate: newError }));
    }
  };

  const onPredict = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/new-price/predict`, {
        rainfall: parseFloat(rainfall),
        price_type: priceType,
        inflation_rate: parseFloat(inflationRate),
        seasonality: seasonality,
      });

      const predictedPrice = response.data.predicted_price;
      const lowerPrice = Math.round(predictedPrice - 50);
      const upperPrice = Math.round(predictedPrice + 50);

      Alert.alert(
        'Advanced Price Prediction',
        `Predicted price range for ${priceType}:\n\n` +
        `Rs. ${lowerPrice} - Rs. ${upperPrice} per kg\n\n` +
        `Predicted: Rs. ${predictedPrice.toFixed(2)}\n` +
        `Rainfall: ${rainfall}mm\n` +
        `Inflation: ${inflationRate}%\n` +
        `Seasonality: ${seasonality === 'NO' ? 'No' : 'Yes'}`,
        [{ text: 'OK' }],
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'Network error', [{ text: 'OK' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !errors.rainfall && !errors.inflationRate && rainfall.trim() && inflationRate.trim();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Prediction</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Advanced Price Prediction</Text>
        <Text style={styles.subtitle}>Multi-factor price forecasting</Text>

        <View style={styles.form}>
          {/* Rainfall */}
          <View style={styles.field}>
            <Text style={styles.label}>Rainfall (mm) *</Text>
            <TextInput
              style={[styles.input, errors.rainfall && styles.inputError]}
              value={rainfall}
              onChangeText={handleRainfallChange}
              placeholder="150-200mm"
              keyboardType="numeric"
              editable={!isLoading}
            />
            {errors.rainfall ? (
              <Text style={styles.errorText}>{errors.rainfall}</Text>
            ) : (
              <Text style={styles.hint}>Optimal: 150-200mm</Text>
            )}
          </View>

          {/* Price Type */}
          <View style={styles.field}>
            <Text style={styles.label}>Price Type *</Text>
            <ModalSelector
              data={priceTypes}
              initValue="Select Price Type"
              onChange={(option) => {
                setPriceType(option.key);
                setPriceTypeLabel(option.label);
              }}
              style={[styles.pickerBox, isLoading && styles.disabledPicker]}
              disabled={isLoading}
              selectStyle={styles.modalSelector}
              selectTextStyle={styles.modalSelectorText}
              initValueTextStyle={styles.modalSelectorText}
              cancelText="Cancel"
              cancelStyle={styles.modalCancelButton}
              cancelTextStyle={styles.modalCancelText}
            >
              <View style={[styles.pickerBox, isLoading && styles.disabledPicker]}>
                <Text style={[styles.modalSelectorText, !priceTypeLabel && styles.placeholderText]}>
                  {priceTypeLabel || 'Select Price Type'}
                </Text>
              </View>
            </ModalSelector>
          </View>

          {/* Inflation Rate */}
          <View style={styles.field}>
            <Text style={styles.label}>Inflation Rate (%) *</Text>
            <TextInput
              style={[styles.input, errors.inflationRate && styles.inputError]}
              value={inflationRate}
              onChangeText={handleInflationRateChange}
              placeholder="0-100%"
              keyboardType="numeric"
              editable={!isLoading}
            />
            {errors.inflationRate ? (
              <Text style={styles.errorText}>{errors.inflationRate}</Text>
            ) : (
              <Text style={styles.hint}>Current rate: 0-100%</Text>
            )}
          </View>

          {/* Seasonality */}
          <View style={styles.field}>
            <Text style={styles.label}>Seasonality Effect</Text>
            <ModalSelector
              data={seasonalityOptions}
              initValue="Select Seasonality"
              onChange={(option) => {
                setSeasonality(option.key);
                setSeasonalityLabel(option.label);
              }}
              style={[styles.pickerBox, isLoading && styles.disabledPicker]}
              disabled={isLoading}
              selectStyle={styles.modalSelector}
              selectTextStyle={styles.modalSelectorText}
              initValueTextStyle={styles.modalSelectorText}
              cancelText="Cancel"
              cancelStyle={styles.modalCancelButton}
              cancelTextStyle={styles.modalCancelText}
            >
              <View style={[styles.pickerBox, isLoading && styles.disabledPicker]}>
                <Text style={[styles.modalSelectorText, !seasonalityLabel && styles.placeholderText]}>
                  {seasonalityLabel || 'Select Seasonality'}
                </Text>
              </View>
            </ModalSelector>
          </View>

          {/* Validation Errors */}
          {(errors.rainfall || errors.inflationRate) && (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>⚠️ Fix errors:</Text>
              {errors.rainfall && <Text style={styles.errorItem}>• {errors.rainfall}</Text>}
              {errors.inflationRate && <Text style={styles.errorItem}>• {errors.inflationRate}</Text>}
            </View>
          )}

          {/* Predict Button */}
          <TouchableOpacity
            style={[styles.btn, (!isFormValid || isLoading) && styles.btnDisabled]}
            onPress={onPredict}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>Get Prediction</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Prediction Factors</Text>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>🌧️ Rainfall Impact</Text>
            <Text style={styles.infoCardText}>
              Affects plant growth and yield. Optimal: 150-200mm.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>📈 Inflation Effect</Text>
            <Text style={styles.infoCardText}>
              Impacts production costs and pricing. Range: 0-100%.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>📅 Seasonal Variation</Text>
            <Text style={styles.infoCardText}>
              Seasonal effects on supply and demand patterns.
            </Text>
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.requirementBox}>
          <Text style={styles.requirementTitle}>🎯 Input Requirements</Text>
          <Text style={styles.requirementText}>• Rainfall: 150-200mm</Text>
          <Text style={styles.requirementText}>• Inflation: 0-100%</Text>
          <Text style={styles.requirementText}>• All fields required</Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerTitle}>⚠️ Disclaimer</Text>
          <Text style={styles.disclaimerText}>
            Predictions are estimates. Actual prices may vary due to market conditions.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d5c3e',
    padding: 16,
  },
  backText: {
    color: '#fff',
    fontSize: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d5c3e',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  form: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 4,
    padding: 12,
    fontSize: 15,
    color: '#2d5c3e',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  hint: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 11,
    color: '#dc3545',
    marginTop: 4,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 4,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  disabledPicker: {
    backgroundColor: '#e9ecef',
    opacity: 0.6,
  },
  modalSelector: {
    borderWidth: 0,
  },
  modalSelectorText: {
    fontSize: 15,
    color: '#2d5c3e',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#666',
    fontWeight: '400',
  },
  modalCancelButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  modalCancelText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#dc3545',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#dc3545',
    marginBottom: 4,
  },
  errorItem: {
    fontSize: 12,
    color: '#dc3545',
    marginBottom: 2,
  },
  btn: {
    backgroundColor: '#6f42c1',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: {
    backgroundColor: '#ccc',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6f42c1',
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 4,
  },
  infoCardText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  requirementBox: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  requirementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 2,
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
    marginBottom: 20,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
});