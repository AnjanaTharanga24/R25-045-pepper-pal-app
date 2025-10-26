import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';

export default function HomeScreen({ navigation }) {
  const features = [
    {
      title: 'Price Prediction',
      subtitle: 'AI-powered market forecasting',
      icon: '📈',
      screen: 'Predict Price'
    },
    {
      title: 'Disease Detection',
      subtitle: 'Smart crop health analysis',
      icon: '🔬',
      screen: 'Detect Disease'
    },
    {
      title: 'Fertilizer Guide',
      subtitle: 'Personalized recommendations',
      icon: '🌱',
      screen: 'Fertilizer'
    },
    {
      title: 'Pepper Varieties',
      subtitle: 'Explore different types',
      icon: '🌶️',
      screen: 'Varieties'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appName}>PepperPal</Text>
        <Text style={styles.tagline}>Smart Farming</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good Morning, Farmer</Text>
          <Text style={styles.subtitle}>Manage your pepper farm efficiently</Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                style={styles.featureCard}
                onPress={() => navigation.navigate(feature.screen)}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fff8',
  },
  
  // Header
  header: {
    backgroundColor: '#2d5c3e',
    padding: 20,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#b8d8c4',
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Welcome Section
  welcomeSection: {
    padding: 20,
    backgroundColor: '#4a7c59',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#d1e7dd',
  },
  
  // Features Section
  featuresSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 16,
    marginLeft: 4,
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#4a7c59',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#6c757d',
  },
  arrow: {
    fontSize: 16,
    color: '#4a7c59',
    fontWeight: '600',
  },
  
  bottomSpacing: {
    height: 20,
  },
});