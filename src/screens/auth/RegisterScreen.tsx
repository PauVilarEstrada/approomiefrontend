import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  BackHandler,
  StyleSheet,
  KeyboardAvoidingView
} from 'react-native';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { register as registerUser } from '../../services/auth.service';

const registerSchema = z
  .object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    surname: z.string().min(1, 'El/los apellido(s) es(n) obligatorio(s)'),
    prefix: z
      .string()
      .refine((v) => v.startsWith('+') && v.length >= 2, {
        message: 'Prefijo debe empezar con + y tener al menos 2 dígitos'
      }),
    phone: z.string().min(6, 'Teléfono inválido').max(12),
    email: z.string().email('Email no válido'),
    birthDate: z
      .date()
      .refine((d) => {
        const today = new Date();
        let age = today.getFullYear() - d.getFullYear();
        const m = today.getMonth() - d.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
        return age >= 16;
      }, { message: 'Debes tener al menos 16 años' }),
    language: z.string().min(1, 'Idioma obligatorio'),
    gender: z.string().min(1, 'Género obligatorio'),
    password: z
      .string()
      .min(6, 'Mínimo 6 caracteres')
      .refine(
        (v) => /[A-Z]/.test(v) && /[a-z]/.test(v) && /[0-9]/.test(v),
        { message: 'Debe incluir mayúscula, minúscula y número' }
      ),
    repeatPassword: z.string()
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['repeatPassword']
  });

type RegisterForm = z.infer<typeof registerSchema>;
type RegisterPayload = Omit<RegisterForm, 'repeatPassword' | 'birthDate'> & {
  birthDate: string;
};

export default function RegisterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  // Bloquear botón físico "Back"
  useFocusEffect(
    useCallback(() => {
      const onBack = () => true;
      const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => sub.remove();
    }, [])
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      surname: '',
      prefix: '',
      phone: '',
      email: '',
      birthDate: new Date(new Date().setFullYear(new Date().getFullYear() - 16)), // Default 16 años atrás
      language: '',
      gender: '',
      password: '',
      repeatPassword: ''
    }
  });

  // Leo el valor real de birthDate
  const birthDateValue = useWatch({
    control,
    name: 'birthDate'
  });

  // DatePicker - Versión corregida
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(new Date().setFullYear(new Date().getFullYear() - 16)));

  // Formatear fecha para mostrar
  const [displayDate, setDisplayDate] = useState(() => {
    const defaultDate = new Date(new Date().setFullYear(new Date().getFullYear() - 16));
    return defaultDate.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  });

  // Estados para controles de UI
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [pickerPrefix, setPickerPrefix] = useState('');
  const [pickerLanguage, setPickerLanguage] = useState('');
  const [pickerGender, setPickerGender] = useState('');
  const [profileType, setProfileType] = useState<'busco'|'ofrezco'>('busco');

  // Manejo del DatePicker
  const handleDatePress = () => {
    setTempDate(birthDateValue || new Date(new Date().setFullYear(new Date().getFullYear() - 16)));
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setTempDate(selectedDate);
      
      // En Android aplicamos directamente, en iOS esperamos confirmación
      if (Platform.OS === 'android') {
        updateBirthDate(selectedDate);
      }
    }
  };

  const confirmDate = () => {
    updateBirthDate(tempDate);
    setShowDatePicker(false);
  };

  const updateBirthDate = (date: Date) => {
    setValue('birthDate', date, { shouldValidate: true });
    setDisplayDate(date.toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }));
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { repeatPassword, birthDate, ...rest } = data;
      const payload: RegisterPayload = {
        ...rest,
        birthDate: birthDate.toISOString().split('T')[0]
      };
      await registerUser(payload);
      Alert.alert('✅ Registro correcto', 'Te hemos enviado un código de verificación.');
      navigation.replace('VerifyEmail', { email: data.email, profileType });
    } catch (err: any) {
      const msg = err?.response?.data?.error || err.message || 'Error al registrar';
      Alert.alert('❌ Error', msg);
    }
  };

  const renderInput = (
    label: string,
    name: keyof RegisterForm,
    secure = false,
    keyboard: 'default'|'email-address'|'phone-pad' = 'default',
    rightIcon?: React.ReactNode
  ) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field:{value,onChange} }) => (
          <View>
            <TextInput
              style={[styles.input, errors[name] && styles.inputError]}
              secureTextEntry={secure}
              value={value as any}
              onChangeText={t => onChange(t as any)}
              keyboardType={keyboard}
              autoCapitalize="none"
              placeholder={label}
              placeholderTextColor="#999"
            />
            {rightIcon && (
              <TouchableOpacity
                style={styles.icon}
                onPress={() => {
                  if (name === 'password') setShowPwd(v => !v);
                  if (name === 'repeatPassword') setShowPwd2(v => !v);
                }}
              >
                {rightIcon}
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      {errors[name] && <Text style={styles.errorText}>{errors[name]?.message as string}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Crear cuenta</Text>

        {renderInput('Nombre','name')}
        {renderInput('Apellido(s)','surname')}

        {renderInput(
          'Contraseña','password',
          !showPwd,'default',
          <Ionicons name={showPwd ? 'eye' : 'eye-off'} size={20} color="#666"/>
        )}
        {renderInput(
          'Repetir contraseña','repeatPassword',
          !showPwd2,'default',
          <Ionicons name={showPwd2 ? 'eye' : 'eye-off'} size={20} color="#666"/>
        )}

        {/* Prefijo */}
        <View style={styles.field}>
          <Text style={styles.label}>Prefijo</Text>
          <Controller
            control={control}
            name="prefix"
            render={({ field:{value,onChange} }) => (
              <>
                <View style={[styles.picker, errors.prefix && styles.inputError]}>
                  <Picker
                    selectedValue={value}
                    onValueChange={v => {
                      setPickerPrefix(v as string);
                      onChange(v as any);
                    }}
                  >
                    <Picker.Item label="Selecciona país..." value=""/>
                    <Picker.Item label="+34 España" value="+34"/>
                    <Picker.Item label="+55 Brasil" value="+55"/>
                    <Picker.Item label="+54 Argentina" value="+54"/>
                    <Picker.Item label="+49 Alemania" value="+49"/>
                    <Picker.Item label="+44 Reino Unido" value="+44"/>
                    <Picker.Item label="+33 Francia" value="+33"/>
                    <Picker.Item label="+39 Italia" value="+39"/>
                    <Picker.Item label="+351 Portugal" value="+351"/>
                    <Picker.Item label="+212 Marruecos" value="+212"/>
                    <Picker.Item label="Otros" value="Otros"/>
                  </Picker>
                </View>
                {pickerPrefix === 'Otros' && (
                  <TextInput
                    style={[styles.input, styles.mt8, errors.prefix && styles.inputError]}
                    value={value.startsWith('+') ? value : '+'}
                    onChangeText={t => setValue('prefix', t as any)}
                    keyboardType="phone-pad"
                    placeholder="+XX"
                    placeholderTextColor="#999"
                  />
                )}
              </>
            )}
          />
          {errors.prefix && <Text style={styles.errorText}>{errors.prefix.message}</Text>}
        </View>

        {renderInput('Teléfono','phone',false,'phone-pad')}
        {renderInput('Email','email',false,'email-address')}

        {/* Fecha de nacimiento - Versión corregida */}
        <View style={styles.field}>
          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TouchableOpacity
            style={[styles.input, errors.birthDate && styles.inputError]}
            onPress={handleDatePress}
          >
            <Text style={styles.text}>{displayDate}</Text>
          </TouchableOpacity>
          {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate.message}</Text>}
          
          {showDatePicker && (
            <View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
              {Platform.OS === 'ios' && (
                <View style={styles.iosDatePickerActions}>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmDate}>
                    <Text style={styles.confirmText}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Idioma */}
        <View style={styles.field}>
          <Text style={styles.label}>Idioma</Text>
          <Controller
            control={control}
            name="language"
            render={({ field:{value,onChange} }) => (
              <View style={[styles.picker, errors.language && styles.inputError]}>
                <Picker
                  selectedValue={value}
                  onValueChange={v => { setPickerLanguage(v as string); onChange(v as any); }}
                >
                  <Picker.Item label="Selecciona idioma..." value=""/>
                  <Picker.Item label="Castellano" value="Castellano"/>
                  <Picker.Item label="Inglés" value="Inglés"/>
                  <Picker.Item label="Alemán" value="Alemán"/>
                  <Picker.Item label="Portugués" value="Portugués"/>
                  <Picker.Item label="Italiano" value="Italiano"/>
                  <Picker.Item label="Árabe" value="Árabe"/>
                  <Picker.Item label="Francés" value="Francés"/>
                  <Picker.Item label="Otro" value="Otro"/>
                </Picker>
              </View>
            )}
          />
          {errors.language && <Text style={styles.errorText}>{errors.language.message}</Text>}
        </View>

        {/* Género */}
        <View style={styles.field}>
          <Text style={styles.label}>Género</Text>
          <Controller
            control={control}
            name="gender"
            render={({ field:{value,onChange} }) => (
              <View style={[styles.picker, errors.gender && styles.inputError]}>
                <Picker
                  selectedValue={value}
                  onValueChange={v => { setPickerGender(v as string); onChange(v as any); }}
                >
                  <Picker.Item label="Selecciona género..." value=""/>
                  <Picker.Item label="Hombre" value="Hombre"/>
                  <Picker.Item label="Mujer" value="Mujer"/>
                  <Picker.Item label="No binario" value="No binario"/>
                  <Picker.Item label="Otro" value="Otro"/>
                  <Picker.Item label="Prefiero no decirlo" value="No quiero decirlo"/>
                </Picker>
              </View>
            )}
          />
          {errors.gender && <Text style={styles.errorText}>{errors.gender.message}</Text>}
        </View>

        {/* Tipo de perfil */}
        <View style={styles.field}>
          <Text style={styles.label}>Tipo de perfil</Text>
          <View style={styles.segment}>
            <TouchableOpacity
              style={[styles.tab, profileType === 'busco' && styles.tabActive]}
              onPress={() => setProfileType('busco')}
            >
              <Text style={[styles.tabText, profileType === 'busco' && styles.tabTextActive]}>
                Busco habitación
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, profileType === 'ofrezco' && styles.tabActive]}
              onPress={() => setProfileType('ofrezco')}
            >
              <Text style={[styles.tabText, profileType === 'ofrezco' && styles.tabTextActive]}>
                Ofrezco habitación
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.submit} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.submitText}>Registrarse</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Volver a Iniciar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#D946EF', textAlign: 'center', marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, color: '#D946EF', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, color: '#000' },
  inputError: { borderColor: '#EF4444' },
  text: { color: '#000' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4 },
  picker: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, overflow: 'hidden' },
  mt8: { marginTop: 8 },
  icon: { position: 'absolute', right: 12, top: 14 },
  segment: { flexDirection: 'row', borderWidth: 1, borderColor: '#D946EF', borderRadius: 8, overflow: 'hidden' },
  tab: { flex: 1, padding: 12, backgroundColor: '#fff', alignItems: 'center' },
  tabActive: { backgroundColor: '#D946EF' },
  tabText: { color: '#D946EF', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: '600' },
  submit: { backgroundColor: '#00E676', borderRadius: 8, padding: 14, alignItems: 'center', marginVertical: 12 },
  submitText: { color: '#fff', fontWeight: '600' },
  link: { textAlign: 'center', color: '#D946EF', fontWeight: '500' },
  iosDatePickerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f5f5f5'
  },
  cancelText: {
    color: '#D946EF',
    fontWeight: '600'
  },
  confirmText: {
    color: '#00E676',
    fontWeight: '600'
  }
});