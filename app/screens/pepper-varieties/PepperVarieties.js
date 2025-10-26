import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import ModalSelector from 'react-native-modal-selector';
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
  const [isFetchingSoil, setIsFetchingSoil] = useState(false);
  const [dsDivisions, setDsDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [climateDataFetched, setClimateDataFetched] = useState(false);
  const [soilDataFetched, setSoilDataFetched] = useState(false);

  const districtData = {
    Ampara: ["Addalachchenai", "Akkaraipattu", "Alayadiyembu", "Ampara", "Damana", "Dehiattakandiya", "Irakkamam", "Kalmunai", "Karaitivu", "Lahugala", "Mahaoya", "Navithanveli", "Nintavur", "Padiyathalawa", "Sainthamaruthu", "Sammanthurai", "Samanthurai", "Thirukkovli", "Uhana"],
    Anuradhapura: ["Galenbindunuwewa", "Gainewa", "Horowpothana", "Ipalogama", "Kahatagasdigiliya", "Kebithigollewa", "Kekirawa", "Mahavilachchiya", "Medawachchiya", "Mihintale", "Nachchaduwa", "Nuwaragam Palatha C", "Nuwaragam Palatha Ei", "Palagala", "Rambewa", "Rathmalgahawewa", "Thalawa", "Thambuttegama", "Yaya Palatha"],
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
    { key: '', label: 'Select Soil Texture' },
    { key: 'Sandy clay loam', label: 'Sandy clay loam' },
    { key: 'Lateritic soils', label: 'Lateritic soils' },
    { key: 'Red loam', label: 'Red loam' },
    { key: 'Loamy', label: 'Loamy' }
  ];

  useEffect(() => {
    const districtsList = Object.keys(districtData).sort().map((name) => ({
      key: name,
      label: name
    }));
    setDistricts(districtsList);
  }, []);

  useEffect(() => {
    if (district) {
      const divisions = (districtData[district] || []).map((division) => ({
        key: division,
        label: division
      }));
      setDsDivisions(divisions);
      setDsDivision('');
      setClimateDataFetched(false);
      // Reset soil data when district changes
      setSoilTexture('');
      setSoilQuality('');
      setDrainage('');
      setSoilDataFetched(false);
    } else {
      setDsDivisions([]);
      setDsDivision('');
    }
  }, [district]);

  // Reset data when DS division changes
  useEffect(() => {
    if (dsDivision) {
      setClimateDataFetched(false);
      setElevation('');
      setAnnualRainfall('');
      setAvgTemperature('');
      setHumidity('');
      setSoilTexture('');
      setSoilQuality('');
      setDrainage('');
      setSoilDataFetched(false);
    }
  }, [dsDivision]);

  // Fetch soil data when soil texture is selected
  useEffect(() => {
    if (soilTexture && soilTexture !== '') {
      fetchSoilData(soilTexture);
    } else {
      setSoilQuality('');
      setDrainage('');
      setSoilDataFetched(false);
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
        setClimateDataFetched(true);
        
        Alert.alert('Success', 'Climate data loaded successfully! Now select your soil texture.');
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

  const fetchSoilData = async (soilType) => {
    setIsFetchingSoil(true);
    setSoilQuality('');
    setDrainage('');
    setSoilDataFetched(false);

    try {
      const response = await axios.post(`${BASE_URL}/api/pepper/get-soil-data`, {
        soil_type: soilType
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      if (response.data.success && response.data.soil_data) {
        const soilData = response.data.soil_data;
        setSoilQuality(soilData['Soil Quality'] || '');
        setDrainage(soilData['Drainage'] || '');
        setSoilDataFetched(true);
      } else {
        Alert.alert('Notice', 'Could not fetch soil data for this soil type. Please try another option.');
        setSoilTexture('');
      }
    } catch (error) {
      console.error('Soil data fetch error:', error);
      Alert.alert('Error', 'Failed to fetch soil data. Please try again.');
      setSoilTexture('');
    } finally {
      setIsFetchingSoil(false);
    }
  };

  const onGetRecommendation = async () => {
    if (!climateDataFetched) {
      Alert.alert('Missing Step', 'Please fetch climate data first by clicking "Fetch Climate Data" button');
      return;
    }

    if (!soilTexture) {
      Alert.alert('Missing Information', 'Please select soil texture');
      return;
    }

    if (!soilDataFetched) {
      Alert.alert('Loading', 'Please wait for soil data to load');
      return;
    }
    
    setIsLoading(true);
    try {
      // Call get-soil-and-pepper-data API
      const soilPepperResponse = await axios.post(
        `${BASE_URL}/api/pepper/get-soil-and-pepper-data`,
        {
          soil_type: soilTexture,
          ds_division: dsDivision
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (soilPepperResponse.data.success && soilPepperResponse.data.soil_pepper_data) {
        const recommendedPepper = soilPepperResponse.data.soil_pepper_data['Recommended pepper type'];
        
        Alert.alert(
          '🌶️ Pepper Variety Recommendation',
          `Recommended Variety: ${recommendedPepper}\n\n` +
          `📍 Location:\n` +
          `• District: ${district}\n` +
          `• DS Division: ${dsDivision}\n\n` +
          `🌡️ Environmental Conditions:\n` +
          `• Elevation: ${elevation}m\n` +
          `• Annual Rainfall: ${annualRainfall}mm\n` +
          `• Avg Temperature: ${avgTemperature}°C\n` +
          `• Humidity: ${humidity}%\n\n` +
          `🌱 Soil Properties:\n` +
          `• Soil Texture: ${soilTexture}\n` +
          `• Soil Quality: ${soilQuality}\n` +
          `• Drainage: ${drainage}\n\n` +
          `This recommendation is based on your specific location and soil conditions for optimal pepper cultivation.`,
          [
            { 
              text: 'OK',
              onPress: () => {
                // Reset form for new search
                setDistrict('');
                setDsDivision('');
                setElevation('');
                setAnnualRainfall('');
                setAvgTemperature('');
                setHumidity('');
                setSoilTexture('');
                setSoilQuality('');
                setDrainage('');
                setClimateDataFetched(false);
                setSoilDataFetched(false);
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', soilPepperResponse.data.error || 'No recommendation found for this combination. Please try different parameters.');
      }
    } catch (error) {
      console.error('Recommendation error:', error);
      Alert.alert(
        'Error', 
        error.response?.data?.error || 'Failed to get recommendations. Please try again.'
      );
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
            Get location-based pepper variety suggestions using our intelligent system
          </Text>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, climateDataFetched && styles.progressCircleActive]}>
              <Text style={[styles.progressNumber, climateDataFetched && styles.progressNumberActive]}>1</Text>
            </View>
            <Text style={styles.progressLabel}>Location &{'\n'}Climate</Text>
          </View>
          <View style={[styles.progressLine, climateDataFetched && styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, soilDataFetched && styles.progressCircleActive]}>
              <Text style={[styles.progressNumber, soilDataFetched && styles.progressNumberActive]}>2</Text>
            </View>
            <Text style={styles.progressLabel}>Soil{'\n'}Data</Text>
          </View>
          <View style={[styles.progressLine, soilDataFetched && styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressNumber}>3</Text>
            </View>
            <Text style={styles.progressLabel}>Get{'\n'}Results</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          {/* Step 1: Location Selection */}
          <View style={styles.stepSection}>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>STEP 1</Text>
              </View>
              <Text style={styles.stepTitle}>Select Your Location</Text>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>District *</Text>
              <ModalSelector
                data={districts}
                initValue="Select District"
                onChange={(option) => setDistrict(option.key)}
                style={[
                  styles.pickerContainer,
                  isLoading || isFetchingSoil ? styles.disabledPicker : {}
                ]}
                disabled={isLoading || isFetchingSoil}
                selectStyle={styles.modalSelector}
                selectTextStyle={styles.modalSelectorText}
                initValueTextStyle={styles.modalSelectorText}
                cancelText="Cancel"
                cancelStyle={styles.modalCancelButton}
                cancelTextStyle={styles.modalCancelText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>DS Division *</Text>
              <ModalSelector
                data={dsDivisions}
                initValue="Select DS Division"
                onChange={(option) => setDsDivision(option.key)}
                style={[
                  styles.pickerContainer,
                  isLoading || isFetchingSoil || !district ? styles.disabledPicker : {}
                ]}
                disabled={isLoading || isFetchingSoil || !district}
                selectStyle={styles.modalSelector}
                selectTextStyle={styles.modalSelectorText}
                initValueTextStyle={styles.modalSelectorText}
                cancelText="Cancel"
                cancelStyle={styles.modalCancelButton}
                cancelTextStyle={styles.modalCancelText}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.fetchButton, 
                (!district || !dsDivision || isLoading) && styles.disabledButton
              ]}
              onPress={fetchClimateData}
              disabled={!district || !dsDivision || isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={[styles.fetchButtonText, { marginLeft: 8 }]}>Loading Climate Data...</Text>
                </>
              ) : climateDataFetched ? (
                <>
                  <Text style={styles.fetchButtonIcon}>✓</Text>
                  <Text style={styles.fetchButtonText}>Climate Data Loaded</Text>
                </>
              ) : (
                <>
                  <Text style={styles.fetchButtonIcon}>📍</Text>
                  <Text style={styles.fetchButtonText}>Fetch Climate Data</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Climate Data Display */}
          {climateDataFetched && (
            <View style={styles.dataDisplaySection}>
              <Text style={styles.sectionTitle}>📊 Environmental Conditions Loaded</Text>
              
              <View style={styles.dataGrid}>
                <View style={styles.dataCard}>
                  <Text style={styles.dataIcon}>⛰️</Text>
                  <Text style={styles.dataLabel}>Elevation</Text>
                  <Text style={styles.dataValue}>{elevation}m</Text>
                </View>
                <View style={styles.dataCard}>
                  <Text style={styles.dataIcon}>🌧️</Text>
                  <Text style={styles.dataLabel}>Rainfall</Text>
                  <Text style={styles.dataValue}>{annualRainfall}mm</Text>
                </View>
                <View style={styles.dataCard}>
                  <Text style={styles.dataIcon}>🌡️</Text>
                  <Text style={styles.dataLabel}>Temperature</Text>
                  <Text style={styles.dataValue}>{avgTemperature}°C</Text>
                </View>
                <View style={styles.dataCard}>
                  <Text style={styles.dataIcon}>💧</Text>
                  <Text style={styles.dataLabel}>Humidity</Text>
                  <Text style={styles.dataValue}>{humidity}%</Text>
                </View>
              </View>

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

          {/* Step 2: Soil Selection */}
          {climateDataFetched && (
            <View style={styles.stepSection}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>STEP 2</Text>
                </View>
                <Text style={styles.stepTitle}>Select Soil Texture</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Soil Texture Type *</Text>
                <ModalSelector
                  data={soilTextureOptions}
                  initValue="Select Soil Texture"
                  onChange={(option) => setSoilTexture(option.key)}
                  style={[
                    styles.pickerContainer,
                    isFetchingSoil || isLoading ? styles.disabledPicker : {}
                  ]}
                  disabled={isFetchingSoil || isLoading}
                  selectStyle={styles.modalSelector}
                  selectTextStyle={styles.modalSelectorText}
                  initValueTextStyle={styles.modalSelectorText}
                  cancelText="Cancel"
                  cancelStyle={styles.modalCancelButton}
                  cancelTextStyle={styles.modalCancelText}
                />
              </View>

              {isFetchingSoil && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#28a745" />
                  <Text style={styles.loadingText}>Fetching soil properties...</Text>
                </View>
              )}

              {soilDataFetched && soilQuality && drainage && (
                <View style={styles.autoFilledSection}>
                  <View style={styles.autoFilledHeader}>
                    <Text style={styles.autoFilledIcon}>✓</Text>
                    <Text style={styles.autoFilledTitle}>Auto-filled Soil Properties</Text>
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Soil Quality</Text>
                    <View style={styles.disabledInputContainer}>
                      <Text style={styles.disabledInputText}>{soilQuality}</Text>
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Drainage</Text>
                    <View style={styles.disabledInputContainer}>
                      <Text style={styles.disabledInputText}>{drainage}</Text>
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Step 3: Get Recommendation */}
          {climateDataFetched && soilDataFetched && (
            <View style={styles.stepSection}>
              <View style={styles.stepHeader}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>STEP 3</Text>
                </View>
                <Text style={styles.stepTitle}>Get Your Recommendation</Text>
              </View>
              
              <Text style={styles.readyText}>
                ✅ All data collected! Click below to get your personalized pepper variety recommendation.
              </Text>
              
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
                      Analyzing Your Conditions...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.recommendButtonIcon}>🌶️</Text>
                    <Text style={styles.recommendButtonText}>
                      Get Pepper Variety Recommendation
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>


        <View style={styles.footerSpace} />
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
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d5c3e',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  progressCircleActive: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  progressNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6c757d',
  },
  progressNumberActive: {
    color: '#ffffff',
  },
  progressLabel: {
    fontSize: 11,
    color: '#6c757d',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e9ecef',
    marginHorizontal: 4,
    marginBottom: 32,
  },
  progressLineActive: {
    backgroundColor: '#28a745',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  stepSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  stepHeader: {
    marginBottom: 16,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  stepTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#2d5c3e',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d5c3e',
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#28a745',
    overflow: 'hidden',
  },
  disabledPicker: {
    backgroundColor: '#e9ecef',
    opacity: 0.6,
  },
  modalSelector: {
    borderWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  modalSelectorText: {
    fontSize: 16,
    color: '#2d5c3e',
    fontWeight: '500',
  },
  modalCancelButton: {
    backgroundColor: '#dc3545',
    borderRadius: 8,
  },
  modalCancelText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  fetchButton: {
    backgroundColor: '#17a2b8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#17a2b8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: '#adb5bd',
    shadowOpacity: 0.1,
  },
  fetchButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  fetchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  dataDisplaySection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d5c3e',
    marginBottom: 16,
  },
  dataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  dataCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    alignItems: 'center',
  },
  dataIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  dataLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d5c3e',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#e7f5ff',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#339af0',
  },
  loadingText: {
    fontSize: 14,
    color: '#1971c2',
    marginLeft: 10,
    fontWeight: '500',
  },
  autoFilledSection: {
    backgroundColor: '#d3f9d8',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#51cf66',
  },
  autoFilledHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  autoFilledIcon: {
    fontSize: 20,
    color: '#2b8a3e',
    marginRight: 8,
  },
  autoFilledTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2b8a3e',
  },
  disabledInputContainer: {
    backgroundColor: '#f1f3f5',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#ced4da',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledInputText: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '600',
    flex: 1,
  },
  lockIcon: {
    fontSize: 16,
    opacity: 0.5,
  },
  readyText: {
    fontSize: 14,
    color: '#2b8a3e',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    fontWeight: '500',
    backgroundColor: '#d3f9d8',
    padding: 12,
    borderRadius: 8,
  },
  recommendButton: {
    backgroundColor: '#28a745',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  recommendButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  recommendButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d5c3e',
    flex: 1,
  },
  infoDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 21,
  },
  footerSpace: {
    height: 40,
  },
});