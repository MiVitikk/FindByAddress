import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

let apiKey = '67b34d47760c8587870818efq8cc5ca';
export default function App() {
  const [address, setAddress] = useState('');
  const [region, setRegion] = useState(null); 
  const [markerCoords, setMarkerCoords] = useState(null); 
  const [markerTitle, setMarkerTitle] = useState('');

  const fetchRegion = () => {
    setMarkerTitle('');
    fetch(`https://geocode.maps.co/search?q=${address}&api_key=${apiKey}`)
      .then(response => {
        if (!response.ok)
          throw new Error("Error in fetch:" + response.statusText);
        return response.json();
      })
      .then(data => {
        const newCoords = {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
        setRegion({
          ...newCoords,
          latitudeDelta: 0.0322,
          longitudeDelta: 0.0221,
        });
        setMarkerCoords(newCoords); 
        setMarkerTitle(address); 
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('No permission to get location');
        return;
      }
      let currentLocation = await Location.getCurrentPositionAsync({});
      const initialRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0322,
        longitudeDelta: 0.0221,
      };
      setRegion(initialRegion);
      setMarkerCoords({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      }); 
    })();
  }, []);

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          style={{ width: '100%', height: '85%' }}
          region={region}
          onRegionChangeComplete={setRegion} 
        >
          {markerCoords && (
            <Marker
              coordinate={markerCoords}
              title={markerTitle || 'Current Location'}
            />
          )}
        </MapView>
      )}

      <TextInput
        style={styles.input}
        placeholder="Find address"
        onChangeText={(text) => setAddress(text)}
        value={address}
      />
      <Button title="Search" onPress={fetchRegion} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 20,
    width: '80%',
    paddingHorizontal: 10,
  },
});
