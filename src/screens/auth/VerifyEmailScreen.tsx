// src/screens/VerifyEmailScreen.tsx
import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, BackHandler,
  StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { verifyEmail as verifyUserEmail } from '../../services/auth.service';

const verifySchema = z.object({
  code: z.string()
    .length(6, 'El código debe tener 6 caracteres')
    .regex(/^[A-Z0-9]+$/, 'Solo mayúsculas y números')
});

type VerifyForm = z.infer<typeof verifySchema>;

export default function VerifyEmailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { email, profileType } = route.params as {
    email: string;
    profileType: 'busco' | 'ofrezco';
  };

  // Bloquear “atrás” físico
  useFocusEffect(useCallback(() => {
    const onBack = () => true;
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, []));

  const { control, handleSubmit, formState: { errors } } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' }
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ code }: VerifyForm) => {
    try {
      setLoading(true);
      await verifyUserEmail({ email, code });
      Alert.alert('✅ Verificado', 'Tu correo ha sido verificado correctamente.');

      // ¡Usa los nombres del Stack que definiste en App.tsx!
      if (profileType === 'busco') {
        navigation.replace('BuscoForm');
      } else {
        navigation.replace('OfrezcoForm');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Error al verificar.';
      Alert.alert('❌ Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Verificar correo</Text>
        <Text style={styles.instructions}>
          Hemos enviado un código de verificación al correo:
        </Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Código de verificación</Text>
          <Controller
            control={control}
            name="code"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[styles.input, errors.code && styles.inputError]}
                value={value}
                onChangeText={text => onChange(text.toUpperCase())}
                autoCapitalize="characters"
                placeholder="E.g. A1B2C3"
                maxLength={6}
                placeholderTextColor="#999"
              />
            )}
          />
          {errors.code && <Text style={styles.errorText}>{errors.code.message}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verificando...' : 'Verificar'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 24, paddingBottom: 40, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#D946EF', textAlign: 'center', marginBottom: 16 },
  instructions: { fontSize: 16, color: '#444', textAlign: 'center' },
  email: { fontSize: 16, color: '#000', textAlign: 'center', marginBottom: 24, fontWeight: '500' },
  field: { marginBottom: 20 },
  label: { fontSize: 14, color: '#D946EF', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, color: '#000' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  button: { backgroundColor: '#00E676', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 10 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600' }
});

