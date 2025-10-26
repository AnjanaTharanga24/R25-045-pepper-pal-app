import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ModalSelector from "react-native-modal-selector";
import axios from "axios";
import { BASE_URL } from "../../config/config";

export default function NationalPredictionScreen({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("GR1");
  const [selectedQualityLabel, setSelectedQualityLabel] = useState("GR1 (Grade 1)");
  const [isLoading, setIsLoading] = useState(false);

  const qualityTypes = [
    { key: "GR1", label: "GR1 (Grade 1)" },
    { key: "GR2", label: "GR2 (Grade 2)" },
    { key: "White", label: "White" },
  ];

  // Set initial label for selectedQuality
  useEffect(() => {
    const initialQuality = qualityTypes.find(q => q.key === selectedQuality);
    setSelectedQualityLabel(initialQuality ? initialQuality.label : "Select Quality Type");
  }, [selectedQuality]);

  const predictNationalPrice = async (pepperType, targetDate) => {
    try {
      const response = await axios.post(`${BASE_URL}/price/predict`, {
        pepper_type: pepperType,
        target_date: targetDate,
      });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const onPredict = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const formattedDate = date.toISOString().split("T")[0];
      const prediction = await predictNationalPrice(selectedQuality, formattedDate);

      const predictedPrice = prediction.predicted_price + 190;
      const lowerPrice = Math.round(predictedPrice - 50);
      const upperPrice = Math.round(predictedPrice + 50);

      Alert.alert(
        "National Price Prediction",
        `Predicted national average price range for ${
          prediction.pepper_type
        } quality on ${date.toLocaleDateString("en-GB")}:\n\n` +
        `Rs. ${lowerPrice} - Rs. ${upperPrice} per kg\n\n` +
        `Predicted Price: Rs. ${predictedPrice.toFixed(2)}\n` +
        `Market Coverage: All Districts`,
        [{ text: "OK" }]
      );
    } catch (error) {
      let errorMessage = "Failed to get prediction. Please try again.";
      if (error.response) {
        errorMessage = error.response.data.error || errorMessage;
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>National Prediction</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>National Price Prediction</Text>
        <Text style={styles.subtitle}>Get nationwide average price forecasts</Text>

        <View style={styles.form}>
          {/* Quality Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Select Quality Type</Text>
            <ModalSelector
              data={qualityTypes}
              initValue="Select Quality Type"
              onChange={(option) => {
                setSelectedQuality(option.key);
                setSelectedQualityLabel(option.label);
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
                <Text style={[styles.modalSelectorText, !selectedQualityLabel && styles.placeholderText]}>
                  {selectedQualityLabel || "Select Quality Type"}
                </Text>
              </View>
            </ModalSelector>
          </View>

          {/* Date Selection */}
          <View style={styles.field}>
            <Text style={styles.label}>Select Date</Text>
            <TouchableOpacity
              style={[styles.dateBox, isLoading && styles.disabledPicker]}
              onPress={() => setShowPicker(true)}
              disabled={isLoading}
            >
              <Text style={styles.dateText}>
                📅 {date.toLocaleDateString("en-GB")}
              </Text>
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

          {/* Info Display */}
          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Prediction Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Quality Type:</Text>
              <Text style={styles.infoValue}>{selectedQuality}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>
                {date.toLocaleDateString("en-GB")}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Market Type:</Text>
              <Text style={styles.infoValue}>National Average</Text>
            </View>
          </View>

          {/* Predict Button */}
          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={onPredict}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>Get Price Prediction</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tips}>
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Tips</Text>
            <Text style={styles.tipText}>
              • National predictions cover all major markets{'\n'}
              • Best accuracy for 7 days ahead
            </Text>
          </View>

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>⚠️ Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              Predictions are estimates. Actual prices may vary due to market conditions.
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
    marginBottom: 20,
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
  dateBox: {
    borderWidth: 1,
    borderColor: '#28a745',
    borderRadius: 4,
    padding: 14,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 15,
    color: '#2d5c3e',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#17a2b8',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
  },
  infoValue: {
    fontSize: 13,
    color: '#2d5c3e',
    fontWeight: '600',
  },
  btn: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  btnDisabled: {
    backgroundColor: '#ccc',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tips: {
    gap: 12,
  },
  tipBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ffa500',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  disclaimerBox: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16,
  },
});