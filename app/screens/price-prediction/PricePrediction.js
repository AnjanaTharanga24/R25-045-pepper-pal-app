import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

export default function PricePredictionScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>Price Prediction</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Black Pepper Price Prediction</Text>
          <Text style={styles.subtitle}>
            Choose your prediction type to get accurate market forecasts
          </Text>
        </View>

        {/* Prediction Options */}
        <View style={styles.optionsContainer}>
          {/* District Level Prediction */}
          <TouchableOpacity
            style={[styles.optionCard, styles.districtCard]}
            onPress={() => navigation.navigate('District Price')}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.iconText}>🏘️</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>District Level</Text>
              <Text style={styles.cardDescription}>
                Get price predictions for specific districts across Sri Lanka
              </Text>
              <View style={styles.cardFeatures}>
                <Text style={styles.featureText}>• Regional market analysis</Text>
                <Text style={styles.featureText}>• Location-based pricing</Text>
                <Text style={styles.featureText}>• 14 districts available</Text>
              </View>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>

          {/* National Level Prediction */}
          <TouchableOpacity
            style={[styles.optionCard, styles.nationalCard]}
            onPress={() => navigation.navigate('National Price')}
            activeOpacity={0.7}
          >
            <View style={styles.cardIcon}>
              <Text style={styles.iconText}>🇱🇰</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>National Level</Text>
              <Text style={styles.cardDescription}>
                Get national average price predictions by quality grade
              </Text>
              <View style={styles.cardFeatures}>
                <Text style={styles.featureText}>• Quality-based pricing</Text>
                <Text style={styles.featureText}>• National market trends</Text>
                <Text style={styles.featureText}>• GR-1, GR-2, White grades</Text>
              </View>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 20,
  },
  
  // Title Section
  titleSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
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
  
  // Options Container
  optionsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  
  // Option Cards
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  districtCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  nationalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ffa500',
  },
  cardIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: '#f0f9f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFeatures: {
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#4a7c59',
    fontWeight: '500',
  },
  cardArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f0f9f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: '#4a7c59',
    fontWeight: '600',
  },
  
  // Info Section
  infoSection: {
    marginTop: 16,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#17a2b8',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
});