import React, { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, Image,
  KeyboardAvoidingView, ScrollView, Platform,
  Alert, StyleSheet, Switch
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import * as ImagePicker from 'expo-image-picker'
import { providerSchema, ProviderForm, stayOptions } from '../../schemas/provider.schema'
import { api } from '../../api/api'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

export default function OfrezcoFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const [roomPhotos, setRoomPhotos] = useState<string[]>([])
  const [profilePhotos, setProfilePhotos] = useState<string[]>([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [displayDate, setDisplayDate] = useState(() =>
    new Date().toLocaleDateString('es-ES')
  )

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a tu galería.')
      }
    })()
  }, [])

  const pickRoomPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8
    })
    if (!result.canceled) {
      setRoomPhotos(p => [...p, result.assets[0].uri])
    }
  }

  const pickProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8
    })
    if (!result.canceled) {
      setProfilePhotos(p => [...p, result.assets[0].uri])
    }
  }

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<ProviderForm>({
    resolver: zodResolver(providerSchema),
    defaultValues: {
      spaceDesc: '',
      rent: 0,
      expenses: 0,
      area: '',
      availability: new Date(),
      minStay: '1',
      maxStay: undefined,
      allowsPets: false,
      features: [],
      restrictions: [],
      genderPref: '',
      roomPhotos: [],
      profilePhotos: []
    }
  })

  const onSubmit = async (data: ProviderForm) => {
    if (roomPhotos.length < 2) {
      return Alert.alert('Error', 'Debes subir mínimo 2 fotos del inmueble.')
    }
    try {
      const form = new FormData()
      form.append('spaceDesc', data.spaceDesc)
      form.append('rent', String(data.rent))
      form.append('expenses', String(data.expenses))
      form.append('area', data.area)
      form.append('availability', data.availability.toISOString().split('T')[0])
      form.append('minStay', data.minStay)
      if (data.maxStay) form.append('maxStay', data.maxStay)
      form.append('allowsPets', String(data.allowsPets))
      data.features.forEach(f => form.append('features', f))
      data.restrictions?.forEach(r => form.append('restrictions', r))
      form.append('genderPref', data.genderPref)
      roomPhotos.forEach((uri, i) => {
        form.append('roomPhotos', {
          uri,
          name: `room_${i}.jpg`,
          type: 'image/jpeg'
        } as any)
      })
      profilePhotos.forEach((uri, i) => {
        form.append('profilePhotos', {
          uri,
          name: `profile_${i}.jpg`,
          type: 'image/jpeg'
        } as any)
      })

      const res = await fetch(`${api.defaults.baseURL}/profile/provider`, {
        method: 'POST',
        body: form
      })
      if (!res.ok) throw new Error(await res.text())

      Alert.alert('✅ Perfil creado', 'Tu perfil se guardó con éxito.', [
        { text: 'OK', onPress: () => navigation.replace('Tabs') }
      ])
    } catch (err: any) {
      Alert.alert('❌ Error', err.message || 'Error al guardar el perfil.')
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Ofrezco habitación</Text>

        <Controller
          control={control}
          name="spaceDesc"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={[styles.input, errors.spaceDesc && styles.inputError]}
              value={value}
              onChangeText={onChange}
              placeholder="Descripción del espacio"
              placeholderTextColor="#999"
              multiline
            />
          )}
        />
        {errors.spaceDesc && <Text style={styles.errorText}>{errors.spaceDesc.message}</Text>}

        <Controller
          control={control}
          name="rent"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={[styles.input, errors.rent && styles.inputError]}
              value={String(value)}
              onChangeText={t => onChange(Number(t))}
              placeholder="Precio mensual (€)"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          )}
        />
        {errors.rent && <Text style={styles.errorText}>{errors.rent.message}</Text>}

        <Controller
          control={control}
          name="expenses"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={[styles.input, errors.expenses && styles.inputError]}
              value={String(value)}
              onChangeText={t => onChange(Number(t))}
              placeholder="Gastos estimados (€)"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          )}
        />
        {errors.expenses && <Text style={styles.errorText}>{errors.expenses.message}</Text>}

        <Controller
          control={control}
          name="area"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={[styles.input, errors.area && styles.inputError]}
              value={value}
              onChangeText={onChange}
              placeholder="Zona / barrio"
              placeholderTextColor="#999"
            />
          )}
        />
        {errors.area && <Text style={styles.errorText}>{errors.area.message}</Text>}

        {/* Fecha */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[styles.input, errors.availability && styles.inputError]}
        >
          <Text style={{ color: '#000' }}>{displayDate}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowDatePicker(false)
              if (date) {
                setValue('availability', date, { shouldValidate: true })
                setDisplayDate(date.toLocaleDateString('es-ES'))
              }
            }}
          />
        )}
        {errors.availability && <Text style={styles.errorText}>{errors.availability.message}</Text>}

        <Controller
          control={control}
          name="minStay"
          render={({ field: { value, onChange } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={[styles.picker, errors.minStay && styles.inputError]}
            >
              <Picker.Item label="Estancia mínima" value="" />
              {stayOptions.map(o => (
                <Picker.Item key={o} label={o} value={o} />
              ))}
            </Picker>
          )}
        />
        {errors.minStay && <Text style={styles.errorText}>{errors.minStay.message}</Text>}

        <Text style={styles.label}>¿Permites mascotas?</Text>
        <Controller
          control={control}
          name="allowsPets"
          render={({ field: { value, onChange } }) => (
            <Switch value={value} onValueChange={onChange} />
          )}
        />

        <Text style={styles.label}>Fotos del espacio (mín. 2)</Text>
        <View style={styles.photoGrid}>
          {roomPhotos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.thumb} />
          ))}
          {roomPhotos.length < 15 && (
            <TouchableOpacity onPress={pickRoomPhoto} style={styles.addBtn}>
              <Text style={{ fontSize: 24 }}>＋</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.label}>Fotos de perfil (opcional)</Text>
        <View style={styles.photoGrid}>
          {profilePhotos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.thumb} />
          ))}
          {profilePhotos.length < 5 && (
            <TouchableOpacity onPress={pickProfilePhoto} style={styles.addBtn}>
              <Text style={{ fontSize: 24 }}>＋</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={handleSubmit(onSubmit)} style={styles.submit}>
          <Text style={styles.submitText}>Guardar perfil</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', paddingBottom: 60 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#D946EF', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, color: '#000', marginBottom: 12 },
  inputError: { borderColor: '#EF4444' },
  picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 12 },
  label: { fontWeight: '500', color: '#D946EF', marginBottom: 8 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  thumb: { width: 80, height: 80, borderRadius: 8, margin: 6 },
  addBtn: { width: 80, height: 80, backgroundColor: '#E5E7EB', borderRadius: 8, justifyContent: 'center', alignItems: 'center', margin: 6 },
  submit: { backgroundColor: '#00E676', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8 }
})
