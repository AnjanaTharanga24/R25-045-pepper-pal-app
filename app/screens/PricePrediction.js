import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

export default function PricePredictionScreen() {
  /** --- state --- **/
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [quality, setQuality] = useState('GR1');

  /** --- helpers --- **/
  const onPredict = () => {
    // TODO: call your FastAPI endpoint here
    alert(
      `Predicting price for ${quality} on ${date.toLocaleDateString('en-GB')}`
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Predict Black Pepper Price</Text>

      {/* date input */}
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.inputText}>
          {date.toLocaleDateString('en-GB')}
        </Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, selected) => {
            setShowPicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}

      {/* quality dropdown */}
      <View style={styles.dropdown}>
        <Picker
          selectedValue={quality}
          onValueChange={(val) => setQuality(val)}
        >
          <Picker.Item label="GR1" value="GR1" />
          <Picker.Item label="GR2" value="GR2" />
          <Picker.Item label="White" value="White" />
        </Picker>
      </View>

      {/* predict button */}
      <TouchableOpacity style={styles.button} onPress={onPredict}>
        <Text style={styles.buttonText}>Predict</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafc', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0077b6', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 14, marginBottom: 20, backgroundColor: '#fff' },
  inputText: { fontSize: 16 },
  dropdown: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, overflow: 'hidden', marginBottom: 30, backgroundColor: '#fff' },
  button: { backgroundColor: '#0077b6', paddingVertical: 14, borderRadius: 25, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18 },
});
