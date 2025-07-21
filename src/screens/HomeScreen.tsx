import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api/api';

type Ad = {
  id: string;
  type: string;
  title: string;
  location: string;
  price: number;
  images: string[];
};

export default function HomeScreen() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await api.get('/ads');
        setAds(res.data.ads); // asegúrate de que la respuesta sea así
      } catch (err) {
        console.error('Error al cargar anuncios:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  const renderItem = ({ item }: { item: Ad }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('AdDetail', { adId: item.id })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>{item.price}€/mes</Text>
        <Text style={styles.location}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#D946EF" />
      </View>
    );
  }

  return (
    <FlatList
      data={ads}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
  },
  info: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
  },
  price: {
    color: '#10B981',
    fontWeight: '500',
    marginTop: 4,
  },
  location: {
    color: '#6B7280',
    marginTop: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
