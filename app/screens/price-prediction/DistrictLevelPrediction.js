import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.2:8000'; // Replace with your actual API URL

export default function DistrictPredictionScreen({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState('Kandy');
  const [isLoading, setIsLoading] = useState(false);

  const districts = [
    'Kandy', 'Matale', 'Nuwara Eliya', 'Kegalle', 'Ratnapura',
    'Badulla', 'Kurunagala', 'Colombo', 'Gampaha', 'Kalutara',
    'Galle', 'Matara', 'Hambantota', 'Monaragala'
  ];

  const predictDistrictPrice = async (district, targetDate) => {
    try {
      const response = await axios.post(`${BASE_URL}/district/predict`, {
        district,
        target_date: targetDate,
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const onPredict = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Format the date as YYYY-MM-DD
      const formattedDate = date.toISOString().split('T')[0];
      
      // Call the API
      const prediction = await predictDistrictPrice(selectedDistrict, formattedDate);
      
      Alert.alert(
        'Price Prediction',
        `Predicted price for ${prediction.district} district on ${date.toLocaleDateString('en-GB')}:\n\nRs. ${prediction.predicted_price.toFixed(2)} per kg\n\nModel Accuracy: ${prediction.model_accuracy}%`,
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
        <Text style={styles.headerTitle}>District Prediction</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>District Level Price Prediction</Text>
          <Text style={styles.subtitle}>
            Get accurate price forecasts for your specific district
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formContainer}>
          {/* District Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select District</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDistrict}
                onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
                style={styles.picker}
                dropdownIconColor="#2d5c3e"
              >
                {districts.map((district) => (
                  <Picker.Item 
                    key={district} 
                    label={district} 
                    value={district}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Date Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Date</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowPicker(true)}
              disabled={isLoading}
            >
              <View style={styles.dateContent}>
                <Text style={styles.dateIcon}>📅</Text>
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('en-GB')}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={(_, selectedDate) => {
                setShowPicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}

          {/* Selected Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Prediction Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>District:</Text>
              <Text style={styles.infoValue}>{selectedDistrict}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{date.toLocaleDateString('en-GB')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pepper Type:</Text>
              <Text style={styles.infoValue}>GR-1</Text>
            </View>
          </View>

          {/* Predict Button */}
          <TouchableOpacity
            style={[styles.predictButton, isLoading && styles.disabledButton]}
            onPress={onPredict}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.predictButtonText}>Get Price Prediction</Text>
                <Text style={styles.buttonIcon}>🚀</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Prediction Tips</Text>
            <Text style={styles.tipText}>
              • District predictions are based on local market conditions{'\n'}
              • Consider transportation costs to nearby markets{'\n'}
              • Weather patterns affect district-level pricing{'\n'}
              • Best accuracy for predictions up to 7 days ahead
            </Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>⚠️ Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              Predictions are estimates based on historical data and market trends. 
              Actual prices may vary due to market volatility and external factors.
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
  
  // Date Input
  dateInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#28a745',
    padding: 16,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dateContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: '#2d5c3e',
    fontWeight: '500',
  },
  
  // Info Card
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#2d5c3e',
    fontWeight: '600',
  },
  
  // Predict Button
  predictButton: {
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
  predictButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 18,
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
