import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function PepperVarietiesScreen({ navigation }) {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedDSDivision, setSelectedDSDivision] = useState('');
  const [rainfall, setRainfall] = useState('');
  const [humidity, setHumidity] = useState('');
  const [temperature, setTemperature] = useState('');
  const [soilType, setSoilType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Districts and DS Divisions data
  const districtData = {
    'Ampara': ['Addalachchenai', 'Akkarajpattu', 'Alayadivembu', 'Ampara', 'Damana', 'Dehiattakandiya', 'Irakkamam', 'Kalmunai', 'Karaitivu', 'Lahugala', 'Mahaoya', 'Navithanveli', 'Nintavur', 'Padiyathalawa', 'Sainthamaruthu', 'Sammanthurai', 'Thirukkovil', 'Uhana'],
    'Anuradhapura': ['Galenbindunuwewa', 'Ganewewa', 'Horowpothana', 'Ipalogama', 'Kahatagasdigiliya', 'Kebithigollewa', 'Kekirawa', 'Mahavilachchiya', 'Medawachchiya', 'Mihintale', 'Nachchaduwa', 'Nuwaragam Palatha Central', 'Nuwaragam Palatha East', 'Palagala', 'Rambewa', 'Rathmalgahawewa', 'Thalawa', 'Thambuttegama', 'Yaya Palatha'],
    'Badulla': ['Badulla', 'Bandarawela', 'Ella', 'Hali-Ela', 'Haputale', 'Kandaketiya', 'Lunugala', 'Mahiyanganaya', 'Meegahakivula', 'Passara', 'Rideemaliyadda', 'Soranatota', 'Uva Paranagama', 'Welimada'],
    'Batticaloa': ['Batticaloa', 'Eravur Pattu', 'Kattankudy', 'Koralai Pattu', 'Koralai Pattu Central', 'Koralai Pattu North', 'Koralai Pattu South', 'Koralai Pattu West', 'Mamunai North', 'Mamunai Pattu', 'Mamunai South', 'Mamunai South West', 'Mamunai West', 'Porativu Pattu'],
    'Colombo': ['Colombo', 'Dehiwala', 'Homagama', 'Kaduwela', 'Kesbewa', 'Kolonnawa', 'Maharagama', 'Moratuwa', 'Padukka', 'Ratmalana', 'Seethawaka', 'Sri Jayawardenepura Kotte', 'Thimbirigasyaya'],
    'Galle': ['Ambalangoda', 'Baddegama', 'Balapitiya', 'Benthota', 'Bope-Poddala', 'Elpitiya', 'Galle', 'Gonapinuwala', 'Habaraduwa', 'Hikkaduwa', 'Imaduwa', 'Karandeniya', 'Nagoda', 'Neluwa', 'Thawalama', 'Welivitiya-Divithura', 'Yakkalamulla'],
    'Gampaha': ['Attanagalla', 'Biyagama', 'Divulapitiya', 'Dompe', 'Gampaha', 'Ja-Ela', 'Katana', 'Kelaniya', 'Mahara', 'Minuwangoda', 'Mirigama', 'Negombo', 'Wattala'],
    'Hambantota': ['Ambalantota', 'Angunukolapelessa', 'Bellatta', 'Hambantota', 'Katuwana', 'Lunugamvehera', 'Okewela', 'Sooriyawewa', 'Tangalle', 'Thissamaharama', 'Walasmulla', 'Weeraketiya'],
    'Jaffna': ['Chavakachcheri', 'Delft', 'Islands North', 'Islands South', 'Jaffna', 'Karainagar', 'Karaveddy', 'Kayts', 'Kopay', 'Nallur', 'Point Pedro', 'Sandilipay', 'Tellippalai', 'Uduvil', 'Valikamam East', 'Valikamam North', 'Valikamam South', 'Valikamam South West', 'Valikamam West'],
    'Kalutara': ['Agalawatta', 'Bandaragama', 'Beruwala', 'Bulathsinhala', 'Dodangoda', 'Horana', 'Ingiriya', 'Kalutara', 'Matugama', 'Millaniya', 'Panadura', 'Walallavita'],
    'Kandy': ['Akurana', 'Delthota', 'Doluwa', 'Gangawata Korale', 'Harispattuwa', 'Kundasale', 'Medadumbara', 'Minipe', 'Pathahewaheta', 'Pasbage Korale', 'Thumpane', 'Udapalatha', 'Udunuwara', 'Udadumbara', 'Yatinuwara'],
    'Kegalle': ['Aranayaka', 'Bulathkohupitiya', 'Daraniyagala', 'Dehiowita', 'Deraniyagala', 'Galigamuwa', 'Kegalle', 'Mawanella', 'Rambukkana', 'Ruwanwella', 'Warakapola', 'Yatiyantota'],
    'Kilinochchi': ['Karachchi', 'Kandavalai', 'Pachchilaipalli', 'Poonakary'],
    'Kurunegala': ['Alawwa', 'Ambampola', 'Bamunakotuwa', 'Ehetuwewa', 'Galgamuwa', 'Ganewatta', 'Giribawa', 'Ibbagamuwa', 'Kobeigane', 'Kuliyapitiya East', 'Kuliyapitiya West', 'Kurunegala', 'Mahawa', 'Mallawapitiya', 'Maspotha', 'Nikaweratiya', 'Panduwasnuwara', 'Pannala', 'Polgahawela', 'Polpithigama', 'Rasnayakapura', 'Rideegama', 'Udubaddawa', 'Wariyapola', 'Weerambugedara'],
    'Mannar': ['Madhu', 'Mannar', 'Manthai West', 'Musali', 'Nanaddan'],
    'Matale': ['Dambulla', 'Galewela', 'Laggala-Pallegama', 'Matale', 'Naula', 'Rattota', 'Ukuwela', 'Wilgamuwa', 'Yatawatta'],
    'Matara': ['Akurassa', 'Athuraliya', 'Devinuwara', 'Dickwella', 'Hakmana', 'Kamburupitiya', 'Kirinda Puhulwella', 'Kotapola', 'Malimbada', 'Matara', 'Mulatiyana', 'Pasgoda', 'Pitabeddara', 'Thihagoda', 'Weligama', 'Welipitiya'],
    'Monaragala': ['Badalkumbura', 'Bibile', 'Buttala', 'Kataragama', 'Madulla', 'Monaragala', 'Sevanagala', 'Siyambalanduwa', 'Thanamalvila', 'Wellawaya'],
    'Mullaitivu': ['Manthai East', 'Maritimepattu', 'Oddusuddan', 'Puthukkudiyiruppu', 'Thunukkai', 'Welioya'],
    'Nuwara Eliya': ['Ambagamuwa', 'Hanguranketha', 'Kothmale', 'Nuwara Eliya', 'Walapane'],
    'Polonnaruwa': ['Dimbulagala', 'Elahera', 'Hingurakgoda', 'Lankapura', 'Medirigiriya', 'Thamankaduwa', 'Welikanda'],
    'Puttalam': ['Anamaduwa', 'Arachchikattuwa', 'Chilaw', 'Dankotuwa', 'Kalpitiya', 'Karuwalagaswewa', 'Mahakumbukkadawala', 'Mundalama', 'Nattandiya', 'Nawagattegama', 'Pallama', 'Puttalam', 'Vanathavilluwa', 'Wennappuwa'],
    'Ratnapura': ['Ayagama', 'Balangoda', 'Eheliyagoda', 'Elapatha', 'Embilipitiya', 'Godakawela', 'Imbulpe', 'Kalawana', 'Kiriella', 'Kolonna', 'Kuruwita', 'Nivithigala', 'Opanayaka', 'Pelmadulla', 'Ratnapura', 'Weligepola'],
    'Trincomalee': ['Gomarankadawala', 'Kantalai', 'Kinniya', 'Kuchehaveli', 'Morawewa', 'Muttur', 'Padavi Siripura', 'Seruvila', 'Thambalagamuwa', 'Trincomalee', 'Verugal'],
    'Vavuniya': ['Vavuniya', 'Vavuniya North', 'Vavuniya South', 'Venkalacheddikulam']
  };

  const districts = Object.keys(districtData);
  const dsDivisions = selectedDistrict ? districtData[selectedDistrict] : [];

  const soilTypes = [
    { label: 'Sandy clay loam', value: 'Sandy clay loam' },
    { label: 'Red loam', value: 'Red loam' },
    { label: 'Lateritic soils', value: 'Lateritic soils' },
    { label: 'Loamy soil', value: 'Loamy soil' }
  ];

  const handleDistrictChange = (district) => {
    setSelectedDistrict(district);
    setSelectedDSDivision(''); // Reset DS division when district changes
  };

  const validateInputs = () => {
    if (!selectedDistrict) {
      Alert.alert('Missing Information', 'Please select a district');
      return false;
    }
    if (!selectedDSDivision) {
      Alert.alert('Missing Information', 'Please select a DS division');
      return false;
    }
    if (!soilType) {
      Alert.alert('Missing Information', 'Please select a soil type');
      return false;
    }

    const rainfallNum = parseFloat(rainfall);
    const humidityNum = parseFloat(humidity);
    const temperatureNum = parseFloat(temperature);

    if (!rainfall || isNaN(rainfallNum) || rainfallNum < 0 || rainfallNum > 5000) {
      Alert.alert('Invalid Input', 'Rainfall must be between 0-5000 mm');
      return false;
    }
    
    if (!humidity || isNaN(humidityNum) || humidityNum < 0 || humidityNum > 100) {
      Alert.alert('Invalid Input', 'Humidity must be between 0-100%');
      return false;
    }
    
    if (!temperature || isNaN(temperatureNum) || temperatureNum < 0 || temperatureNum > 50) {
      Alert.alert('Invalid Input', 'Temperature must be between 0-50°C');
      return false;
    }

    return true;
  };

  const onGetRecommendation = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      const payload = {
        district: selectedDistrict,
        ds_division: selectedDSDivision,
        rainfall: parseFloat(rainfall),
        humidity: parseFloat(humidity),
        temperature: parseFloat(temperature),
        soil_type: soilType
      };
      
      console.log('Pepper varieties recommendation payload:', payload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock recommendation based on inputs
      const recommendations = getRecommendation(payload);
      
      Alert.alert(
        'Pepper Variety Recommendations',
        recommendations,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendation = (data) => {
    const { rainfall: rain, humidity: hum, temperature: temp, soil_type: soil } = data;
    
    let recommendations = [];
    
    // Logic for different pepper varieties based on conditions
    if (temp >= 20 && temp <= 30 && rain >= 1500 && rain <= 2500 && hum >= 70) {
      if (soil === 'Red loam' || soil === 'Loamy soil') {
        recommendations.push('🌶️ Panniyur-1: Excellent for your conditions\n• High yield variety\n• Disease resistant\n• Premium quality');
      }
    }
    
    if (temp >= 18 && temp <= 28 && rain >= 1200 && rain <= 2000) {
      if (soil === 'Sandy clay loam' || soil === 'Lateritic soils') {
        recommendations.push('🌶️ Subhakya: Good adaptation\n• Moderate yield\n• Suitable for your soil\n• Good market demand');
      }
    }
    
    if (temp >= 22 && temp <= 32 && hum >= 65) {
      recommendations.push('🌶️ Kottanadan: Traditional variety\n• Well adapted to local conditions\n• Strong flavor profile\n• Good for spice trade');
    }
    
    if (rain >= 2000 && hum >= 75) {
      recommendations.push('🌶️ Karimunda: High rainfall variety\n• Thrives in humid conditions\n• Compact growth\n• Good for intercropping');
    }
    
    // Fallback recommendations
    if (recommendations.length === 0) {
      recommendations.push('🌶️ Local varieties recommended\n• Consult local agricultural officers\n• Consider climate-adapted varieties\n• Focus on soil improvement');
    }
    
    // Add general tips
    recommendations.push('\n💡 General Tips:\n• Ensure proper drainage\n• Regular pruning recommended\n• Monitor for pests and diseases\n• Consider organic fertilizers');
    
    return recommendations.join('\n\n');
  };

  const getEnvironmentalStatus = () => {
    const rainfallNum = parseFloat(rainfall) || 0;
    const humidityNum = parseFloat(humidity) || 0;
    const temperatureNum = parseFloat(temperature) || 0;

    let status = [];
    
    // Rainfall status
    if (rainfallNum < 1200) status.push({ text: 'Low Rainfall', color: '#dc3545', icon: '🌵' });
    else if (rainfallNum <= 2500) status.push({ text: 'Good Rainfall', color: '#28a745', icon: '🌧️' });
    else status.push({ text: 'High Rainfall', color: '#ffc107', icon: '⛈️' });
    
    // Humidity status
    if (humidityNum < 60) status.push({ text: 'Low Humidity', color: '#dc3545', icon: '🏜️' });
    else if (humidityNum <= 85) status.push({ text: 'Good Humidity', color: '#28a745', icon: '💧' });
    else status.push({ text: 'High Humidity', color: '#ffc107', icon: '🌫️' });
    
    // Temperature status
    if (temperatureNum < 18) status.push({ text: 'Cool', color: '#17a2b8', icon: '❄️' });
    else if (temperatureNum <= 32) status.push({ text: 'Optimal Temp', color: '#28a745', icon: '🌡️' });
    else status.push({ text: 'Hot', color: '#dc3545', icon: '🔥' });

    return status;
  };

  const environmentalStatus = getEnvironmentalStatus();

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
        <Text style={styles.headerTitle}>Pepper Varieties</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Pepper Variety Recommendations</Text>
          <Text style={styles.subtitle}>
            Get personalized pepper variety suggestions based on your location and conditions
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formContainer}>
          {/* District Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>District</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedDistrict}
                onValueChange={handleDistrictChange}
                style={styles.picker}
              >
                <Picker.Item label="Select District" value="" style={styles.placeholderItem} />
                {districts.map((district) => (
                  <Picker.Item 
                    key={district} 
                    label={district} 
                    value={district}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* DS Division Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>DS Division</Text>
            <View style={[styles.pickerContainer, !selectedDistrict && styles.disabledPicker]}>
              <Picker
                selectedValue={selectedDSDivision}
                onValueChange={setSelectedDSDivision}
                style={styles.picker}
                enabled={!!selectedDistrict}
              >
                <Picker.Item 
                  label={selectedDistrict ? "Select DS Division" : "Select District First"} 
                  value="" 
                  style={styles.placeholderItem} 
                />
                {dsDivisions.map((division) => (
                  <Picker.Item 
                    key={division} 
                    label={division} 
                    value={division}
                    style={styles.pickerItem}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Environmental Inputs */}
          <View style={styles.environmentalSection}>
            <Text style={styles.sectionTitle}>Environmental Conditions</Text>
            
            {/* Rainfall Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Annual Rainfall (mm)</Text>
              <TextInput
                style={styles.textInput}
                value={rainfall}
                onChangeText={setRainfall}
                placeholder="Enter annual rainfall"
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.inputHint}>Typical range: 1200-3000mm for pepper cultivation</Text>
            </View>

            {/* Humidity Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Average Humidity (%)</Text>
              <TextInput
                style={styles.textInput}
                value={humidity}
                onChangeText={setHumidity}
                placeholder="Enter humidity percentage"
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.inputHint}>Optimal range: 70-85% for pepper growth</Text>
            </View>

            {/* Temperature Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Average Temperature (°C)</Text>
              <TextInput
                style={styles.textInput}
                value={temperature}
                onChangeText={setTemperature}
                placeholder="Enter average temperature"
                keyboardType="numeric"
                maxLength={4}
              />
              <Text style={styles.inputHint}>Optimal range: 20-30°C for pepper cultivation</Text>
            </View>

            {/* Soil Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Soil Type</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={soilType}
                  onValueChange={setSoilType}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Soil Type" value="" style={styles.placeholderItem} />
                  {soilTypes.map((soil) => (
                    <Picker.Item 
                      key={soil.value} 
                      label={soil.label} 
                      value={soil.value}
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Environmental Status Display */}
          {(rainfall || humidity || temperature) && (
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>Current Conditions</Text>
              <View style={styles.statusGrid}>
                {environmentalStatus.map((status, index) => (
                  <View key={index} style={[styles.statusCard, { borderLeftColor: status.color }]}>
                    <Text style={styles.statusIcon}>{status.icon}</Text>
                    <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Get Recommendation Button */}
          <TouchableOpacity
            style={[styles.recommendButton, isLoading && styles.disabledButton]}
            onPress={onGetRecommendation}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.recommendButtonText}>
              {isLoading ? 'Analyzing Conditions...' : 'Get Variety Recommendations'}
            </Text>
            {!isLoading && <Text style={styles.buttonIcon}>🌶️</Text>}
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About Pepper Varieties</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>🌱</Text>
              <Text style={styles.infoTitle}>Popular Varieties</Text>
            </View>
            <Text style={styles.infoDescription}>
              • Panniyur-1: High yielding, disease resistant{'\n'}
              • Subhakya: Good for commercial cultivation{'\n'}
              • Kottanadan: Traditional variety with strong flavor{'\n'}
              • Karimunda: Suitable for high rainfall areas
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>🌍</Text>
              <Text style={styles.infoTitle}>Growing Conditions</Text>
            </View>
            <Text style={styles.infoDescription}>
              Pepper thrives in tropical conditions with consistent rainfall, 
              high humidity, and well-drained soils. Proper variety selection 
              based on local conditions is crucial for successful cultivation.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>💰</Text>
              <Text style={styles.infoTitle}>Economic Benefits</Text>
            </View>
            <Text style={styles.infoDescription}>
              Choosing the right variety can significantly improve yield, 
              quality, and market value. Consider local market demand and 
              processing requirements when selecting varieties.
            </Text>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🎯 Selection Tips</Text>
            <Text style={styles.tipText}>
              • Match variety to your specific climate conditions{'\n'}
              • Consider disease resistance in your area{'\n'}
              • Evaluate market demand for different varieties{'\n'}
              • Consult local agricultural extension officers{'\n'}
              • Start with small trial plots before scaling up
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
  },
  
  // Title Section
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
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
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#28a745',
    padding: 16,
    fontSize: 16,
    color: '#2d5c3e',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  inputHint: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 6,
    fontStyle: 'italic',
  },
  
  // Picker
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#28a745',
    overflow: 'hidden',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledPicker: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
  },
  picker: {
    height: 50,
    backgroundColor: '#ffffff',
  },
  pickerItem: {
    fontSize: 16,
    color: '#2d5c3e',
  },
  placeholderItem: {
    fontSize: 16,
    color: '#6c757d',
  },
  
  // Environmental Section
  environmentalSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 16,
  },
  
  // Status Section
  statusSection: {
    marginTop: 16,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    alignItems: 'center',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Recommend Button
  recommendButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    shadowOpacity: 0.1,
  },
  recommendButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 18,
  },
  
  // Information Section
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d5c3e',
  },
  infoDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  
  // Tips Section
  tipsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  tipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ffa500',
    shadowColor: '#2d5c3e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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

});
