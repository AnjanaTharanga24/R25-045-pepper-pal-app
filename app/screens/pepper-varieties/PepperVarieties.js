import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  ScrollView, 
  Alert, 
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { BASE_URL } from '../../config/config';

export default function PepperVarietiesScreen({ navigation }) {
  const [district, setDistrict] = useState('');
  const [dsDivision, setDsDivision] = useState('');
  const [elevation, setElevation] = useState('');
  const [annualRainfall, setAnnualRainfall] = useState('');
  const [avgTemperature, setAvgTemperature] = useState('');
  const [humidity, setHumidity] = useState('');
  const [soilTexture, setSoilTexture] = useState('');
  const [soilQuality, setSoilQuality] = useState('');
  const [drainage, setDrainage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dsDivisions, setDsDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);

  const districtData = {
    Ampara: ["Addalachchenai", "Akkarajpattu", "Alayadiyembu", "Ampara", "Damana", "Dehiattakandiya", "Irakkamam", "Kalmunai", "Karaitivu", "Lahugala", "Mahaoya", "Navithanveli", "Nintavur", "Padiyathalawa", "Sainthamaruthu", "Sammanthurai", "Samanthurai", "Thirukkovli", "Uhana"],
    Anuradhapura: ["Galenbindunuwewa", "Gainewa", "Horovprothana", "Ipalogama", "Kahatagasdigiliya", "Kebithigollewa", "Kekirawa", "Mahavilachchiya", "Medawachchiya", "Mihintale", "Nachchaduwa", "Nuwaragam Palatha C", "Nuwaragam Palatha Ei", "Palagala", "Rambewa", "Rathmalgahawewa", "Thalawa", "Thambuttegama", "Yaya Palatha"],
    Badulla: ["Badulla", "Bandarawela", "Ella", "Hali-Ela", "Haputale", "Kandaketiya", "Lunugala", "Mahiyanganaya", "Meegahakivula", "Passara", "Rideemaliyadda", "Soranatota", "Uva Paranagama", "Weilmada"],
    Batticaloa: ["Batticaloa", "Eravur Pattu", "Kattankudy", "Koralai Pattu", "Koralai Pattu Central", "Koralai Pattu North", "Koralai Pattu South", "Koralai Pattu West", "Mammuai North", "Mammuai Pattu", "Mammuai South", "Mammuai South West", "Mammuai West", "Poratiwu Pattu"],
    Colombo: ["Colombo", "Dehiwala", "Homagama", "Kaduwela", "Kesbewa", "Kolonnawa", "Maharagama", "Moratuwa", "Padukka", "Ratmalana", "Seethawaka", "Sri Jayawardenepura K", "Thimbirigasyaya"],
    Galle: ["Ambalangoda", "Baddegama", "Balapitiya", "Benthota", "Bope-Poddala", "Elpitiya", "Galle", "Gonapinuwala", "Habaraduwa", "Hikkaduwa", "Imaduwa", "Karandeniya", "Nagoda", "Neluwa", "Thawalama", "Welivitiya-Divithura", "Yakkalamulla"],
    Gampaha: ["Attanagalla", "Biyagama", "Divulapitiya", "Dompe", "Gampaha", "Ja-Ela", "Katana", "Kelaniya", "Mahara", "Minuwangoda", "Mirigama", "Negombo", "Wattala"],
    Hambantota: ["Ambalantota", "Angunukolapelessa", "Bellatta", "Hambantota", "Katuwana", "Lunugamvehera", "Okewela", "Sooriyawewa", "Tangalle", "Thissamaharama", "Walasmulla", "Weeraketiya"],
    Jaffna: ["Chavakachcheri", "Delft", "Islands North", "Islands South", "Jaffna", "Karainagar", "Karaveddy", "Kayts", "Kopay", "Nallur", "Point Pedro", "Sandilipay", "Tellippalai", "Uduvil", "Valikamam East", "Valikamam North", "Valikamam South", "Valikamam South Wes", "Valikamam West"],
    Kalutara: ["Agalawatta", "Bandaragama", "Beruwala", "Bulathsinhala", "Dodangoda", "Horana", "Ingiriya", "Kalutara", "Matugama", "Millaniya", "Panadura", "Walallavita"],
    Kandy: ["Akurana", "Dethota", "Doluwa", "Gangawata Korale", "Harispattuwa", "Kundasale", "Medadumbara", "Minipe", "Pathahewaheta", "Pasbage Korale", "Thumpane", "Udapalatha", "Udunuwara", "Udadumbara", "Yatinuwara"],
    Kegalle: ["Aranayaka", "Bulathkohuptiya", "Daraniyagala", "Dehiowita", "Deraniyagala", "Galigamuwa", "Kegalle", "Mawanella", "Rambukkana", "Ruwanwella", "Warakapola", "Yatiyantota"],
    Kilinochchi: ["Karachchi", "Kandavalai", "Pachchilaipalli", "Poonakary"],
    Kurunegala: ["Alawwa", "Ambampola", "Bamunakotuwa", "Ehetuwewa", "Galgamuwa", "Ganewatta", "Giribawa", "Ibbagamuwa", "Kobeigane", "Kuliyapitiya East", "Kuliyapitiya West", "Kurunegala", "Mahawa", "Mallowapitiya", "Maspotha", "Nikaweratiya", "Panduwasnuwara", "Pannala", "Polgahawela", "Polpithigama", "Rasnayakapura", "Rideegama", "Udubaddawa", "Wariyapola", "Weerambugedara"],
    Mannar: ["Madhu", "Mannar", "Manthai West", "Musali", "Nanaddan"],
    Matale: ["Dambulla", "Galewela", "Laggala-Pallegama", "Matale", "Naula", "Rattota", "Ukuwela", "Wilgamuwa", "Yatawatta"],
    Matara: ["Akurassa", "Athuraliya", "Devinuwara", "Dickwella", "Hakmana", "Kamburupitiya", "Kirinda Puhulwella", "Kotapola", "Malimbada", "Matara", "Mulatiyana", "Pasgoda", "Pitabeddara", "Thihagoda", "Weligama", "Welipitiya"],
    Monaragala: ["Badalkumbura", "Bibile", "Buttala", "Kataragama", "Madulla", "Monaragala", "Sevanagala", "Siyambalanduwa", "Thanamalvila", "Wellawaya"],
    Mullaitivu: ["Manthai East", "Maritimepattu", "Oddusuddan", "Puthukkudiyiruppu", "Thunukkai", "Weiloya"],
    NuwaraEliya: ["Ambagamuwa", "Hanguranketha", "Kothmale", "Nuwara Eliya", "Walapane"],
    Polonnaruwa: ["Dimbulagala", "Elahera", "Hingurakgoda", "Lankapura", "Medirigiriya", "Thamankaduwa", "Welikanda"],
    Puttalam: ["Anamaduwa", "Arachchikattuwa", "Chilaw", "Dankotuwa", "Kalpitiya", "Karuwalagaswewa", "Mahakumbukkadawai", "Mundalama", "Nattandiya", "Nawagaththegama", "Pallama", "Puttalam", "Vanathavilluwa", "Wennappuwa"],
    Ratnapura: ["Ayagama", "Balangoda", "Eheliyagoda", "Elapatha", "Embilipitiya", "Godakawela", "Imbulpe", "Kalawana", "Kirielta", "Kolonna", "Kuruwita", "Niwithigala", "Opanayaka", "Pelmadulla", "Ratnapura", "Weligepola"],
    Trincomalee: ["Gomarankadawala", "Kantalai", "Kinniya", "Kuchehaveli", "Morawewa", "Muttur", "Padavi Siripura", "Seruvila", "Thambalagamuwa", "Trincomalee", "Verugal"],
    Vavuniya: ["Vavuniya", "Vavuniya North", "Vavuniya South", "Venkalacheddikulam"]
  };

  const soilTextureOptions = [
    { label: 'Select Soil Texture', value: '' },
    { label: 'Sandy clay loam', value: 'Sandy clay loam' },
    { label: 'Lateritic soils', value: 'Lateritic soils' },
    { label: 'Red loam', value: 'Red loam' },
    { label: 'Loamy', value: 'Loamy' }
  ];

  useEffect(() => {
    const districtsList = Object.keys(districtData).sort();
    setDistricts(districtsList);
  }, []);

  useEffect(() => {
    if (district) {
      const divisions = districtData[district] || [];
      setDsDivisions(divisions);
      setDsDivision('');
    } else {
      setDsDivisions([]);
      setDsDivision('');
    }
  }, [district]);

  useEffect(() => {
    if (soilTexture === 'Sandy clay loam') {
      setSoilQuality('Organic-rich');
      setDrainage('Moderate drainage');
    } else if (soilTexture === 'Lateritic soils') {
      setSoilQuality('Sandy loam');
      setDrainage('Moist');
    } else if (soilTexture === 'Red loam') {
      setSoilQuality('Slightly acidic');
      setDrainage('Good drainage');
    } else if (soilTexture === 'Loamy') {
      setSoilQuality('Well-drained');
      setDrainage('Rich in organic matter');
    } else {
      setSoilQuality('');
      setDrainage('');
    }
  }, [soilTexture]);

  const fetchClimateData = async () => {
    if (!district || !dsDivision) {
      Alert.alert('Missing Information', 'Please select both district and DS division');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/pepper/get-climate-data`, {
        district: district,
        ds_division: dsDivision
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.data.success && response.data.climate_data) {
        const climateData = response.data.climate_data;
        setElevation(climateData['Elevation (m)']?.toString() || '');
        setAnnualRainfall(climateData['Annual Rainfall (mm)']?.toString() || '');
        setAvgTemperature(climateData['Avg Temperature (°C)']?.toString() || '');
        setHumidity(climateData['Humidity (%)']?.toString() || '');
        
        Alert.alert('Success', 'Climate data loaded successfully!');
      } else {
        Alert.alert('Error', response.data.error || 'Failed to fetch climate data');
      }
    } catch (error) {
      console.error('Climate data fetch error:', error);
      Alert.alert('Error', 'Failed to fetch climate data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateInputs = () => {
    const elevationNum = parseFloat(elevation);
    const rainfallNum = parseFloat(annualRainfall);
    const temperatureNum = parseFloat(avgTemperature);
    const humidityNum = parseFloat(humidity);

    if (!elevation || isNaN(elevationNum) || elevationNum < 0 || elevationNum > 3000) {
      Alert.alert('Invalid Input', 'Elevation must be between 0-3000 meters');
      return false;
    }

    if (!annualRainfall || isNaN(rainfallNum) || rainfallNum < 0 || rainfallNum > 5000) {
      Alert.alert('Invalid Input', 'Annual rainfall must be between 0-5000 mm');
      return false;
    }
    
    if (!humidity || isNaN(humidityNum) || humidityNum < 0 || humidityNum > 100) {
      Alert.alert('Invalid Input', 'Humidity must be between 0-100%');
      return false;
    }
    
    if (!avgTemperature || isNaN(temperatureNum) || temperatureNum < 0 || temperatureNum > 50) {
      Alert.alert('Invalid Input', 'Average temperature must be between 0-50°C');
      return false;
    }

    if (!soilTexture) {
      Alert.alert('Missing Information', 'Please select soil texture');
      return false;
    }

    return true;
  };

  const getPepperRecommendation = async (requestData) => {
    try {
      const response = await axios.post(`${BASE_URL}/api/pepper/suggest-pepper`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      if (error.response) {
        throw new Error(error.response.data.error || 'Server error occurred');
      } else if (error.request) {
        throw new Error('Network error. Please check your connection.');
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };

  const onGetRecommendation = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    try {
      const payload = {
        elevation: parseFloat(elevation),
        annual_rainfall: parseFloat(annualRainfall),
        avg_temperature: parseFloat(avgTemperature),
        humidity: parseFloat(humidity),
        soil_texture: soilTexture,
        soil_quality: soilQuality,
        drainage: drainage
      };
      
      const result = await getPepperRecommendation(payload);
      
      if (result.success) {
        Alert.alert(
          'Pepper Variety Recommendation',
          `Recommended Variety: ${result.predicted_variety}\n\nBased on your conditions:\n• Elevation: ${payload.elevation}m\n• Rainfall: ${payload.annual_rainfall}mm\n• Temperature: ${payload.avg_temperature}°C\n• Humidity: ${payload.humidity}%\n• Soil: ${payload.soil_texture}\n• Quality: ${payload.soil_quality}\n• Drainage: ${payload.drainage}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to get recommendation');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getEnvironmentalStatus = () => {
    const elevationNum = parseFloat(elevation) || 0;
    const rainfallNum = parseFloat(annualRainfall) || 0;
    const humidityNum = parseFloat(humidity) || 0;
    const temperatureNum = parseFloat(avgTemperature) || 0;

    let status = [];
    
    if (elevationNum < 300) status.push({ text: 'Low Elevation', color: '#28a745', icon: '🏞️' });
    else if (elevationNum <= 800) status.push({ text: 'Medium Elevation', color: '#ffc107', icon: '⛰️' });
    else status.push({ text: 'High Elevation', color: '#17a2b8', icon: '🏔️' });
    
    if (rainfallNum < 1200) status.push({ text: 'Low Rainfall', color: '#dc3545', icon: '🌵' });
    else if (rainfallNum <= 2500) status.push({ text: 'Good Rainfall', color: '#28a745', icon: '🌧️' });
    else status.push({ text: 'High Rainfall', color: '#ffc107', icon: '⛈️' });
    
    if (humidityNum < 60) status.push({ text: 'Low Humidity', color: '#dc3545', icon: '🏜️' });
    else if (humidityNum <= 85) status.push({ text: 'Good Humidity', color: '#28a745', icon: '💧' });
    else status.push({ text: 'High Humidity', color: '#ffc107', icon: '🌫️' });
    
    if (temperatureNum < 18) status.push({ text: 'Cool', color: '#17a2b8', icon: '❄️' });
    else if (temperatureNum <= 32) status.push({ text: 'Optimal Temp', color: '#28a745', icon: '🌡️' });
    else status.push({ text: 'Hot', color: '#dc3545', icon: '🔥' });

    return status;
  };

  const environmentalStatus = getEnvironmentalStatus();

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.titleSection}>
          <Text style={styles.title}>Pepper Variety Recommendations</Text>
          <Text style={styles.subtitle}>
            Get AI-powered pepper variety suggestions based on your environmental conditions
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.environmentalSection}>
            <Text style={styles.sectionTitle}>Location Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>District</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={district}
                  onValueChange={setDistrict}
                  style={styles.picker}
                  enabled={!isLoading}
                  dropdownIconColor="#2d5c3e"
                >
                  <Picker.Item label="Select District" value="" style={styles.placeholderItem} />
                  {districts.map((districtName) => (
                    <Picker.Item 
                      key={districtName} 
                      label={districtName} 
                      value={districtName}
                      style={styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DS Division</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={dsDivision}
                  onValueChange={setDsDivision}
                  style={styles.picker}
                  enabled={!isLoading && district !== ''}
                  dropdownIconColor="#2d5c3e"
                >
                  <Picker.Item label="Select DS Division" value="" style={styles.placeholderItem} />
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

            <TouchableOpacity
              style={[styles.fetchButton, (!district || !dsDivision || isLoading) && styles.disabledButton]}
              onPress={fetchClimateData}
              disabled={!district || !dsDivision || isLoading}
              activeOpacity={0.8}
            >
              <Text style={styles.fetchButtonText}>Fetch Climate Data</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Environmental Conditions</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Elevation (meters)</Text>
              <TextInput
                style={styles.textInput}
                value={elevation}
                onChangeText={setElevation}
                placeholder="Enter elevation in meters"
                keyboardType="numeric"
                maxLength={4}
                editable={!isLoading}
              />
              <Text style={styles.inputHint}>Typical range: 0-2500m for pepper cultivation</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Annual Rainfall (mm)</Text>
              <TextInput
                style={styles.textInput}
                value={annualRainfall}
                onChangeText={setAnnualRainfall}
                placeholder="Enter annual rainfall"
                keyboardType="numeric"
                maxLength={4}
                editable={!isLoading}
              />
              <Text style={styles.inputHint}>Typical range: 1200-3000mm for pepper cultivation</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Average Temperature (°C)</Text>
              <TextInput
                style={styles.textInput}
                value={avgTemperature}
                onChangeText={setAvgTemperature}
                placeholder="Enter average temperature"
                keyboardType="numeric"
                maxLength={4}
                editable={!isLoading}
              />
              <Text style={styles.inputHint}>Optimal range: 20-30°C for pepper cultivation</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Humidity (%)</Text>
              <TextInput
                style={styles.textInput}
                value={humidity}
                onChangeText={setHumidity}
                placeholder="Enter humidity percentage"
                keyboardType="numeric"
                maxLength={3}
                editable={!isLoading}
              />
              <Text style={styles.inputHint}>Optimal range: 70-85% for pepper growth</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Soil Texture</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={soilTexture}
                  onValueChange={setSoilTexture}
                  style={styles.picker}
                  enabled={!isLoading}
                  dropdownIconColor="#2d5c3e"
                >
                  {soilTextureOptions.map((option) => (
                    <Picker.Item 
                      key={option.value} 
                      label={option.label} 
                      value={option.value}
                      style={option.value === '' ? styles.placeholderItem : styles.pickerItem}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Soil Quality</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={soilQuality}
                  onValueChange={setSoilQuality}
                  style={styles.picker}
                  enabled={false}
                  dropdownIconColor="#2d5c3e"
                >
                  <Picker.Item label={soilQuality || "Auto-selected based on soil texture"} value={soilQuality} style={styles.pickerItem} />
                </Picker>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Drainage</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={drainage}
                  onValueChange={setDrainage}
                  style={styles.picker}
                  enabled={false}
                  dropdownIconColor="#2d5c3e"
                >
                  <Picker.Item label={drainage || "Auto-selected based on soil texture"} value={drainage} style={styles.pickerItem} />
                </Picker>
              </View>
            </View>
          </View>

          {(elevation || annualRainfall || avgTemperature || humidity) && (
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

          <TouchableOpacity
            style={[styles.recommendButton, isLoading && styles.disabledButton]}
            onPress={onGetRecommendation}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#ffffff" />
                <Text style={[styles.recommendButtonText, { marginLeft: 8 }]}>
                  Analyzing Conditions...
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.recommendButtonText}>
                  Get AI Variety Recommendations
                </Text>
                <Text style={styles.buttonIcon}>🤖</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.infoIcon}>🤖</Text>
              <Text style={styles.infoTitle}>AI-Powered Recommendations</Text>
            </View>
            <Text style={styles.infoDescription}>
              Our system analyzes your specific environmental conditions including 
              elevation, rainfall, temperature, humidity, and soil properties to 
              recommend the most suitable pepper varieties for your location.
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
      </ScrollView>
    </SafeAreaView>
  );
}

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
  content: {
    flex: 1,
  },
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
  formContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
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
  environmentalSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 16,
  },
  fetchButton: {
    backgroundColor: '#17a2b8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#17a2b8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  fetchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
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
});