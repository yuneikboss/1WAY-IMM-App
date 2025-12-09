import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { useAuth } from './context/AuthContext';

const { width } = Dimensions.get('window');

const ONBOARDING_IMAGES = {
  importantNotice: 'https://d64gsuwffb70l.cloudfront.net/6929a7f4596b9f3ab099f04d_1764999592118_516c97a6.png',
  contestRules: 'https://d64gsuwffb70l.cloudfront.net/6929a7f4596b9f3ab099f04d_1764999595910_89e23010.png',
  contestPage: 'https://d64gsuwffb70l.cloudfront.net/6929a7f4596b9f3ab099f04d_1764999599394_8ea2fab9.png',
};

const GUIDELINES = [
  {
    icon: 'shield-checkmark',
    title: 'Respect All Artists',
    description: 'Treat every artist with respect. No harassment, bullying, or hate speech will be tolerated.',
  },
  {
    icon: 'musical-notes',
    title: 'Original Content Only',
    description: 'Only upload music and content that you own or have rights to. Copyright violations will result in account termination.',
  },
  {
    icon: 'cash',
    title: 'Fair Transactions',
    description: 'All financial transactions are final. Disputes must be reported within 48 hours. A 20¢ fee per $1 applies to sales.',
  },
  {
    icon: 'trophy',
    title: 'Contest Rules',
    description: 'Contests run twice yearly (every 6 months). Process of elimination monthly until one winner remains. No cheating or vote manipulation.',
  },
  {
    icon: 'videocam',
    title: 'Live Streaming',
    description: 'Live tours and video chats must follow community guidelines. No explicit content without proper age restrictions.',
  },
  {
    icon: 'lock-closed',
    title: 'Account Security',
    description: 'Keep your login credentials secure. Enable two-factor authentication. Never share your password.',
  },
];

type OnboardingStep = 'notice' | 'rules' | 'guidelines';

export default function OnboardingScreen() {
  const router = useRouter();
  const { acceptGuidelines, acceptContestRules } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('notice');
  const [agreeNotice, setAgreeNotice] = useState(false);
  const [agreeRules, setAgreeRules] = useState(false);
  const [hasReadGuidelines, setHasReadGuidelines] = useState(false);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    
    if (offsetY + scrollViewHeight >= contentHeight - 50) {
      setHasReadGuidelines(true);
    }
  };

  const handleNext = () => {
    if (currentStep === 'notice') {
      setCurrentStep('rules');
    } else if (currentStep === 'rules') {
      acceptContestRules();
      setCurrentStep('guidelines');
    } else {
      acceptGuidelines();
      router.replace('/login');
    }
  };

  const canProceed = () => {
    if (currentStep === 'notice') return agreeNotice;
    if (currentStep === 'rules') return agreeRules;
    return hasReadGuidelines;
  };

  const renderNoticeStep = () => (
    <View style={styles.stepContainer}>
      <Image 
        source={{ uri: ONBOARDING_IMAGES.importantNotice }} 
        style={styles.fullImage}
        resizeMode="contain"
      />
      
      <View style={styles.checkboxContainer}>
        <TouchableOpacity 
          style={[styles.checkbox, agreeNotice && styles.checkboxChecked]}
          onPress={() => setAgreeNotice(!agreeNotice)}
        >
          {agreeNotice && <Ionicons name="checkmark" size={18} color={COLORS.textPrimary} />}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>I agree</Text>
      </View>
    </View>
  );

  const renderRulesStep = () => (
    <View style={styles.stepContainer}>
      <ScrollView 
        style={styles.rulesScroll}
        showsVerticalScrollIndicator={false}
      >
        <Image 
          source={{ uri: ONBOARDING_IMAGES.contestRules }} 
          style={styles.rulesImage}
          resizeMode="contain"
        />
      </ScrollView>
      
      <View style={styles.checkboxContainer}>
        <TouchableOpacity 
          style={[styles.checkbox, agreeRules && styles.checkboxChecked]}
          onPress={() => setAgreeRules(!agreeRules)}
        >
          {agreeRules && <Ionicons name="checkmark" size={18} color={COLORS.textPrimary} />}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>I agree to abide by the contest rules</Text>
      </View>
    </View>
  );

  const renderGuidelinesStep = () => (
    <ScrollView 
      style={styles.guidelinesScroll}
      contentContainerStyle={styles.guidelinesContent}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/692bf8fe6f6012747066995c_1764997736375_fd969565.jpg' }} 
          style={styles.logo}
        />
        <Text style={styles.title}>Welcome to 1WAY</Text>
        <Text style={styles.subtitle}>The Ultimate Music Platform</Text>
      </View>

      <View style={styles.warningBanner}>
        <Ionicons name="alert-circle" size={24} color={COLORS.gold} />
        <Text style={styles.warningText}>
          Please read all guidelines carefully before proceeding
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Community Guidelines & Rules</Text>
      
      {GUIDELINES.map((item, index) => (
        <View key={index} style={styles.guidelineCard}>
          <View style={styles.guidelineIcon}>
            <Ionicons name={item.icon as any} size={24} color={COLORS.primary} />
          </View>
          <View style={styles.guidelineContent}>
            <Text style={styles.guidelineTitle}>{item.title}</Text>
            <Text style={styles.guidelineDesc}>{item.description}</Text>
          </View>
        </View>
      ))}

      <View style={styles.importantBox}>
        <Text style={styles.importantTitle}>IMPORTANT NOTICE</Text>
        <Text style={styles.importantText}>
          By using 1WAY, you agree to abide by all community guidelines. 
          Violations may result in account suspension or termination. 
          All content must be original or properly licensed. 
          Financial transactions are subject to platform fees.
        </Text>
      </View>

      <View style={styles.premiumInfo}>
        <Ionicons name="diamond" size={32} color={COLORS.gold} />
        <Text style={styles.premiumTitle}>1WAY Premium - $12/year</Text>
        <Text style={styles.premiumDesc}>
          Unlock all features including Live Tours, Demo Sales, 
          1Way Infinite Money Account, and premium microphones.
        </Text>
      </View>

      <Image 
        source={{ uri: ONBOARDING_IMAGES.contestPage }} 
        style={styles.contestPreview}
        resizeMode="contain"
      />
      
      <Text style={styles.previewLabel}>Preview of Contest Leaderboard</Text>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill, 
            { width: currentStep === 'notice' ? '33%' : currentStep === 'rules' ? '66%' : '100%' }
          ]} />
        </View>
        <Text style={styles.progressText}>
          Step {currentStep === 'notice' ? '1' : currentStep === 'rules' ? '2' : '3'} of 3
        </Text>
      </View>

      {currentStep === 'notice' && renderNoticeStep()}
      {currentStep === 'rules' && renderRulesStep()}
      {currentStep === 'guidelines' && renderGuidelinesStep()}

      <View style={styles.footer}>
        {currentStep !== 'notice' && (
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => setCurrentStep(currentStep === 'rules' ? 'notice' : 'rules')}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]} 
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextText}>
            {currentStep === 'guidelines' ? 'Sign up' : 'Continue'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  progressContainer: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  progressBar: { height: 4, backgroundColor: COLORS.backgroundCard, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
  progressText: { color: COLORS.textMuted, fontSize: 12, marginTop: 8, textAlign: 'center' },
  stepContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  fullImage: { width: width - 40, height: width * 1.2, maxHeight: 500 },
  rulesScroll: { flex: 1, width: '100%' },
  rulesImage: { width: width - 40, height: width * 1.8, alignSelf: 'center' },
  checkboxContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    marginTop: 20,
    paddingVertical: 16,
  },
  checkbox: { 
    width: 28, 
    height: 28, 
    borderRadius: 6, 
    borderWidth: 2, 
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.primary },
  checkboxLabel: { color: COLORS.textPrimary, fontSize: 16 },
  guidelinesScroll: { flex: 1 },
  guidelinesContent: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 80, height: 80, borderRadius: 40, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.textPrimary },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginTop: 4 },
  warningBanner: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12, 
    backgroundColor: 'rgba(234,179,8,0.15)', 
    padding: 16, 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gold,
    marginBottom: 20,
  },
  warningText: { flex: 1, color: COLORS.gold, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  guidelineCard: { 
    flexDirection: 'row', 
    backgroundColor: COLORS.backgroundCard, 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12 
  },
  guidelineIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: COLORS.backgroundLight, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  guidelineContent: { flex: 1, marginLeft: 12 },
  guidelineTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  guidelineDesc: { fontSize: 14, color: COLORS.textMuted, marginTop: 4, lineHeight: 20 },
  importantBox: { 
    backgroundColor: 'rgba(239,68,68,0.15)', 
    padding: 20, 
    borderRadius: 12, 
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  importantTitle: { fontSize: 16, fontWeight: '800', color: COLORS.error, marginBottom: 8 },
  importantText: { color: COLORS.textSecondary, lineHeight: 22 },
  premiumInfo: { 
    alignItems: 'center', 
    backgroundColor: 'rgba(234,179,8,0.1)', 
    padding: 24, 
    borderRadius: 16, 
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  premiumTitle: { fontSize: 20, fontWeight: '700', color: COLORS.gold, marginTop: 12 },
  premiumDesc: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 22 },
  contestPreview: { width: '100%', height: 300, marginTop: 20, borderRadius: 12 },
  previewLabel: { color: COLORS.textMuted, textAlign: 'center', marginTop: 8, fontSize: 13 },
  footer: { 
    flexDirection: 'row', 
    padding: 20, 
    gap: 12,
    borderTopWidth: 1, 
    borderTopColor: COLORS.backgroundCard 
  },
  backBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundCard,
  },
  backText: { color: COLORS.textPrimary, fontWeight: '600' },
  nextBtn: { 
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    backgroundColor: COLORS.primary, 
    paddingVertical: 16, 
    borderRadius: 12 
  },
  nextBtnDisabled: { backgroundColor: COLORS.backgroundCard },
  nextText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
});
