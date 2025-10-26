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
  Dimensions,
  Platform,
  Linking,
  PermissionsAndroid
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { BASE_URL } from '../../config/config';
const { width } = Dimensions.get('window');

export default function DiseaseDetection({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
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

  const predictDisease = async (imageUri) => {
    try {
      const formData = new FormData();
      
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'plant_image.jpg',
      });

      const response = await axios.post(`${BASE_URL}/api/disease/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });
      
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const prediction = await predictDisease(selectedImage.uri);
      
      const result = {
        disease: prediction.predicted_class || prediction.disease || 'Unknown Disease',
        confidence: Math.round((prediction.confidence || prediction.probability || 0.85) * 100),
        severity: prediction.severity || getSeverityFromConfidence(prediction.confidence || 0.85),
        description: prediction.description || getDescriptionForDisease(prediction.predicted_class || prediction.disease),
        treatment: prediction.treatment || getTreatmentForDisease(prediction.predicted_class || prediction.disease),
        preventionTips: getPreventionTips(prediction.predicted_class || prediction.disease),
        color: getColorForDisease(prediction.predicted_class || prediction.disease),
        icon: getDiseaseIcon(prediction.predicted_class || prediction.disease)
      };
      
      setAnalysisResult(result);
      
    } catch (error) {
      let errorMessage = 'This is not a pepper leaf. Please upload a proper pepper leaf image.';
      
      if (error.response) {
        errorMessage = error.response.data.error || error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. The server may be busy.';
      }
      
      Alert.alert('Analysis Error', errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Enhanced helper functions
  const getSeverityFromConfidence = (confidence) => {
    if (confidence > 0.9) return 'Critical';
    if (confidence > 0.7) return 'Moderate';
    if (confidence > 0.5) return 'Mild';
    return 'Low Risk';
  };

  const getDescriptionForDisease = (disease) => {
    const descriptions = {
      'Pepper Leaf Spot': 'A fungal infection that creates circular, dark spots on leaves, potentially leading to defoliation and reduced fruit quality.',
      'Anthracnose': 'A destructive fungal disease causing dark, sunken lesions on fruits and leaves, often spreading in humid conditions.',
      'Bacterial Leaf Spot': 'Bacterial infection creating water-soaked lesions that turn brown or black, affecting photosynthesis and plant vigor.',
      'Healthy': 'Your pepper plant shows excellent health with vibrant green foliage and no visible disease symptoms.',
      'Powdery Mildew': 'Fungal disease creating white, powdery growth on leaves, reducing photosynthesis and plant energy.',
      'Mosaic Virus': 'Viral infection causing distinctive mottled patterns, stunted growth, and reduced fruit production.'
    };
    return descriptions[disease] || 'Disease detected in plant tissue requiring attention.';
  };

  const getTreatmentForDisease = (disease) => {
    const treatments = {
      'Pepper Leaf Spot': 'Apply copper-based fungicide every 7-10 days. Remove affected leaves and improve air circulation.',
      'Anthracnose': 'Remove infected parts immediately, apply systemic fungicide, and ensure proper drainage.',
      'Bacterial Leaf Spot': 'Use copper bactericide, avoid overhead watering, and remove infected plant material.',
      'Healthy': 'Continue current care routine. Monitor regularly and maintain optimal growing conditions.',
      'Powdery Mildew': 'Apply sulfur-based fungicide or neem oil. Improve air circulation and reduce humidity.',
      'Mosaic Virus': 'Remove infected plants immediately to prevent spread. Control aphid populations as they transmit the virus.'
    };
    return treatments[disease] || 'Consult with local agricultural extension service for specific treatment recommendations.';
  };

  const getPreventionTips = (disease) => {
    const tips = {
      'Pepper Leaf Spot': [
        'Water at soil level to keep leaves dry',
        'Ensure proper plant spacing for air circulation',
        'Apply mulch to prevent soil splash',
        'Rotate crops annually'
      ],
      'Anthracnose': [
        'Maintain proper drainage',
        'Avoid working with wet plants',
        'Clean tools between plants',
        'Remove plant debris regularly'
      ],
      'Bacterial Leaf Spot': [
        'Use drip irrigation instead of sprinklers',
        'Avoid touching wet plants',
        'Plant resistant varieties when possible',
        'Maintain balanced nutrition'
      ],
      'Healthy': [
        'Continue monitoring for early signs',
        'Maintain consistent watering',
        'Ensure adequate nutrition',
        'Keep garden area clean'
      ],
      'Powdery Mildew': [
        'Improve air circulation',
        'Avoid overhead watering',
        'Plant in sunny locations',
        'Monitor humidity levels'
      ],
      'Mosaic Virus': [
        'Control aphid populations',
        'Remove weeds that harbor viruses',
        'Use reflective mulch to deter aphids',
        'Plant virus-resistant varieties'
      ]
    };
    return tips[disease] || ['Monitor plant health regularly', 'Maintain good garden hygiene'];
  };

  const getColorForDisease = (disease) => {
    const colors = {
      'Healthy': '#28a745',
      'Pepper Leaf Spot': '#dc3545',
      'Anthracnose': '#8b0000',
      'Bacterial Leaf Spot': '#ff6b35',
      'Powdery Mildew': '#6f42c1',
      'Mosaic Virus': '#fd7e14'
    };
    return colors[disease] || '#dc3545';
  };

  const getDiseaseIcon = (disease) => {
    const icons = {
      'Healthy': '✅',
      'Pepper Leaf Spot': '🔴',
      'Anthracnose': '⚫',
      'Bacterial Leaf Spot': '🟠',
      'Powdery Mildew': '⚪',
      'Mosaic Virus': '🟡'
    };
    return icons[disease] || '⚠️';
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '#8b0000';
      case 'moderate': return '#dc3545';
      case 'mild': return '#ffc107';
      case 'low risk': return '#28a745';
      default: return '#28a745';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '🚨';
      case 'moderate': return '⚠️';
      case 'mild': return '⚡';
      case 'low risk': return '💚';
      default: return '💚';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disease Detection</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={requestPermissions}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Enhanced Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleIconContainer}>
            <Text style={styles.titleIcon}>🔬</Text>
          </View>
          <Text style={styles.title}>AI Disease Detection</Text>
          <Text style={styles.subtitle}>
            Advanced image analysis to identify pepper plant diseases and provide expert treatment guidance
          </Text>
        </View>

        {/* Enhanced Image Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>📸 Plant Image Analysis</Text>
          
          {!selectedImage ? (
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={handleImagePicker}
              activeOpacity={0.7}
            >
              <View style={styles.uploadIcon}>
                <Text style={styles.uploadIconText}>🌿</Text>
              </View>
              <Text style={styles.uploadTitle}>Capture Plant Image</Text>
              <Text style={styles.uploadSubtitle}>
                Take a clear photo of affected leaves or choose from gallery
              </Text>
              <View style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>📷 Select Image</Text>
              </View>
              
              {/* Upload Tips */}
              <View style={styles.uploadTips}>
                <Text style={styles.uploadTipsTitle}>For best results:</Text>
                <Text style={styles.uploadTip}>• Focus on affected leaves</Text>
                <Text style={styles.uploadTip}>• Use good lighting</Text>
                <Text style={styles.uploadTip}>• Avoid blurry images</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.imageContainer}>
              <View style={styles.imageHeader}>
                <Text style={styles.imageStatus}>✅ Image Selected</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={clearImage}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        {/* Enhanced Analysis Button */}
        {selectedImage && (
          <View style={styles.analysisSection}>
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.disabledButton]}
              onPress={analyzeImage}
              disabled={isAnalyzing}
              activeOpacity={0.8}
            >
              {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loadingText}>🔍 Analyzing Disease...</Text>
                </View>
              ) : (
                <>
                  <Text style={styles.analyzeButtonText}>🔬 Analyze for Diseases</Text>
                  <Text style={styles.analyzeButtonSubtext}>AI-powered detection</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Enhanced Analysis Results */}
        {analysisResult && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>📊 Analysis Results</Text>
            
            {/* Main Disease Detection Card */}
            <View style={[
              styles.resultCard,
              { borderLeftColor: analysisResult.color }
            ]}>
              <View style={styles.resultHeader}>
                <View style={styles.diseaseInfo}>
                  <View style={styles.diseaseNameContainer}>
                    <Text style={styles.diseaseIcon}>{analysisResult.icon}</Text>
                    <Text style={styles.diseaseName}>{analysisResult.disease}</Text>
                  </View>
                 
                </View>
                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidence}>{analysisResult.confidence}%</Text>
                  <Text style={styles.confidenceLabel}>Confidence</Text>
                </View>
              </View>
              
              <View style={styles.confidenceBar}>
                <View 
                  style={[
                    styles.confidenceFill, 
                    { 
                      width: `${analysisResult.confidence}%`,
                      backgroundColor: analysisResult.color 
                    }
                  ]} 
                />
              </View>
              
              <Text style={styles.diseaseDescription}>
                {analysisResult.description}
              </Text>
            </View>

            {/* Treatment Card */}
            <View style={styles.treatmentCard}>
              <Text style={styles.cardTitle}>💊 Treatment Plan</Text>
              <View style={styles.treatmentContent}>
                <Text style={styles.treatmentText}>{analysisResult.treatment}</Text>
              </View>
            </View>

            
            
          </View>
        )}

        {/* Enhanced Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>📚 Disease Guide</Text>
          
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>🔍 Common Pepper Diseases</Text>
            <View style={styles.diseaseGuideList}>
              <View style={styles.diseaseGuideItem}>
                <Text style={styles.diseaseGuideIcon}>🔴</Text>
                <View style={styles.diseaseGuideContent}>
                  <Text style={styles.diseaseGuideName}>Leaf Spot</Text>
                  <Text style={styles.diseaseGuideDesc}>Dark circular spots on leaves</Text>
                </View>
              </View>
              <View style={styles.diseaseGuideItem}>
                <Text style={styles.diseaseGuideIcon}>⚫</Text>
                <View style={styles.diseaseGuideContent}>
                  <Text style={styles.diseaseGuideName}>Anthracnose</Text>
                  <Text style={styles.diseaseGuideDesc}>Sunken lesions on fruits</Text>
                </View>
              </View>
              <View style={styles.diseaseGuideItem}>
                <Text style={styles.diseaseGuideIcon}>🟠</Text>
                <View style={styles.diseaseGuideContent}>
                  <Text style={styles.diseaseGuideName}>Bacterial Spot</Text>
                  <Text style={styles.diseaseGuideDesc}>Water-soaked lesions</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Important Disclaimer</Text>
            <Text style={styles.warningText}>
              AI predictions provide guidance based on visual analysis. For critical decisions, 
              always consult with certified plant pathologists or agricultural extension services. 
              Early detection and proper treatment are key to successful disease management.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Image Options Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Image Source</Text>
              <Text style={styles.modalSubtitle}>Choose how to capture your plant image</Text>
            </View>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={openCamera}
              activeOpacity={0.7}
            >
              <View style={styles.modalOptionIcon}>
                <Text style={styles.modalOptionIconText}>📷</Text>
              </View>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionText}>Take Photo</Text>
                <Text style={styles.modalOptionDesc}>Use camera for live capture</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={openGallery}
              activeOpacity={0.7}
            >
              <View style={styles.modalOptionIcon}>
                <Text style={styles.modalOptionIconText}>🖼️</Text>
              </View>
              <View style={styles.modalOptionContent}>
                <Text style={styles.modalOptionText}>Choose from Gallery</Text>
                <Text style={styles.modalOptionDesc}>Select existing photo</Text>
              </View>
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
  
  // Enhanced Header
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: 16,
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Enhanced Title Section
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  titleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  titleIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2d5c3e',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  
  // Upload Section
  uploadSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 16,
  },
  uploadArea: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#28a745',
    borderStyle: 'dashed',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  uploadIcon: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: '#f0f9f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#e8f5e8',
  },
  uploadIconText: {
    fontSize: 50,
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  uploadButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  uploadTips: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#17a2b8',
  },
  uploadTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  uploadTip: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 4,
  },
  
  // Enhanced Image Container
  imageContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  imageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '600',
  },
  selectedImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  
  // Enhanced Analysis Section
  analysisSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  analyzeButton: {
    backgroundColor: '#28a745',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    shadowOpacity: 0.1,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  analyzeButtonSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Enhanced Results Section
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 20,
  },
  
  // Enhanced Result Card
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderLeftWidth: 6,
  },
  resultHeader: {
    marginBottom: 20,
  },
  diseaseInfo: {
    marginBottom: 16,
  },
  diseaseNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  diseaseIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  diseaseName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d5c3e',
    flex: 1,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  severityIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  severityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  confidenceContainer: {
    alignItems: 'flex-end',
  },
  confidence: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2d5c3e',
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceBar: {
    height: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    marginBottom: 20,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 5,
  },
  diseaseDescription: {
    fontSize: 15,
    color: '#6c757d',
    lineHeight: 24,
    fontWeight: '400',
  },
  
  // Treatment Card
  treatmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 12,
  },
  treatmentContent: {
    backgroundColor: '#fff5f5',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#dc3545',
  },
  treatmentText: {
    fontSize: 15,
    color: '#721c24',
    lineHeight: 22,
    fontWeight: '500',
  },
  
  // Prevention Card
  preventionCard: {
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
  preventionList: {
    gap: 8,
  },
  preventionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  preventionBullet: {
    fontSize: 16,
    color: '#17a2b8',
    marginRight: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  preventionText: {
    fontSize: 15,
    color: '#6c757d',
    flex: 1,
    lineHeight: 22,
  },
  
  // Impact Card
  impactCard: {
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
  impactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  impactItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  impactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  impactLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  impactValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Info Section
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  guideCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#17a2b8',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 16,
  },
  diseaseGuideList: {
    gap: 12,
  },
  diseaseGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
  },
  diseaseGuideIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  diseaseGuideContent: {
    flex: 1,
  },
  diseaseGuideName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 2,
  },
  diseaseGuideDesc: {
    fontSize: 13,
    color: '#6c757d',
  },
  practicesList: {
    gap: 8,
  },
  practiceItem: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    paddingVertical: 4,
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    shadowColor: '#ffc107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
    lineHeight: 20,
  },
  
  // Enhanced Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 12,
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e8f5e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  modalOptionIconText: {
    fontSize: 24,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 2,
  },
  modalOptionDesc: {
    fontSize: 13,
    color: '#6c757d',
  },
  modalCancel: {
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '500',
  },
});