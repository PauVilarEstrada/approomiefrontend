// src/screens/forms/BuscoFormScreen.tsx
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StyleSheet,
  Switch
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import * as ImagePicker from 'expo-image-picker'
import { roommateSchema, RoommateForm, stayOptions } from '../../schemas/roomate.schema'
import { api } from '../../api/api'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

export default function BuscoFormScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>()
  const [photos, setPhotos] = useState<string[]>([])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [displayDate, setDisplayDate] = useState(() => {
    const today = new Date()
    return today.toLocaleDateString('es-ES')
  })

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería para tus fotos.')
      }
    })()
  }, [])

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8
    })
    if (!result.canceled) {
      setPhotos(p => [...p, result.assets[0].uri])
    }
  }

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<RoommateForm>({
    resolver: zodResolver(roommateSchema),
    defaultValues: {
      description: '',
      preferredArea: '',
      moveInDate: new Date(),
      stayDuration: '',
      genderPref: '',
      allowsPets: false,
      profilePhotos: []
    }
  })

  const onSubmit = async (data: RoommateForm) => {
    if (photos.length < 1) {
      return Alert.alert('Error', 'Debes subir al menos 1 foto de perfil.')
    }
    try {
      const form = new FormData()
      form.append('description', data.description)
      form.append('preferredArea', data.preferredArea)
      form.append('moveInDate', data.moveInDate.toISOString().split('T')[0])
      form.append('stayDuration', data.stayDuration)
      form.append('genderPref', data.genderPref)
      form.append('allowsPets', String(data.allowsPets))
      photos.forEach((uri, idx) => {
        form.append('profilePhotos', {
          uri,
          name: `photo_${idx}.jpg`,
          type: 'image/jpeg'
        } as any)
      })
      const res = await fetch(`${api.defaults.baseURL}/profile/roommate`, {
        method: 'POST',
        body: form
      })
      if (!res.ok) throw new Error(await res.text())
      Alert.alert('✅ Perfil creado correctamente', '', [
        { text: 'OK', onPress: () => navigation.replace('Tabs') }
      ])
    } catch (err: any) {
      Alert.alert('❌ Error', err.message || 'No se pudo crear el perfil.')
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Busco habitación</Text>

        <Controller
          control={control}
          name="description"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={[styles.input, errors.description && styles.inputError]}
              value={value}
              onChangeText={onChange}
              placeholder="Descripción sobre ti"
              placeholderTextColor="#999"
              multiline
            />
          )}
        />
        {errors.description && <Text style={styles.errorText}>{errors.description.message}</Text>}

        <Controller
          control={control}
          name="preferredArea"
          render={({ field: { value, onChange } }) => (
            <TextInput
              style={[styles.input, errors.preferredArea && styles.inputError]}
              value={value}
              onChangeText={onChange}
              placeholder="Zona preferida"
              placeholderTextColor="#999"
            />
          )}
        />
        {errors.preferredArea && <Text style={styles.errorText}>{errors.preferredArea.message}</Text>}

        {/* Fecha */}
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[styles.input, errors.moveInDate && styles.inputError]}
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
                setValue('moveInDate', date, { shouldValidate: true })
                setDisplayDate(date.toLocaleDateString('es-ES'))
              }
            }}
          />
        )}
        {errors.moveInDate && <Text style={styles.errorText}>{errors.moveInDate.message}</Text>}

        <Controller
          control={control}
          name="stayDuration"
          render={({ field: { value, onChange } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={[styles.picker, errors.stayDuration && styles.inputError]}
            >
              <Picker.Item label="Duración estimada de estancia" value="" />
              {stayOptions.map(o => (
                <Picker.Item key={o} label={o} value={o} />
              ))}
            </Picker>
          )}
        />
        {errors.stayDuration && <Text style={styles.errorText}>{errors.stayDuration.message}</Text>}

        <Controller
          control={control}
          name="genderPref"
          render={({ field: { value, onChange } }) => (
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={[styles.picker, errors.genderPref && styles.inputError]}
            >
              <Picker.Item label="Prefiero convivir con..." value="" />
              <Picker.Item label="Hombre" value="Hombre" />
              <Picker.Item label="Mujer" value="Mujer" />
              <Picker.Item label="No binario" value="No binario" />
              <Picker.Item label="Prefiero no decirlo" value="No quiero decirlo" />
            </Picker>
          )}
        />
        {errors.genderPref && <Text style={styles.errorText}>{errors.genderPref.message}</Text>}

        <View style={styles.switchRow}>
          <Text style={{ color: '#000' }}>¿Aceptas mascotas?</Text>
          <Controller
            control={control}
            name="allowsPets"
            render={({ field: { value, onChange } }) => (
              <Switch value={value} onValueChange={onChange} />
            )}
          />
        </View>

        <Text style={styles.label}>Fotos de perfil (mínimo 1)</Text>
        <View style={styles.photoGrid}>
          {photos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.thumb} />
          ))}
          {photos.length < 8 && (
            <TouchableOpacity onPress={pickImage} style={styles.addBtn}>
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
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  thumb: { width: 80, height: 80, borderRadius: 8, margin: 6 },
  addBtn: { width: 80, height: 80, backgroundColor: '#E5E7EB', borderRadius: 8, justifyContent: 'center', alignItems: 'center', margin: 6 },
  submit: { backgroundColor: '#00E676', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '600' },
  errorText: { color: '#EF4444', fontSize: 12, marginBottom: 8 },
  label: { color: '#D946EF', fontWeight: '500', marginBottom: 8 }
})
