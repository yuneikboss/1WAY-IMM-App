import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../constants/colors';
import { ARTISTS } from '../data/artists';
import { useApp } from '../context/AppContext';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { messages, sendMessage, user } = useApp();
  const [text, setText] = useState('');

  const artist = ARTISTS.find(a => a.id === id);
  const chatMessages = messages.filter(m => (m.senderId === id || m.receiverId === id));

  const handleSend = () => {
    if (text.trim() && artist) {
      sendMessage(artist.id, text.trim());
      setText('');
    }
  };

  if (!artist) {
    return <View style={styles.container}><Text style={styles.notFound}>Artist not found</Text></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Image source={{ uri: artist.image }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{artist.name}</Text>
            {artist.verified && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />}
          </View>
          <Text style={styles.status}>Online</Text>
        </View>
        <TouchableOpacity style={styles.videoBtn} onPress={() => router.push(`/videochat?artistId=${artist.id}`)}>
          <Ionicons name="videocam" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messageList} contentContainerStyle={styles.messageContent}>
        {chatMessages.length === 0 ? (
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>Start your conversation with {artist.name}</Text>
          </View>
        ) : (
          chatMessages.map(msg => (
            <View key={msg.id} style={[styles.messageBubble, msg.senderId === user?.id ? styles.sent : styles.received]}>
              <Text style={styles.messageText}>{msg.text}</Text>
              <Text style={styles.messageTime}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachBtn}>
          <Ionicons name="add-circle" size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <TextInput style={styles.input} placeholder="Type a message..." placeholderTextColor={COLORS.textMuted} value={text} onChangeText={setText} multiline />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  notFound: { color: COLORS.textMuted, textAlign: 'center', marginTop: 100 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: COLORS.backgroundLight },
  avatar: { width: 40, height: 40, borderRadius: 20, marginLeft: 12 },
  headerInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  status: { fontSize: 12, color: COLORS.success },
  videoBtn: { padding: 8 },
  messageList: { flex: 1 },
  messageContent: { padding: 20 },
  emptyChat: { alignItems: 'center', paddingTop: 40 },
  emptyChatText: { color: COLORS.textMuted, fontSize: 14 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 12 },
  sent: { backgroundColor: COLORS.primary, alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  received: { backgroundColor: COLORS.backgroundCard, alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { color: COLORS.textPrimary, fontSize: 15 },
  messageTime: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderTopColor: COLORS.backgroundLight },
  attachBtn: { marginRight: 8 },
  input: { flex: 1, backgroundColor: COLORS.backgroundCard, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, color: COLORS.textPrimary, maxHeight: 100 },
  sendBtn: { backgroundColor: COLORS.primary, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
});
