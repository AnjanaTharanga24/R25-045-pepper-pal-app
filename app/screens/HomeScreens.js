import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, SafeAreaView } from 'react-native';

const { width, height } = Dimensions.get('window');

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
      {/* Simple Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.appName}>PepperPal</Text>
              <Text style={styles.tagline}>Smart Farming</Text>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.icon}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Text style={styles.icon}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Good Morning, Farmer</Text>
          <Text style={styles.subtitle}>Let's manage your pepper farm efficiently</Text>
        </View>

        {/* Market Overview Card */}
        <View style={styles.marketCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Market Overview</Text>
            <View style={styles.liveStatus}>
              <View style={styles.liveIndicator} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
          
          <View style={styles.marketInfo}>
            <View style={styles.priceSection}>
              <Text style={styles.currentPrice}>₹450</Text>
              <Text style={styles.priceUnit}>per kg</Text>
            </View>
            <View style={styles.changeSection}>
              <Text style={styles.priceChange}>+2.3%</Text>
              <Text style={styles.changeLabel}>Today</Text>
            </View>
          </View>
        </View>

        {/* Premium Quality Card */}
        <View style={styles.qualityCard}>
          <View style={styles.qualityHeader}>
            <Text style={styles.qualityTitle}>Sri Lankan Black Pepper</Text>
            <View style={styles.qualityBadge}>
              <Text style={styles.badgeText}>Premium</Text>
            </View>
          </View>
          <Text style={styles.qualityDescription}>
            Export grade quality with AI-powered market insights and recommendations
          </Text>
          <View style={styles.qualityMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>95%</Text>
              <Text style={styles.metricLabel}>Quality Score</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>Fresh</Text>
              <Text style={styles.metricLabel}>Status</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>12.5kg</Text>
              <Text style={styles.metricLabel}>Today's Harvest</Text>
            </View>
          </View>
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
                activeOpacity={0.7}
              >
                <View style={styles.featureIcon}>
                  <Text style={styles.featureIconText}>{feature.icon}</Text>
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
                </View>
                <View style={styles.featureArrow}>
                  <Text style={styles.arrowText}>→</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Navigation Bar */}
      <View style={styles.navigationBar}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Text style={[styles.navIcon, styles.activeNavIcon]}>🏠</Text>
          <Text style={[styles.navLabel, styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Analytics</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>🌱</Text>
          <Text style={styles.navLabel}>Farm</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>💰</Text>
          <Text style={styles.navLabel}>Market</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9f0', // Light green background
  },
  
  // Simple Header
  header: {
    backgroundColor: '#2d5c3e', // Deep forest green
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brandInfo: {
    justifyContent: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#b8d8c4', // Light green for tagline
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Welcome Section
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#4a7c59', // Medium green
    marginBottom: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#d1e7dd',
    lineHeight: 24,
  },
  
  // Market Card
  marketCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745', // Success green
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
  },
  liveStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#28a745',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '600',
  },
  marketInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2d5c3e',
  },
  priceUnit: {
    fontSize: 16,
    color: '#6c757d',
    marginLeft: 8,
  },
  changeSection: {
    alignItems: 'flex-end',
  },
  priceChange: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: '600',
  },
  changeLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  
  // Quality Card
  qualityCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#ffa500', // Orange accent
  },
  qualityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  qualityTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
    flex: 1,
  },
  qualityBadge: {
    backgroundColor: '#ffa500', // Orange
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  qualityDescription: {
    fontSize: 15,
    color: '#6c757d',
    lineHeight: 22,
    marginBottom: 20,
  },
  qualityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  
  // Features Section
  featuresSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 16,
  },
  featuresGrid: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 3,
    borderLeftColor: '#4a7c59',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f9f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  featureArrow: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f0f9f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 16,
    color: '#4a7c59',
    fontWeight: '600',
  },
  
  // Navigation Bar
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingVertical: 8,
    paddingHorizontal: 20,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeNavIcon: {
  },
  navLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  activeNavLabel: {
    color: '#4a7c59',
    fontWeight: '600',
  },
  
  bottomSpacing: {
    height: 20,
  },
});