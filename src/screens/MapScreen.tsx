import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api/api';
import type { AdsStackParamList } from '../types/navigation';

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AdsStackParamList>>();
  const [markers, setMarkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await api.get('/ads/map-markers');
        setMarkers(res.data.ads || []);
      } catch (err) {
        Alert.alert('Error', 'No se pudieron cargar los puntos del mapa');
      } finally {
        setLoading(false);
      }
    };

    fetchMarkers();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D946EF" />
      </View>
    );
  }

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: 40.4168, // Centro España
        longitude: -3.7038,
        latitudeDelta: 2,
        longitudeDelta: 2,
      }}
    >
      {markers.map((ad: any) => (
        <Marker
          key={ad.id}
          coordinate={{
            latitude: ad.latitude,
            longitude: ad.longitude
          }}
          title={ad.title}
          description={ad.location}
          onPress={() => navigation.navigate('AdDetail', { adId: ad.id })}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
