import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
  TextInput,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

export default function FertilizerGuide({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [plantAge, setPlantAge] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Permission handlers (same as disease detection)
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  };

  const requestGalleryPermission = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  };

  const handleImagePicker = () => {
    setShowOptions(true);
  };

  const openCamera = async () => {
    setShowOptions(false);
    
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
      setAnalysisResult(null);
    }
  };

  const openGallery = async () => {
    setShowOptions(false);
    
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Gallery permission is required to select photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0]);
      setAnalysisResult(null);
    }
  };

  const analyzeRequirements = async () => {
    if (!selectedImage) {
      Alert.alert('Missing Image', 'Please select an image of your pepper plant.');
      return;
    }

    if (!plantAge || isNaN(plantAge) || parseFloat(plantAge) <= 0) {
      Alert.alert('Invalid Age', 'Please enter a valid plant age in years.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const age = parseFloat(plantAge);
      const mockResults = [
        {
          stage: age < 1 ? 'Seedling' : age < 3 ? 'Young Plant' : age < 7 ? 'Mature Plant' : 'Old Plant',
          npkRatio: age < 1 ? '20-20-20' : age < 3 ? '15-15-15' : age < 7 ? '10-10-10' : '8-8-8',
          primaryNeeds: age < 1 ? ['High Nitrogen for Growth', 'Balanced Nutrients'] : 
                       age < 3 ? ['Moderate Nutrition', 'Root Development'] :
                       age < 7 ? ['Fruit Production Support', 'Potassium Rich'] :
                       ['Maintenance Feeding', 'Low Nutrients'],
          soilCondition: 'Good drainage detected',
          deficiencies: age < 1 ? [] : ['Slight nitrogen deficiency', 'Adequate phosphorus'],
          recommendations: [
            {
              fertilizer: age < 1 ? 'Organic Compost + NPK 20-20-20' : 
                         age < 3 ? 'NPK 15-15-15 + Organic Matter' :
                         age < 7 ? 'NPK 10-10-10 + Potash' :
                         'NPK 8-8-8 + Compost',
              quantity: age < 1 ? '50g per plant monthly' :
                       age < 3 ? '100g per plant monthly' :
                       age < 7 ? '150g per plant monthly' :
                       '100g per plant monthly',
              frequency: 'Monthly during growing season',
              method: 'Apply around root zone, 6 inches from stem'
            },
            {
              fertilizer: 'Organic Compost',
              quantity: age < 1 ? '500g per plant' :
                       age < 3 ? '1kg per plant' :
                       age < 7 ? '2kg per plant' :
                       '1.5kg per plant',
              frequency: 'Every 3 months',
              method: 'Mix with top soil around plant base'
            },
            {
              fertilizer: 'Liquid Fertilizer',
              quantity: '10ml per liter of water',
              frequency: 'Bi-weekly foliar spray',
              method: 'Spray on leaves early morning or evening'
            }
          ],
          additionalTips: [
            'Water thoroughly after fertilizer application',
            'Test soil pH regularly (ideal: 5.5-7.0)',
            'Add organic matter to improve soil structure',
            'Monitor plant response and adjust accordingly'
          ],
          seasonalAdvice: {
            rainy: 'Reduce fertilizer frequency, focus on drainage',
            dry: 'Increase watering with diluted liquid fertilizer',
            flowering: 'Boost potassium and phosphorus',
            fruiting: 'Maintain balanced nutrition with extra potassium'
          }
        }
      ];
      
      setAnalysisResult(mockResults[0]);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze requirements. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearData = () => {
    setSelectedImage(null);
    setPlantAge('');
    setAnalysisResult(null);
  };

  const getStageColor = (stage) => {
    switch (stage.toLowerCase()) {
      case 'seedling': return '#28a745';
      case 'young plant': return '#17a2b8';
      case 'mature plant': return '#ffc107';
      case 'old plant': return '#6c757d';
      default: return '#28a745';
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
        <Text style={styles.headerTitle}>Fertilizer Guide</Text>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={clearData}
        >
          <Text style={styles.clearIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Smart Fertilizer Recommendations</Text>
          <Text style={styles.subtitle}>
            Get personalized fertilizer advice based on your plant's image and age
          </Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          {/* Image Upload */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Plant Image</Text>
            {!selectedImage ? (
              <TouchableOpacity
                style={styles.uploadArea}
                onPress={handleImagePicker}
                activeOpacity={0.7}
              >
                <View style={styles.uploadIcon}>
                  <Text style={styles.uploadIconText}>🌿</Text>
                </View>
                <Text style={styles.uploadTitle}>Add Plant Photo</Text>
                <Text style={styles.uploadSubtitle}>
                  Take or select a clear photo of your pepper plant
                </Text>
                <View style={styles.uploadButton}>
                  <Text style={styles.uploadButtonText}>Select Image</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.selectedImage}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Plant Age Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Plant Age (Years)</Text>
            <View style={styles.ageInputContainer}>
              <Text style={styles.ageIcon}>🕐</Text>
              <TextInput
                style={styles.ageInput}
                value={plantAge}
                onChangeText={setPlantAge}
                placeholder="Enter plant age (e.g., 2.5)"
                placeholderTextColor="#6c757d"
                keyboardType="decimal-pad"
                maxLength={4}
              />
              <Text style={styles.ageUnit}>years</Text>
            </View>
            <Text style={styles.inputHint}>
              Enter the approximate age of your pepper plant from planting
            </Text>
          </View>
        </View>

        {/* Analysis Button */}
        {selectedImage && plantAge && (
          <View style={styles.analysisSection}>
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.disabledButton]}
              onPress={analyzeRequirements}
              disabled={isAnalyzing}
              activeOpacity={0.8}
            >
              {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loadingText}>Analyzing...</Text>
                </View>
              ) : (
                <Text style={styles.analyzeButtonText}>🌱 Get Fertilizer Advice</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Fertilizer Recommendations</Text>
            
            {/* Plant Stage Card */}
            <View style={styles.stageCard}>
              <View style={styles.stageHeader}>
                <Text style={styles.stageTitle}>Plant Stage</Text>
                <View style={[styles.stageBadge, { backgroundColor: getStageColor(analysisResult.stage) }]}>
                  <Text style={styles.stageBadgeText}>{analysisResult.stage}</Text>
                </View>
              </View>
              <Text style={styles.npkRatio}>Recommended NPK: {analysisResult.npkRatio}</Text>
              <Text style={styles.soilCondition}>{analysisResult.soilCondition}</Text>
            </View>

            {/* Primary Needs */}
            <View style={styles.needsCard}>
              <Text style={styles.cardTitle}>🎯 Primary Nutritional Needs</Text>
              {analysisResult.primaryNeeds.map((need, index) => (
                <View key={index} style={styles.needItem}>
                  <Text style={styles.needBullet}>•</Text>
                  <Text style={styles.needText}>{need}</Text>
                </View>
              ))}
            </View>

            {/* Fertilizer Recommendations */}
            <View style={styles.recommendationsCard}>
              <Text style={styles.cardTitle}>🌿 Fertilizer Schedule</Text>
              {analysisResult.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View style={styles.fertilizerHeader}>
                    <Text style={styles.fertilizerName}>{rec.fertilizer}</Text>
                    <Text style={styles.fertilizerQuantity}>{rec.quantity}</Text>
                  </View>
                  <Text style={styles.fertilizerDetails}>
                    {rec.frequency} • {rec.method}
                  </Text>
                </View>
              ))}
            </View>

            {/* Seasonal Advice */}
            <View style={styles.seasonalCard}>
              <Text style={styles.cardTitle}>🌦️ Seasonal Care Tips</Text>
              {Object.entries(analysisResult.seasonalAdvice).map(([season, advice]) => (
                <View key={season} style={styles.seasonItem}>
                  <Text style={styles.seasonName}>
                    {season.charAt(0).toUpperCase() + season.slice(1)} Season:
                  </Text>
                  <Text style={styles.seasonAdvice}>{advice}</Text>
                </View>
              ))}
            </View>

            {/* Additional Tips */}
            <View style={styles.tipsCard}>
              <Text style={styles.cardTitle}>💡 Additional Tips</Text>
              {analysisResult.additionalTips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>✓</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Growing Guide</Text>
          
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>🌱 Growth Stages</Text>
            <Text style={styles.guideText}>
              <Text style={styles.stageName}>0-1 years:</Text> Seedling stage - High growth nutrients{'\n'}
              <Text style={styles.stageName}>1-3 years:</Text> Young plant - Balanced nutrition{'\n'}
              <Text style={styles.stageName}>3-7 years:</Text> Mature plant - Focus on fruit production{'\n'}
              <Text style={styles.stageName}>7+ years:</Text> Established plant - Maintenance feeding
            </Text>
          </View>

          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>📏 Application Guidelines</Text>
            <Text style={styles.guideText}>
              • Apply fertilizer when soil is moist{'\n'}
              • Keep fertilizer 6 inches away from plant stem{'\n'}
              • Water thoroughly after application{'\n'}
              • Avoid fertilizing during extreme weather{'\n'}
              • Monitor plant response and adjust as needed
            </Text>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Important Notes</Text>
            <Text style={styles.warningText}>
              These recommendations are based on general guidelines. Soil testing and local 
              agricultural expert consultation are recommended for optimal results. Over-fertilization 
              can harm plants and the environment.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Image Source</Text>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={openCamera}
            >
              <Text style={styles.modalOptionIcon}>📷</Text>
              <Text style={styles.modalOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={openGallery}
            >
              <Text style={styles.modalOptionIcon}>🖼️</Text>
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    ...Platform.select({
      ios: { paddingTop: 16 },
      android: { paddingTop: 16 },
    }),
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
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearIcon: {
    fontSize: 16,
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
  
  // Input Section
  inputSection: {
    paddingHorizontal: 20,
    gap: 24,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
  },
  
  // Upload Area (same as disease detection)
  uploadArea: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#28a745',
    borderStyle: 'dashed',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  uploadIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#f0f9f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIconText: {
    fontSize: 40,
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Image Container
  imageContainer: {
    position: 'relative',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '600',
  },
  
  // Age Input
  ageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ageIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  ageInput: {
    flex: 1,
    fontSize: 16,
    color: '#2d5c3e',
    fontWeight: '500',
  },
  ageUnit: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  inputHint: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  
  // Analysis Section
  analysisSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  analyzeButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    shadowOpacity: 0.1,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Results Section
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d5c3e',
  },
  
  // Stage Card
  stageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
  },
  stageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  stageBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  npkRatio: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  soilCondition: {
    fontSize: 14,
    color: '#6c757d',
  },
  
  // Cards
  needsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
  },
  recommendationsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  seasonalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#fd7e14',
  },
  tipsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#6f42c1',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 16,
  },
  
  // Need Items
  needItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  needBullet: {
    fontSize: 16,
    color: '#17a2b8',
    marginRight: 8,
    marginTop: 2,
  },
  needText: {
    fontSize: 15,
    color: '#6c757d',
    flex: 1,
    lineHeight: 22,
  },
  
  // Recommendation Items
  recommendationItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  fertilizerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fertilizerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    flex: 1,
  },
  fertilizerQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffc107',
  },
  fertilizerDetails: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  
  // Season Items
  seasonItem: {
    marginBottom: 12,
  },
  seasonName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 4,
  },
  seasonAdvice: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  
  // Tip Items
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#28a745',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    fontSize: 15,
    color: '#6c757d',
    flex: 1,
    lineHeight: 22,
  },
  
  // Info Section
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  guideCard: {
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
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  guideText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  stageName: {
    fontWeight: '600',
    color: '#2d5c3e',
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  
  // Modal Styles (same as disease detection)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#f0f9f0',
    marginBottom: 12,
  },
  modalOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d5c3e',
  },
  modalCancel: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
});