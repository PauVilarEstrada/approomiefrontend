import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '../api/api';
import type { ChatStackParamList } from '../types/navigation';

type MatchPreview = {
  matchId: string;
  otherUser: {
    name: string;
  };
  lastMessage: {
    content: string;
    sentAt: string;
    read: boolean;
  } | null;
};

export default function ChatListScreen() {
  const [matches, setMatches] = useState<MatchPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<ChatStackParamList>>();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await api.get('/chat/my-matches');
        setMatches(res.data || []);
      } catch (err) {
        console.error('Error al cargar chats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const renderItem = ({ item }: { item: MatchPreview }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatScreen', { matchId: item.matchId })}
    >
      <View style={styles.chatRow}>
        <Text style={styles.chatName}>{item.otherUser?.name || 'Usuario'}</Text>
        <Text style={styles.chatTime}>
          {item.lastMessage ? new Date(item.lastMessage.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
      </View>
      <Text
        numberOfLines={1}
        style={[
          styles.chatMessage,
          !item.lastMessage?.read && styles.unreadMessage
        ]}
      >
        {item.lastMessage?.content || 'Conversación iniciada'}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#D946EF" />
      </View>
    );
  }

  return (
    <FlatList
      data={matches}
      keyExtractor={item => item.matchId}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No tienes chats activos aún.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  chatItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  chatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  chatName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#111827',
  },
  chatTime: {
    color: '#6B7280',
    fontSize: 12,
  },
  chatMessage: {
    color: '#4B5563'
  },
  unreadMessage: {
    fontWeight: '600',
    color: '#111827'
  }
});
