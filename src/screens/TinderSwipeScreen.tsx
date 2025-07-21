// src/screens/TinderSwipeScreen.tsx

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  PanResponder,
  Animated
} from 'react-native';
import { api } from '../api/api';
import { showInterstitialAd } from '../utils/ads';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ChatStackParamList } from '../types/navigation';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;       // Distancia mínima para considerar swipe
const INTERSTITIAL_EVERY = 6;       // Mostrar anuncio cada N swipes

export default function TinderSwipeScreen() {
  // 1️⃣ Estado y navegación
  const [ads, setAds] = useState<any[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const swipeCount = useRef(0);
  const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList>>();

  // 2️⃣ Animated.Value para el desplazamiento
  const position = useRef(new Animated.ValueXY()).current;

  // 3️⃣ Funciones de swipe (deben ir antes de usar panResponder)
  const animateSwipe = (direction: 'left' | 'right') => {
    const toX = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x: toX, y: 0 },
      duration: 250,
      useNativeDriver: false
    }).start(() => {
      handleSwipe(currentIndex, direction);
      position.setValue({ x: 0, y: 0 });
      setCurrentIndex((i) => i + 1);
    });
  };

  const handleSwipe = async (index: number, direction: 'left' | 'right') => {
    if (!ads) return;
    const ad = ads[index];
    if (!ad) return;

    // 1. Contador e interstitial
    swipeCount.current += 1;
    if (swipeCount.current % INTERSTITIAL_EVERY === 0) {
      try { await showInterstitialAd(); } catch (e) { console.warn('Interstitial failed', e); }
    }

    // 2. Registrar swipe en backend
    try {
      const res = await api.post(`/ads/swipe/${ad.id}`);
      if (res.data.matchId) {
        Alert.alert(
          '💘 ¡Es un match!',
          'Podéis empezar a chatear ahora mismo',
          [{ text: 'Ir al chat', onPress: () => navigation.navigate('ChatScreen', { matchId: res.data.matchId }) }],
          { cancelable: true }
        );
      }
    } catch (e) {
      console.warn('Swipe POST failed', e);
    }
  };

  // 4️⃣ PanResponder para capturar gestos
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 10,
      onPanResponderMove: Animated.event([null, { dx: position.x }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        if (!ads || ads.length === 0) {
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
          return;
        }
        if (gesture.dx > SWIPE_THRESHOLD) {
          animateSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          animateSwipe('left');
        } else {
          Animated.spring(position, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      }
    })
  ).current;

  // 5️⃣ Fetch inicial de anuncios
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/ads/swipe');
        setAds(res.data.ads ?? []);
      } catch (e) {
        Alert.alert('Error', 'No se pudieron cargar los anuncios para swipe.');
        setAds([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 6️⃣ Guards para loading, sin anuncios y fin de lista
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D946EF" />
      </View>
    );
  }

  if (!ads || ads.length === 0) {
    return (
      <View style={styles.center}>
        <Text>No hay anuncios disponibles para hacer swipe.</Text>
      </View>
    );
  }

  if (currentIndex >= ads.length) {
    return (
      <View style={styles.center}>
        <Text>Se han visto todos los anuncios.</Text>
      </View>
    );
  }

  // 7️⃣ Render de la tarjeta swipeable
  const ad = ads[currentIndex];
  return (
    <View style={styles.container}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [
              { translateX: position.x },
              {
                rotate: position.x.interpolate({
                  inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
                  outputRange: ['-15deg', '0deg', '15deg'],
                  extrapolate: 'clamp'
                })
              }
            ]
          }
        ]}
      >
        {ad.images?.[0] && <Image source={{ uri: ad.images[0] }} style={styles.image} />}
        <Text style={styles.title}>{ad.title}</Text>
        <Text style={styles.info}>{ad.location}</Text>
        <Text style={styles.price}>{ad.price}€/mes</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, justifyContent: 'center', alignItems: 'center' },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card:      { width: '100%', height: 420, backgroundColor: '#F3F4F6', borderRadius: 10, padding: 20, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  image:     { width: '100%', height: 220, borderRadius: 10, marginBottom: 12 },
  title:     { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 4, textAlign: 'center' },
  info:      { fontSize: 14, color: '#6B7280', marginBottom: 4, textAlign: 'center' },
  price:     { fontSize: 16, color: '#10B981', fontWeight: '600', textAlign: 'center' }
});
