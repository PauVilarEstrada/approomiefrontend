import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRoute } from '@react-navigation/native';
import { api } from '../api/api';

type Message = {
  id: string;
  content: string;
  imageUrl?: string;
  senderId: string;
  sentAt: string;
};

export default function ChatScreen() {
  const route = useRoute<any>();
  const { matchId } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/chat/${matchId}/messages`);
      setMessages(res.data || []);
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [matchId]);

  const sendMessage = async (content: string, imageUrl?: string) => {
    try {
      await api.post(`/chat/${matchId}/messages`, {
        content,
        imageUrl: imageUrl || null
      });
      setNewMessage('');
      fetchMessages();
    } catch {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    Alert.alert('Eliminar mensaje', '¿Seguro que quieres eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/chat/message/${id}`);
            fetchMessages();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar');
          }
        }
      }
    ]);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const mockUploadUrl = 'https://mi-servidor.com/' + uri.split('/').pop(); // simulado
      sendMessage('[Imagen]', mockUploadUrl);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMine = item.senderId === 'me'; // Reemplaza con tu ID real

    return (
      <TouchableOpacity onLongPress={() => handleDeleteMessage(item.id)}>
        <View style={[styles.message, isMine ? styles.mine : styles.theirs]}>
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
          )}
          <Text style={styles.text}>{item.content}</Text>
          <Text style={styles.time}>
            {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime())}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={pickImage}>
          <Text style={styles.icon}>🖼️</Text>
        </TouchableOpacity>

        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          style={styles.input}
        />

        <TouchableOpacity onPress={() => sendMessage(newMessage)} disabled={!newMessage.trim()}>
          <Text style={[styles.icon, { opacity: newMessage ? 1 : 0.4 }]}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  message: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 6,
    borderRadius: 10,
    position: 'relative'
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCFCE7',
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
  },
  text: {
    fontSize: 15,
    color: '#111827'
  },
  time: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    alignSelf: 'flex-end'
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8
  },
  icon: {
    fontSize: 20
  },
  image: {
    width: 160,
    height: 120,
    marginBottom: 6,
    borderRadius: 6
  }
});
