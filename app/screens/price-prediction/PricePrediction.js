import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

export default function PricePredictionScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Price Prediction</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.title}>Black Pepper Price Prediction</Text>
        <Text style={styles.subtitle}>Choose your prediction type</Text>

        {/* Prediction Options */}
        <View style={styles.optionsContainer}>
          {/* District Level */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('District Price')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🏘️</Text>
              <Text style={styles.cardTitle}>District Level</Text>
            </View>
            <Text style={styles.cardDescription}>
              Get price predictions for specific districts
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>14 districts • Regional analysis</Text>
            </View>
          </TouchableOpacity>

          {/* National Level */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('National Price')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🇱🇰</Text>
              <Text style={styles.cardTitle}>National Level</Text>
            </View>
            <Text style={styles.cardDescription}>
              National average price by quality grade
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>GR-1, GR-2, White grades</Text>
            </View>
          </TouchableOpacity>

          {/* Advanced Analysis */}
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate('Advanced Price')}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🔬</Text>
              <Text style={styles.cardTitle}>Advanced Analysis</Text>
            </View>
            <Text style={styles.cardDescription}>
              Multi-factor analysis with weather and economic data
            </Text>
            <View style={styles.cardFooter}>
              <Text style={styles.footerText}>Weather • Inflation • Seasonality</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 About Predictions</Text>
          <Text style={styles.infoText}>
            Our models use historical data, weather patterns, and market trends for accurate forecasts.
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
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#17a2b8',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
});