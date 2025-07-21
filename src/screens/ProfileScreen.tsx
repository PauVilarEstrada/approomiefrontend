import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { useAuth } from '../context/auth.context';
import { api } from '../api/api';

export default function ProfileScreen() {
  const { user, checkAuth, setUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/me');
        setName(res.data.user.name || '');
        setEmail(res.data.user.email || '');
      } catch {
        Alert.alert('Error', 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await api.put('/profile/me', { name, email });
      await checkAuth();
      Alert.alert('✅ Perfil actualizado');
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Eliminar cuenta', '¿Estás seguro? Esta acción es irreversible.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete('/profile/me');
            setUser(null);
          } catch {
            Alert.alert('Error', 'No se pudo eliminar la cuenta');
          }
        }
      }
    ]);
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch {
      Alert.alert('Error al cerrar sesión');
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#D946EF" style={{ marginTop: 40 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholder="Tu nombre"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholder="tucorreo@mail.com"
        keyboardType="email-address"
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={updating}>
        <Text style={styles.buttonText}>Guardar cambios</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.danger]} onPress={handleDelete}>
        <Text style={styles.buttonText}>Eliminar cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logout]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, color: '#D946EF' },
  label: { color: '#6B7280', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#000'
  },
  button: {
    backgroundColor: '#10B981',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  danger: { backgroundColor: '#EF4444' },
  logout: { backgroundColor: '#6B7280' },
  buttonText: { color: '#fff', fontWeight: '600' }
});
