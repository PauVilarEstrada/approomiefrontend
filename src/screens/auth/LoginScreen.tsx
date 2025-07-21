import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, StyleSheet,
  KeyboardAvoidingView, Platform
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { login as loginUser } from '../../services/auth.service'
import AsyncStorage from '@react-native-async-storage/async-storage'

const loginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
})
type LoginForm = z.infer<typeof loginSchema>

export default function LoginScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const [showPassword, setShowPassword] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

 const onSubmit = async (data: LoginForm) => {
  try {
    // Llamamos al servicio de login y obtenemos el token
    const response = await loginUser({
      email: data.email,
      password: data.password
    })
    const { token } = response   // response debe ser { message: string; token: string }
    // Guardamos el token en AsyncStorage
    await AsyncStorage.setItem('token', token)

    // Navegamos a la pantalla Home
    navigation.replace('Home')
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.message || 'Error al iniciar sesión'
    Alert.alert('❌ Error', msg)
  }
}

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Iniciar sesión</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange } }) => (
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="tú@correo.com"
                placeholderTextColor="#999"
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Contraseña</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange } }) => (
              <View>
                <TextInput
                  style={[styles.input, errors.password && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!showPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  style={styles.icon}
                  onPress={() => setShowPassword(prev => !prev)}
                >
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
        </View>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.linkContainer}>
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 60,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D946EF',
    textAlign: 'center',
    marginBottom: 32
  },
  field: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    color: '#D946EF',
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#000'
  },
  inputError: {
    borderColor: '#EF4444'
  },
  icon: {
    position: 'absolute',
    right: 12,
    top: 14
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4
  },
  button: {
    backgroundColor: '#00E676',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  linkContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  linkText: {
    color: '#D946EF',
    fontWeight: '500'
  }
})
