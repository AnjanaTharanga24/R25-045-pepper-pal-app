import React, { useState } from "react";
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
import { Picker } from "@react-native-picker/picker";
import axios from "axios";
import { BASE_URL } from "../../config/config";

export default function NationalPredictionScreen({ navigation }) {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("GR1");
  const [isLoading, setIsLoading] = useState(false);

  const qualityTypes = [
    { label: "GR1 (Grade 1)", value: "GR1" },
    { label: "GR2 (Grade 2)", value: "GR2" },
    { label: "White", value: "White" },
  ];

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
      // Format the date as YYYY-MM-DD
      const formattedDate = date.toISOString().split("T")[0];

      // Call the API
      const prediction = await predictNationalPrice(
        selectedQuality,
        formattedDate
      );

      // Calculate confidence range (±5% of predicted price)
      const predictedPrice = prediction.predicted_price;
      const lowerPrice = Math.round(predictedPrice - 50);
      const upperPrice = Math.round(predictedPrice + 50);

      Alert.alert(
        "National Price Prediction",
        `Predicted national average price range for ${
          prediction.pepper_type
        } quality on ${date.toLocaleDateString(
          "en-GB"
        )}:\n\nRs. ${lowerPrice} - Rs. ${upperPrice} per kg\n\nPredicted Price: Rs. ${predictedPrice.toFixed(
          2
        )}\nMarket Coverage: All Districts`,
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>National Prediction</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>National Level Price Prediction</Text>
          <Text style={styles.subtitle}>
            Get nationwide average price forecasts by quality grade
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formContainer}>
          {/* Quality Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Quality Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedQuality}
                onValueChange={(itemValue) => setSelectedQuality(itemValue)}
                style={styles.picker}
                dropdownIconColor="#2d5c3e"
                enabled={!isLoading}
              >
                {qualityTypes.map((quality) => (
                  <Picker.Item
                    key={quality.value}
                    label={quality.label}
                    value={quality.value}
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
                  {date.toLocaleDateString("en-GB")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* {showPicker && (
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
          )} */}

          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              // No date restrictions at all
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
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Coverage:</Text>
              <Text style={styles.infoValue}>All Districts</Text>
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
                <Text style={styles.predictButtonText}>
                  Get National Prediction
                </Text>
                <Text style={styles.buttonIcon}>🚀</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Quality Info Section */}
        <View style={styles.qualityInfoSection}>
          <Text style={styles.sectionTitle}>Quality Grade Information</Text>

          <View style={styles.qualityCard}>
            <View style={styles.qualityHeader}>
              <Text style={styles.qualityGrade}>GR1</Text>
              <Text style={styles.qualityBadge}>Premium</Text>
            </View>
            <Text style={styles.qualityDescription}>
              Highest quality grade with superior appearance, minimal defects,
              and excellent market value.
            </Text>
          </View>

          <View style={styles.qualityCard}>
            <View style={styles.qualityHeader}>
              <Text style={styles.qualityGrade}>GR2</Text>
              <Text style={styles.qualityBadge}>Standard</Text>
            </View>
            <Text style={styles.qualityDescription}>
              Good quality grade with acceptable appearance and minor defects,
              widely accepted in markets.
            </Text>
          </View>

          <View style={styles.qualityCard}>
            <View style={styles.qualityHeader}>
              <Text style={styles.qualityGrade}>White</Text>
              <Text style={styles.qualityBadge}>Specialty</Text>
            </View>
            <Text style={styles.qualityDescription}>
              Specialty white variety with unique market demand and specific
              pricing patterns.
            </Text>
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>💡 Prediction Tips</Text>
            <Text style={styles.tipText}>
              • National predictions cover all major markets{"\n"}• Quality
              grades affect pricing significantly{"\n"}• Best accuracy for
              predictions up to 7 days ahead
            </Text>
          </View>

          <View style={styles.disclaimerCard}>
            <Text style={styles.disclaimerTitle}>⚠️ Disclaimer</Text>
            <Text style={styles.disclaimerText}>
              Predictions are estimates based on historical data and market
              trends. Actual prices may vary due to market volatility and
              external factors.
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
    backgroundColor: "#f0f9f0",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#2d5c3e",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
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
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2d5c3e",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
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
    fontWeight: "600",
    color: "#2d5c3e",
    marginBottom: 12,
  },
  pickerContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#28a745",
    overflow: "hidden",
    shadowColor: "#2d5c3e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  picker: {
    height: 50,
    backgroundColor: "#ffffff",
  },
  pickerItem: {
    fontSize: 16,
    color: "#2d5c3e",
  },

  // Date Input
  dateInput: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#28a745",
    padding: 16,
    shadowColor: "#2d5c3e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dateContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    color: "#2d5c3e",
    fontWeight: "500",
  },

  // Info Card
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#17a2b8",
    shadowColor: "#2d5c3e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d5c3e",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#2d5c3e",
    fontWeight: "600",
  },

  // Predict Button
  predictButton: {
    backgroundColor: "#28a745",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#28a745",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#6c757d",
    shadowOpacity: 0.1,
  },
  predictButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },

  // Quality Info Section
  qualityInfoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2d5c3e",
    marginBottom: 8,
  },
  qualityCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#28a745",
    shadowColor: "#2d5c3e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  qualityHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  qualityGrade: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2d5c3e",
  },
  qualityBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: "#28a745",
    backgroundColor: "#d4edda",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  qualityDescription: {
    fontSize: 14,
    color: "#6c757d",
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
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#ffa500",
    shadowColor: "#2d5c3e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2d5c3e",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
  },
  disclaimerCard: {
    backgroundColor: "#fff3cd",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: "#ffc107",
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#856404",
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: "#856404",
    lineHeight: 18,
  },
});
