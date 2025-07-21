import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AdsStackParamList } from '../../types/navigation';

import { api } from '../../api/api';

export default function AdsBuscoScreen() {
  const [ads, setAds] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

const navigation = useNavigation<NativeStackNavigationProp<AdsStackParamList>>();

  // Filtros
  const [location, setLocation] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [allowPets, setAllowPets] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get('/ads', {
          params: { type: 'busco' }
        });
        setAds(res.data.ads || []);
        setFiltered(res.data.ads || []);
      } catch (err) {
        console.error('Error al cargar anuncios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const applyFilters = () => {
    let result = ads;

    if (location) {
      result = result.filter(ad =>
        ad.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (minAge || maxAge) {
      const now = new Date();
      result = result.filter(ad => {
        const birth = new Date(ad.user?.birthDate || '');
        const age = now.getFullYear() - birth.getFullYear();
        return (
          (!minAge || age >= parseInt(minAge)) &&
          (!maxAge || age <= parseInt(maxAge))
        );
      });
    }

    if (allowPets) {
      result = result.filter(ad => ad.allowsAnimals === true);
    }

    setFiltered(result);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#D946EF" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.label}>📍 Ubicación</Text>
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="Ciudad o zona"
        style={styles.input}
      />

      <Text style={styles.label}>🎂 Edad mínima</Text>
      <TextInput
        value={minAge}
        onChangeText={setMinAge}
        placeholder="Ej. 18"
        keyboardType="numeric"
        style={styles.input}
      />

      <Text style={styles.label}>🎂 Edad máxima</Text>
      <TextInput
        value={maxAge}
        onChangeText={setMaxAge}
        placeholder="Ej. 30"
        keyboardType="numeric"
        style={styles.input}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>🐶 ¿Permite mascotas?</Text>
        <Switch value={allowPets} onValueChange={setAllowPets} />
      </View>

      <TouchableOpacity style={styles.button} onPress={applyFilters}>
        <Text style={styles.buttonText}>Aplicar filtros</Text>
      </TouchableOpacity>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('AdDetail', { adId: item.id })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.preferredArea}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ marginTop: 20 }}>No se encontraron resultados.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontWeight: 'bold', color: '#6B7280', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10
  },
  button: {
    backgroundColor: '#D946EF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  card: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4
  }
});
