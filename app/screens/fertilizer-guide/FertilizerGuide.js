import React, { useState, useEffect } from 'react';
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
  Platform,
  Linking,
  PermissionsAndroid,
  Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';

const { width } = Dimensions.get('window');
import { BASE_URL } from '../../config/config';

export default function FertilizerGuide({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [plantAge, setPlantAge] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState({
    camera: null,
    mediaLibrary: null,
    storage: null
  });

  useEffect(() => {
    requestPermissions();
  }, []);

  // Permission handling (same as disease detection)
  const requestAndroidPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const androidVersion = Platform.Version;
      console.log('Android Version:', androidVersion);

      if (androidVersion >= 33) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        console.log('Android 13+ permissions:', granted);
        
        return (
          granted[PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else if (androidVersion >= 23) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.CAMERA,
        ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        console.log('Android 6-12 permissions:', granted);
        
        return (
          granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED
        );
      }

      return true;
    } catch (error) {
      console.error('Android permission error:', error);
      return false;
    }
  };

  const requestPermissions = async () => {
    try {
      const androidPermissionGranted = await requestAndroidPermissions();
      
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const mediaLibraryStatus = await MediaLibrary.requestPermissionsAsync();
      
      const status = {
        camera: cameraStatus.status,
        mediaLibrary: mediaStatus.status,
        storage: androidPermissionGranted ? 'granted' : 'denied'
      };
      
      setPermissionStatus(status);
      
      if (status.camera !== 'granted' || status.mediaLibrary !== 'granted' || !androidPermissionGranted) {
        Alert.alert(
          'Permissions Required',
          'This app needs camera and gallery permissions to function properly.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() }
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const handleImagePicker = () => {
    setShowOptions(true);
  };

  const openCamera = async () => {
    setShowOptions(false);
    
    try {
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      
      if (status !== 'granted') {
        const { status: newStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (newStatus !== 'granted') {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
          return;
        }
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
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openGallery = async () => {
    setShowOptions(false);
    
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
        aspect: [4, 3],
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets?.[0]) {
        setSelectedImage(result.assets[0]);
        setAnalysisResult(null);
        return;
      }

      await pickDocument();
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to access gallery. Trying alternative method...');
      await pickDocument();
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success') {
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        if (!fileInfo.exists) {
          throw new Error('Selected file does not exist');
        }
        
        setSelectedImage({ 
          uri: result.uri,
          width: 0,
          height: 0,
          fileName: result.name || 'selected_image.jpg'
        });
        setAnalysisResult(null);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try another method.');
    }
  };

  // API call function for deficiency prediction
  const predictDeficiency = async (imageUri, age) => {
    try {
      const formData = new FormData();
      
      // Append image file
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'plant_image.jpg',
      });

      // Append age parameter
      formData.append('age', age.toString());

      console.log('Sending API request to:', `${BASE_URL}/api/deficiency/predict`);
      console.log('Age:', age);

      const response = await axios.post(`${BASE_URL}/api/deficiency/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      console.log('API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (error.response) {
        console.error('Error Response:', error.response.data);
      }
      throw error;
    }
  };

  const analyzeRequirements = async () => {
    if (!selectedImage) {
      Alert.alert('Missing Image', 'Please select an image of your pepper plant.');
      return;
    }

    if (!plantAge || isNaN(plantAge) || parseFloat(plantAge) < 0) {
      Alert.alert('Invalid Age', 'Please enter a valid plant age in years (0 or greater).');
      return;
    }

    const age = parseFloat(plantAge);
    if (age > 50) {
      Alert.alert('Invalid Age', 'Plant age must be 50 years or less.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const prediction = await predictDeficiency(selectedImage.uri, age);
      
      if (prediction.status === 'success' && prediction.data) {
        const result = {
          predicted_class: prediction.data.predicted_class,
          confidence: prediction.data.confidence,
          confidence_percentage: prediction.data.confidence_percentage,
          fertilizers: prediction.data.fertilizers || [],
          recommendation_count: prediction.data.recommendation_count || 0,
          message: prediction.data.message || null,
          age: age,
          stage: getPlantStage(age)
        };
        
        setAnalysisResult(result);
      } else {
        throw new Error('Invalid response format');
      }
      
    } catch (error) {
      let errorMessage = 'Failed to analyze deficiency. Please try again.';
      
      if (error.response) {
        const responseData = error.response.data;
        errorMessage = responseData.error || responseData.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and ensure the server is running.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. The server may be busy.';
      }
      
      Alert.alert('Analysis Error', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper functions
  const getPlantStage = (age) => {
    if (age < 1) return 'Seedling';
    if (age < 3) return 'Young Plant';
    if (age < 7) return 'Mature Plant';
    return 'Established Plant';
  };

  const getDeficiencyColor = (deficiency) => {
    const colors = {
      'Heathly': '#28a745',
      'Calcium': '#dc3545',
      'Potasium': '#ffc107',
      'Magnesium': '#17a2b8'
    };
    return colors[deficiency] || '#6c757d';
  };

  const getDeficiencyDescription = (deficiency) => {
    const descriptions = {
      'Heathly': 'Your plant appears healthy with no nutrient deficiencies detected.',
      'Calcium': 'Calcium deficiency can cause blossom end rot and poor fruit development.',
      'Potasium': 'Potassium deficiency affects fruit quality and plant disease resistance.',
      'Magnesium': 'Magnesium deficiency causes yellowing between leaf veins (chlorosis).'
    };
    return descriptions[deficiency] || 'Nutrient deficiency detected.';
  };

  const clearData = () => {
    setSelectedImage(null);
    setPlantAge('');
    setAnalysisResult(null);
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
              Enter the approximate age of your pepper plant (0-50 years)
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
                  <Text style={styles.loadingText}>Analyzing Deficiencies...</Text>
                </View>
              ) : (
                <Text style={styles.analyzeButtonText}>🌱 Analyze Nutrient Needs</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Analysis Results</Text>
            
            {/* Deficiency Detection Card */}
            <View style={styles.deficiencyCard}>
              <View style={styles.deficiencyHeader}>
                <View style={styles.deficiencyInfo}>
                  <Text style={styles.deficiencyName}>{analysisResult.predicted_class}</Text>
                  <View style={[
                    styles.deficiencyBadge, 
                    { backgroundColor: getDeficiencyColor(analysisResult.predicted_class) }
                  ]}>
                    <Text style={styles.deficiencyBadgeText}>
                      {analysisResult.predicted_class === 'Heathly' ? 'Healthy' : 'Deficient'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.confidence}>{analysisResult.confidence_percentage}%</Text>
              </View>
              
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill, 
                    { 
                      width: `${analysisResult.confidence_percentage}%`,
                      backgroundColor: getDeficiencyColor(analysisResult.predicted_class)
                    }
                  ]} 
                />
              </View>
              
              <View style={styles.plantStageInfo}>
                <Text style={styles.plantStageLabel}>Plant Stage:</Text>
                <Text style={styles.plantStageValue}>{analysisResult.stage}</Text>
                <Text style={styles.plantAgeValue}>({analysisResult.age} years old)</Text>
              </View>
              
              <Text style={styles.deficiencyDescription}>
                {getDeficiencyDescription(analysisResult.predicted_class)}
              </Text>
            </View>

            {/* Fertilizer Recommendations */}
            {analysisResult.fertilizers && analysisResult.fertilizers.length > 0 ? (
              <View style={styles.recommendationsCard}>
                <Text style={styles.cardTitle}>🌿 Fertilizer Recommendations</Text>
                <Text style={styles.recommendationCount}>
                  {analysisResult.recommendation_count} recommendation(s) for your {analysisResult.stage.toLowerCase()}
                </Text>
                
                {analysisResult.fertilizers.map((fertilizer, index) => (
                  <View key={index} style={styles.fertilizerItem}>
                    <View style={styles.fertilizerHeader}>
                      <Text style={styles.fertilizerName}>{fertilizer.fertilizer}</Text>
                      <View style={[
                        styles.fertilizerTypeBadge,
                        { backgroundColor: fertilizer.type === 'Chemical' ? '#dc3545' : '#28a745' }
                      ]}>
                        <Text style={styles.fertilizerTypeText}>{fertilizer.type}</Text>
                      </View>
                    </View>
                    <Text style={styles.fertilizerDose}>
                      <Text style={styles.doseLabel}>Dose: </Text>
                      {fertilizer.dose}
                    </Text>
                  </View>
                ))}
              </View>
            ) : analysisResult.message ? (
              <View style={styles.healthyCard}>
                <Text style={styles.cardTitle}>✅ Plant Status</Text>
                <Text style={styles.healthyMessage}>{analysisResult.message}</Text>
                <Text style={styles.healthyAdvice}>
                  Continue with regular care and monitoring. Consider periodic soil testing to maintain optimal nutrient levels.
                </Text>
              </View>
            ) : null}

            {/* General Care Tips based on Age */}
            <View style={styles.careTipsCard}>
              <Text style={styles.cardTitle}>💡 Age-Based Care Tips</Text>
              {getCareTipsForAge(analysisResult.age).map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Nutrient Deficiency Guide</Text>
          
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>🔍 Common Deficiencies</Text>
            <Text style={styles.guideText}>
              <Text style={styles.deficiencyType}>Calcium:</Text> Causes blossom end rot, stunted growth{'\n'}
              <Text style={styles.deficiencyType}>Potassium:</Text> Yellow leaf edges, weak stems{'\n'}
              <Text style={styles.deficiencyType}>Magnesium:</Text> Yellowing between leaf veins{'\n'}
            </Text>
          </View>

          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>📏 Application Guidelines</Text>
            <Text style={styles.guideText}>
              • Apply fertilizer to moist soil{'\n'}
              • Keep 6 inches away from plant stem{'\n'}
              • Water thoroughly after application{'\n'}
              • Monitor plant response weekly{'\n'}
              • Adjust based on weather conditions
            </Text>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Important Notes</Text>
            <Text style={styles.warningText}>
              AI predictions are estimates based on visual analysis. For accurate diagnosis, 
              consider soil testing and consultation with agricultural experts. Over-fertilization 
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

// Helper function to get care tips based on age
const getCareTipsForAge = (age) => {
  if (age < 1) {
    return [
      'Focus on establishing strong root system',
      'Use diluted fertilizers to avoid burning young roots',
      'Ensure consistent moisture but avoid waterlogging',
      'Provide protection from extreme weather'
    ];
  } else if (age < 3) {
    return [
      'Increase fertilizer strength gradually',
      'Focus on balanced NPK nutrition',
      'Start training plant structure',
      'Monitor for early pest and disease signs'
    ];
  } else if (age < 7) {
    return [
      'Optimize nutrition for fruit production',
      'Increase potassium during flowering and fruiting',
      'Maintain consistent watering schedule',
      'Prune for better air circulation'
    ];
  } else {
    return [
      'Reduce fertilizer frequency for mature plants',
      'Focus on soil health and organic matter',
      'Monitor for age-related stress signs',
      'Consider rejuvenation pruning if needed'
    ];
  }
};

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
  
  // Upload Area
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
  
  // Deficiency Card
  deficiencyCard: {
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
  deficiencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deficiencyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deficiencyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d5c3e',
    marginRight: 12,
  },
  deficiencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deficiencyBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  confidence: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d5c3e',
  },
  confidenceBar: {
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  plantStageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  plantStageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6c757d',
    marginRight: 8,
  },
  plantStageValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5c3e',
    marginRight: 8,
  },
  plantAgeValue: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  deficiencyDescription: {
    fontSize: 15,
    color: '#6c757d',
    lineHeight: 22,
  },
  
  // Recommendations Card
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  recommendationCount: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  fertilizerItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  fertilizerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  fertilizerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d5c3e',
    flex: 1,
    marginRight: 12,
    lineHeight: 20,
  },
  fertilizerTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fertilizerTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
  },
  fertilizerDose: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  doseLabel: {
    fontWeight: '600',
    color: '#2d5c3e',
  },
  
  // Healthy Card
  healthyCard: {
    backgroundColor: '#d4edda',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  healthyMessage: {
    fontSize: 16,
    color: '#155724',
    fontWeight: '600',
    marginBottom: 12,
  },
  healthyAdvice: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  
  // Care Tips Card
  careTipsCard: {
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
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#17a2b8',
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
  deficiencyType: {
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
  
  // Modal Styles
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