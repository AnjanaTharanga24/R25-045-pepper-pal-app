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

const { width } = Dimensions.get('window');

// Update this to your actual API URL
const BASE_URL = 'http://192.168.8.131:8000';

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

  // Updated gallery function with better error handling
  const openGallery = async () => {
    setShowOptions(false);
    
    try {
      // First try the standard image picker
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

      // If standard picker fails, try document picker as fallback
      await pickDocument();
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to access gallery. Trying alternative method...');
      
      // Try document picker as fallback
      await pickDocument();
    }
  };

  // Document picker fallback method
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      
      if (result.type === 'success') {
        // Verify the file exists
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        if (!fileInfo.exists) {
          throw new Error('Selected file does not exist');
        }
        
        setSelectedImage({ 
          uri: result.uri,
          // Add mock properties to match ImagePicker's asset format
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

  // API call function for disease prediction
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
        color: getColorForDisease(prediction.predicted_class || prediction.disease)
      };
      
      setAnalysisResult(result);
      
    } catch (error) {
      let errorMessage = 'Failed to analyze image. Please try again.';
      
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

  // Helper functions
  const getSeverityFromConfidence = (confidence) => {
    if (confidence > 0.9) return 'High';
    if (confidence > 0.7) return 'Moderate';
    return 'Low';
  };

  const getDescriptionForDisease = (disease) => {
    const descriptions = {
      'Pepper Leaf Spot': 'Fungal infection affecting leaf tissue',
      'Anthracnose': 'Fungal disease causing dark lesions',
      'Bacterial Leaf Spot': 'Bacterial infection causing lesions',
      'Healthy': 'Plant appears healthy with no visible diseases',
      'Powdery Mildew': 'Fungal disease causing white powdery growth',
      'Mosaic Virus': 'Viral infection causing mottled patterns'
    };
    return descriptions[disease] || 'Disease detected in plant tissue';
  };

  const getTreatmentForDisease = (disease) => {
    const treatments = {
      'Pepper Leaf Spot': 'Apply copper-based fungicide',
      'Anthracnose': 'Remove affected parts and apply fungicide',
      'Bacterial Leaf Spot': 'Use copper-based bactericide',
      'Healthy': 'Continue regular care and monitoring',
      'Powdery Mildew': 'Apply sulfur-based fungicide',
      'Mosaic Virus': 'Remove infected plants and control aphids'
    };
    return treatments[disease] || 'Consult with agricultural expert';
  };

  const getColorForDisease = (disease) => {
    const colors = {
      'Healthy': '#28a745',
      'Pepper Leaf Spot': '#ff6b6b',
      'Anthracnose': '#dc3545',
      'Bacterial Leaf Spot': '#ffc107',
      'Powdery Mildew': '#17a2b8',
      'Mosaic Virus': '#6f42c1'
    };
    return colors[disease] || '#dc3545';
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'moderate': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#28a745';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disease Detection</Text>
        <TouchableOpacity onPress={requestPermissions}>
          <Text style={styles.debugButton}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>AI Disease Detection</Text>
          <Text style={styles.subtitle}>
            Upload or capture images of pepper plants to detect diseases
          </Text>
        </View>

        {/* Image Upload Section */}
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Select Image</Text>
          
          {!selectedImage ? (
            <TouchableOpacity
              style={styles.uploadArea}
              onPress={handleImagePicker}
              activeOpacity={0.7}
            >
              <View style={styles.uploadIcon}>
                <Text style={styles.uploadIconText}>📸</Text>
              </View>
              <Text style={styles.uploadTitle}>Add Photo</Text>
              <Text style={styles.uploadSubtitle}>
                Take a photo or choose from gallery
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
                onPress={clearImage}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Analysis Button */}
        {selectedImage && (
          <View style={styles.analysisSection}>
            <TouchableOpacity
              style={[styles.analyzeButton, isAnalyzing && styles.disabledButton]}
              onPress={analyzeImage}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.loadingText}>Analyzing...</Text>
                </View>
              ) : (
                <Text style={styles.analyzeButtonText}>Analyze Image</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Analysis Results</Text>
            
            <View style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={styles.diseaseInfo}>
                  <Text style={styles.diseaseName}>{analysisResult.disease}</Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(analysisResult.severity) }]}>
                    <Text style={styles.severityText}>{analysisResult.severity}</Text>
                  </View>
                </View>
                <Text style={styles.confidence}>{analysisResult.confidence}%</Text>
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
              
              <View style={styles.resultDetails}>
                <Text style={styles.detailTitle}>Description:</Text>
                <Text style={styles.detailText}>{analysisResult.description}</Text>
                
                <Text style={styles.detailTitle}>Treatment:</Text>
                <Text style={styles.detailText}>{analysisResult.treatment}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>How to Get Best Results</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>📷 Photo Tips</Text>
            <Text style={styles.tipText}>
              • Take clear, well-lit photos{'\n'}
              • Focus on affected areas{'\n'}
              • Include leaves, stems, or fruits
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>⚠️ Troubleshooting</Text>
            <Text style={styles.tipText}>
              If gallery isn't working:{'\n'}
              • Try taking a photo first{'\n'}
              • Restart the app{'\n'}
              • Create a development build
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

// Styles remain the same as in your original code
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2d5c3e',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  debugButton: {
    fontSize: 20,
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#28a745',
    borderStyle: 'dashed',
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
    color: '#fff',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
  },
  analysisSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  analyzeButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  diseaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  diseaseName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d5c3e',
    marginRight: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
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
    marginBottom: 20,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  resultDetails: {
    gap: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 15,
    color: '#6c757d',
    lineHeight: 22,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#17a2b8',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
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