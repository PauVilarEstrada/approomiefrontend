import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { api } from '../api/api';

type AdRoute = RouteProp<{ params: { adId: string } }, 'params'>;

export default function AdDetailScreen() {
  const route = useRoute<AdRoute>();
  const navigation = useNavigation();
  const { adId } = route.params;
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await api.get(`/ads/${adId}`);
        setAd(res.data);
      } catch {
        Alert.alert('Error', 'No se pudo cargar el anuncio.');
      }
    };
    fetchAd();
  }, [adId]);

  if (!ad) return null;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: ad.images?.[0] || '' }} style={styles.mainImage} />
      <View style={styles.content}>
        <Text style={styles.title}>{ad.title}</Text>
        <Text style={styles.price}>
          {ad.price}€/mes + {ad.expenses}€ gastos
        </Text>
        <Text style={styles.info}>{ad.location}</Text>
        <Text style={styles.info}>{ad.genderPref}</Text>
        <Text style={styles.desc}>{ad.description}</Text>

        {ad.features?.length > 0 && (
          <>
            <Text style={styles.section}>🛠️ Características:</Text>
            <Text>{ad.features.join(', ')}</Text>
          </>
        )}

        {ad.restrictions?.length > 0 && (
          <>
            <Text style={styles.section}>🚫 Restricciones:</Text>
            <Text>{ad.restrictions.join(', ')}</Text>
          </>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={() => Alert.alert('Chat', 'Aquí se abrirá el chat')}
        >
          <Text style={styles.buttonText}>💬 Abrir chat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.fav]}
          onPress={() => Alert.alert('Favoritos', 'Funcionalidad futura')}
        >
          <Text style={styles.buttonText}>❤️ Añadir a favoritos</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff' },
  mainImage: { width: '100%', height: 240 },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  price: { fontSize: 18, color: '#10B981', marginVertical: 4 },
  info: { fontSize: 14, color: '#6B7280' },
  desc: { marginTop: 12, fontSize: 16, color: '#374151' },
  section: { fontWeight: 'bold', marginTop: 16, color: '#D946EF' },
  button: {
    backgroundColor: '#D946EF',
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  fav: { backgroundColor: '#6B7280' }
});
