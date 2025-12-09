import React, { useState, useRef } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { useAuth } from './context/AuthContext';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';

interface Message {
  id: string;
  type: 'user' | 'ai';
  text: string;
  timestamp: number;
}

const AI_VOICES = [
  { id: 'default', name: 'Default', icon: 'mic' },
  { id: 'deep', name: 'Deep Voice', icon: 'volume-high' },
  { id: 'smooth', name: 'Smooth', icon: 'musical-note' },
  { id: 'energetic', name: 'Energetic', icon: 'flash' },
  { id: 'calm', name: 'Calm', icon: 'leaf' },
];

const QUICK_PROMPTS = [
  'Help me write a hook for my song',
  'Give me rhymes for "dream"',
  'Suggest a beat style for R&B',
  'Help with my music video concept',
  'Write a verse about success',
  'Improve these lyrics',
];

const AI_RESPONSES: Record<string, string> = {
  'hook': "Here's a catchy hook idea:\n\n🎵 \"Rising up from nothing, now we touching the sky\nEvery step I'm taking, watch me multiply\nThey said I couldn't make it, now they asking why\n1WAY to the top, ain't no limit when you fly\" 🎵\n\nWant me to adjust the vibe or try a different style?",
  'rhymes': "Here are some fire rhymes for 'dream':\n\n• Stream, gleam, team, scheme\n• Supreme, extreme, regime\n• Redeem, esteem, theme\n• Moonbeam, daydream, mainstream\n\nNeed rhymes for any other words?",
  'beat': "For R&B, I'd suggest:\n\n🎹 Tempo: 70-90 BPM\n🥁 Drums: Soft kicks, snappy snares\n🎸 Melody: Smooth piano or guitar\n🎧 Vibe: Soulful, emotional\n\nArtists to reference: SZA, Daniel Caesar, H.E.R.\n\nWant me to break down a specific style?",
  'video': "Here's a music video concept:\n\n📍 Location: Urban rooftop at sunset\n🎬 Story: Journey from struggle to success\n👥 Scenes:\n1. Opening: Artist alone, reflecting\n2. Middle: Flashbacks of the grind\n3. Climax: Breakthrough moment\n4. End: Celebrating with the team\n\n🎨 Color palette: Gold, purple, city lights\n\nWant me to expand on any scene?",
  'verse': "Here's a verse about success:\n\n\"Started from the basement, now I'm in the penthouse\nEvery doubt they had, I had to vent out\nLate nights in the studio, that's what I'm about\nThey sleeping on the dream, but I never went out\nGrinding every day, yeah I put the work in\nNow they see me shining, got them all searching\nFor the secret sauce, but it ain't no secret\nJust believe in yourself and go and achieve it\"\n\nWant me to adjust the flow or theme?",
  'default': "I'm 1WAY AI, your personal music assistant! 🎵\n\nI can help you with:\n• Writing lyrics and hooks\n• Finding rhymes\n• Music video concepts\n• Beat suggestions\n• Improving your songs\n\nWhat would you like to work on today?",
};

export default function AIAssistantScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      text: "Hey! I'm 1WAY AI, your personal music assistant. I'm here to help you write lyrics, create hooks, plan music videos, and more. What can I help you create today? 🎵",
      timestamp: Date.now(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('default');
  const [isTyping, setIsTyping] = useState(false);
  const [showVoices, setShowVoices] = useState(false);

  const isPremium = profile?.isPremium;

  const getAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('hook') || lowerInput.includes('chorus')) return AI_RESPONSES.hook;
    if (lowerInput.includes('rhyme')) return AI_RESPONSES.rhymes;
    if (lowerInput.includes('beat') || lowerInput.includes('r&b') || lowerInput.includes('style')) return AI_RESPONSES.beat;
    if (lowerInput.includes('video') || lowerInput.includes('concept')) return AI_RESPONSES.video;
    if (lowerInput.includes('verse') || lowerInput.includes('success') || lowerInput.includes('lyrics')) return AI_RESPONSES.verse;
    return AI_RESPONSES.default;
  };

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        text: getAIResponse(userMessage.text),
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 1500);

    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Image 
            source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997736375_fd969565.jpg' }} 
            style={styles.aiAvatar}
          />
          <View>
            <Text style={styles.title}>1WAY AI</Text>
            <Text style={styles.subtitle}>Music Assistant</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowVoices(!showVoices)}>
          <Ionicons name="settings" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <TouchableOpacity style={styles.premiumBanner} onPress={() => router.push('/premium')}>
          <Ionicons name="diamond" size={20} color={COLORS.gold} />
          <Text style={styles.premiumText}>Upgrade to Premium for unlimited AI access</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gold} />
        </TouchableOpacity>
      )}

      {showVoices && (
        <View style={styles.voiceSelector}>
          <Text style={styles.voiceSelectorTitle}>AI Voice Style</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {AI_VOICES.map(voice => (
              <TouchableOpacity 
                key={voice.id}
                style={[styles.voiceOption, selectedVoice === voice.id && styles.voiceOptionActive]}
                onPress={() => setSelectedVoice(voice.id)}
              >
                <Ionicons name={voice.icon as any} size={20} color={selectedVoice === voice.id ? COLORS.textPrimary : COLORS.textMuted} />
                <Text style={[styles.voiceText, selectedVoice === voice.id && styles.voiceTextActive]}>{voice.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <KeyboardAvoidingView 
        style={styles.chatContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView 
          ref={scrollRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(message => (
            <View 
              key={message.id} 
              style={[
                styles.messageBubble,
                message.type === 'user' ? styles.userBubble : styles.aiBubble
              ]}
            >
              {message.type === 'ai' && (
                <Image 
                  source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997736375_fd969565.jpg' }} 
                  style={styles.messageAvatar}
                />
              )}
              <View style={[
                styles.messageContent,
                message.type === 'user' ? styles.userContent : styles.aiContent
              ]}>
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            </View>
          ))}
          
          {isTyping && (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Image 
                source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997736375_fd969565.jpg' }} 
                style={styles.messageAvatar}
              />
              <View style={[styles.messageContent, styles.aiContent]}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.quickPromptsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPrompts}>
            {QUICK_PROMPTS.map((prompt, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.quickPrompt}
                onPress={() => handleQuickPrompt(prompt)}
              >
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask 1WAY AI anything..."
            placeholderTextColor={COLORS.textMuted}
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <MiniPlayer />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    paddingBottom: 16 
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aiAvatar: { width: 40, height: 40, borderRadius: 20 },
  title: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 12, color: COLORS.success },
  premiumBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8, 
    backgroundColor: 'rgba(234,179,8,0.15)', 
    paddingVertical: 10, 
    marginHorizontal: 20,
    borderRadius: 12,
  },
  premiumText: { color: COLORS.gold, fontSize: 13, fontWeight: '600' },
  voiceSelector: { 
    backgroundColor: COLORS.backgroundCard, 
    marginHorizontal: 20, 
    marginTop: 12, 
    padding: 12, 
    borderRadius: 12 
  },
  voiceSelectorTitle: { color: COLORS.textMuted, fontSize: 12, marginBottom: 8 },
  voiceOption: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    marginRight: 8,
  },
  voiceOptionActive: { backgroundColor: COLORS.primary },
  voiceText: { color: COLORS.textMuted, fontSize: 13 },
  voiceTextActive: { color: COLORS.textPrimary },
  chatContainer: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 20, paddingBottom: 10 },
  messageBubble: { flexDirection: 'row', marginBottom: 16 },
  userBubble: { justifyContent: 'flex-end' },
  aiBubble: { justifyContent: 'flex-start' },
  messageAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  messageContent: { maxWidth: '80%', padding: 14, borderRadius: 16 },
  userContent: { backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  aiContent: { backgroundColor: COLORS.backgroundCard, borderBottomLeftRadius: 4 },
  messageText: { color: COLORS.textPrimary, fontSize: 15, lineHeight: 22 },
  typingIndicator: { flexDirection: 'row', gap: 4, paddingVertical: 8 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted },
  typingDot1: { opacity: 0.4 },
  typingDot2: { opacity: 0.6 },
  typingDot3: { opacity: 0.8 },
  quickPromptsContainer: { borderTopWidth: 1, borderTopColor: COLORS.backgroundCard },
  quickPrompts: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  quickPrompt: { 
    backgroundColor: COLORS.backgroundCard, 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    borderRadius: 16,
    marginRight: 8,
  },
  quickPromptText: { color: COLORS.textSecondary, fontSize: 13 },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    padding: 12, 
    paddingBottom: 140,
    gap: 12 
  },
  input: { 
    flex: 1, 
    backgroundColor: COLORS.backgroundCard, 
    borderRadius: 20, 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    color: COLORS.textPrimary,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    backgroundColor: COLORS.primary, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});
