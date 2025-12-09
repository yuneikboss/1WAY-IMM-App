import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, Alert, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { CONTESTS } from './data/contests';
import { ARTISTS } from './data/artists';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';

const CONTEST_RULES = [
  { title: 'Entry', desc: 'Upload a video of your best performance in any music genre starting January 1st.' },
  { title: 'Elimination Process', desc: 'January 1-25: Top 80 artists with the most likes and views move on.\nJanuary 26-February 25: Top 40 artists continue.\nFebruary 26-March 25: Top 30 artists proceed.\nMarch 26-April 25: Top 20 artists advance.\nApril 26-May 25: Top 10 artists remain.\nMay 26-June 26: One winner is selected.' },
  { title: 'Monthly Uploads', desc: 'New performance videos must be uploaded each month to stay in the contest. Likes and views from all videos determine progression.' },
  { title: 'Voting System', desc: 'Fans can vote up to 5 times per day per contest. Votes reset daily at midnight.' },
  { title: 'Prize Distribution', desc: 'Grand prize: Vacation for two OR $5000 cash. Runner-ups receive recognition badges.' },
  { title: 'Disqualification', desc: 'Copyright violations, vote manipulation, or rule breaking results in immediate disqualification.' },
];

const ELIMINATION_SCHEDULE = [
  { month: 'Jan 1-25', action: 'Open submissions', remaining: 'Top 80', icon: 'musical-notes' },
  { month: 'Jan 26-Feb 25', action: 'First elimination', remaining: 'Top 40', icon: 'trending-down' },
  { month: 'Feb 26-Mar 25', action: 'Second elimination', remaining: 'Top 30', icon: 'trending-down' },
  { month: 'Mar 26-Apr 25', action: 'Third elimination', remaining: 'Top 20', icon: 'trending-down' },
  { month: 'Apr 26-May 25', action: 'Semi-finals', remaining: 'Top 10', icon: 'flame' },
  { month: 'May 26-Jun 26', action: 'Finals & Winner', remaining: '1 Winner', icon: 'trophy' },
];

type TabType = 'contests' | 'leaderboard' | 'my-votes';
type LeaderboardFilter = 'top10' | 'top50' | 'top100';

export default function ContestsScreen() {
  const router = useRouter();
  const { wallet } = useApp();
  const { 
    profile, 
    voteForArtist, 
    getVotesForArtist, 
    getRemainingVotes,
    addNotification,
    votes,
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('contests');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showRules, setShowRules] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState<typeof CONTESTS[0] | null>(null);
  const [enteredContests, setEnteredContests] = useState<string[]>([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState<LeaderboardFilter>('top10');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const categories = ['All', 'Beat Makers', 'Freestylers', 'Ghost Writers', 'Featured Artists'];
  const filteredContests = selectedCategory === 'All' ? CONTESTS : CONTESTS.filter(c => c.category === selectedCategory);

  const currentSeason = new Date().getMonth() < 6 ? 'Spring Season (Jan-Jun)' : 'Fall Season (Jul-Dec)';
  const currentMonth = new Date().getMonth() % 6 + 1;

  const handleEnter = (contest: typeof CONTESTS[0]) => {
    if (enteredContests.includes(contest.id)) {
      Alert.alert('Already Entered', 'You have already entered this contest!');
      return;
    }

    Alert.alert(
      'Enter Contest',
      `${contest.title}\n\nEntry: FREE\nPrize: $${contest.prize.toLocaleString()}\n\nYou'll need to upload your music after entering.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Enter Now', 
          onPress: () => {
            setEnteredContests([...enteredContests, contest.id]);
            addNotification({
              type: 'system',
              title: 'Contest Entry Confirmed!',
              message: `You've entered ${contest.title}. Upload your music to complete your entry.`,
            });
            Alert.alert(
              'Entered!', 
              `You're now competing in ${contest.title}!\n\nUpload your music to complete your entry.`,
              [{ text: 'Upload Music', onPress: () => router.push('/booth') }]
            );
          }
        }
      ]
    );
  };

  const handleVote = async (artistId: string) => {
    if (!selectedContest) return;
    
    const remaining = getRemainingVotes(selectedContest.id);
    if (remaining <= 0) {
      Alert.alert('Vote Limit Reached', 'You have used all your votes for today. Come back tomorrow!');
      return;
    }

    const success = await voteForArtist(selectedContest.id, artistId);
    if (success) {
      const artist = ARTISTS.find(a => a.id === artistId);
      addNotification({
        type: 'vote',
        title: 'Vote Recorded!',
        message: `Your vote for ${artist?.name || 'artist'} has been counted. ${remaining - 1} votes remaining today.`,
      });
    }
  };

  const openVoteModal = (contest: typeof CONTESTS[0]) => {
    setSelectedContest(contest);
    setShowVoteModal(true);
  };

  // Get sorted leaderboard
  const getLeaderboard = (contestId: string) => {
    return ARTISTS.map(artist => ({
      ...artist,
      votes: getVotesForArtist(contestId, artist.id),
    }))
    .sort((a, b) => b.votes - a.votes)
    .slice(0, leaderboardFilter === 'top10' ? 10 : leaderboardFilter === 'top50' ? 50 : 100);
  };

  const renderContestsTab = () => (
    <>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{CONTESTS.length}</Text>
          <Text style={styles.statLabel}>Active Contests</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{enteredContests.length}</Text>
          <Text style={styles.statLabel}>Your Entries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>$50K+</Text>
          <Text style={styles.statLabel}>Total Prizes</Text>
        </View>
      </View>

      {filteredContests.map(contest => {
        const isEntered = enteredContests.includes(contest.id);
        const remainingVotes = getRemainingVotes(contest.id);
        
        return (
          <View key={contest.id} style={styles.contestCard}>
            <Image source={{ uri: contest.image }} style={styles.contestImage} />
            {isEntered && (
              <View style={styles.enteredBadge}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.textPrimary} />
                <Text style={styles.enteredText}>ENTERED</Text>
              </View>
            )}
            <View style={styles.contestInfo}>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{contest.category}</Text>
              </View>
              <Text style={styles.contestTitle}>{contest.title}</Text>
              <Text style={styles.contestDesc}>{contest.description}</Text>
              
              <View style={styles.contestStats}>
                <View style={styles.stat}>
                  <Ionicons name="trophy" size={16} color={COLORS.gold} />
                  <Text style={styles.statText}>${contest.prize.toLocaleString()}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="people" size={16} color={COLORS.textMuted} />
                  <Text style={styles.statText}>{contest.participants}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="time" size={16} color={COLORS.error} />
                  <Text style={styles.statText}>{contest.deadline}</Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>Elimination Progress</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(currentMonth / 6) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>Round {currentMonth} of 6</Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.voteBtn]} 
                  onPress={() => openVoteModal(contest)}
                >
                  <Ionicons name="heart" size={18} color={COLORS.textPrimary} />
                  <Text style={styles.voteBtnText}>Vote ({remainingVotes}/5)</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.enterBtn, isEntered && styles.enteredBtn]} 
                  onPress={() => handleEnter(contest)}
                  disabled={isEntered}
                >
                  <Text style={styles.enterText}>{isEntered ? 'Entered' : 'Enter'}</Text>
                  {!isEntered && <Ionicons name="arrow-forward" size={18} color={COLORS.textPrimary} />}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}

      <TouchableOpacity style={styles.recordBtn} onPress={() => router.push('/booth')}>
        <View style={styles.recordDot} />
        <Text style={styles.recordText}>Record a track</Text>
      </TouchableOpacity>
    </>
  );

  const renderLeaderboardTab = () => {
    const contest = CONTESTS[0];
    const leaderboard = getLeaderboard(contest.id);

    return (
      <>
        <View style={styles.leaderboardHeader}>
          <Text style={styles.leaderboardTitle}>Leaderboard</Text>
          <View style={styles.filterRow}>
            {(['top10', 'top50', 'top100'] as LeaderboardFilter[]).map(filter => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterBtn, leaderboardFilter === filter && styles.filterBtnActive]}
                onPress={() => setLeaderboardFilter(filter)}
              >
                <Ionicons name="podium" size={14} color={leaderboardFilter === filter ? COLORS.textPrimary : COLORS.textMuted} />
                <Text style={[styles.filterText, leaderboardFilter === filter && styles.filterTextActive]}>
                  {filter === 'top10' ? 'Top 10' : filter === 'top50' ? 'Top 50' : 'Top 100'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="location" size={14} color={COLORS.textMuted} />
              <Text style={styles.filterText}>City</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterBtn}>
              <Ionicons name="musical-notes" size={14} color={COLORS.textMuted} />
              <Text style={styles.filterText}>Genre</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Top 3 Podium */}
        <View style={styles.podium}>
          {leaderboard.slice(0, 3).map((artist, index) => (
            <TouchableOpacity 
              key={artist.id} 
              style={[
                styles.podiumItem,
                index === 0 && styles.podiumFirst,
                index === 1 && styles.podiumSecond,
                index === 2 && styles.podiumThird,
              ]}
              onPress={() => router.push(`/artist/${artist.id}`)}
            >
              {index === 0 && (
                <View style={styles.crownContainer}>
                  <Ionicons name="trophy" size={24} color={COLORS.gold} />
                </View>
              )}
              <Image source={{ uri: artist.image }} style={styles.podiumImage} />
              <Text style={styles.podiumName} numberOfLines={1}>{artist.name}</Text>
              <Text style={styles.podiumVotes}>{artist.votes.toLocaleString()} votes</Text>
              <View style={[styles.rankBadge, index === 0 && styles.rankFirst, index === 1 && styles.rankSecond, index === 2 && styles.rankThird]}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rest of leaderboard */}
        <View style={styles.leaderboardList}>
          {leaderboard.slice(3).map((artist, index) => (
            <TouchableOpacity 
              key={artist.id} 
              style={styles.leaderboardItem}
              onPress={() => router.push(`/artist/${artist.id}`)}
            >
              <Text style={styles.leaderboardRank}>{index + 4}</Text>
              <Image source={{ uri: artist.image }} style={styles.leaderboardImage} />
              <View style={styles.leaderboardInfo}>
                <Text style={styles.leaderboardName}>{artist.name}</Text>
                <Text style={styles.leaderboardCategory}>{artist.category}</Text>
              </View>
              <View style={styles.leaderboardVotes}>
                <Text style={styles.leaderboardVoteCount}>{artist.votes.toLocaleString()}</Text>
                <Text style={styles.leaderboardVoteLabel}>votes</Text>
              </View>
              <TouchableOpacity 
                style={styles.quickVoteBtn}
                onPress={() => handleVote(artist.id)}
              >
                <Ionicons name="heart" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  };

  const renderMyVotesTab = () => {
    const userVotes = votes.filter(v => v.userId === profile?.id);
    const votedArtists = [...new Set(userVotes.map(v => v.artistId))];

    return (
      <View style={styles.myVotesContainer}>
        <View style={styles.voteSummary}>
          <Text style={styles.voteSummaryTitle}>Your Voting Activity</Text>
          <Text style={styles.voteSummaryCount}>{userVotes.length} total votes cast</Text>
        </View>

        {votedArtists.length === 0 ? (
          <View style={styles.emptyVotes}>
            <Ionicons name="heart-outline" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyVotesText}>You haven't voted yet</Text>
            <Text style={styles.emptyVotesSubtext}>Vote for your favorite artists to help them win!</Text>
            <TouchableOpacity 
              style={styles.startVotingBtn}
              onPress={() => setActiveTab('leaderboard')}
            >
              <Text style={styles.startVotingText}>Start Voting</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.votedArtistsList}>
            {votedArtists.map(artistId => {
              const artist = ARTISTS.find(a => a.id === artistId);
              const artistVotes = userVotes.filter(v => v.artistId === artistId);
              if (!artist) return null;

              return (
                <View key={artistId} style={styles.votedArtistCard}>
                  <Image source={{ uri: artist.image }} style={styles.votedArtistImage} />
                  <View style={styles.votedArtistInfo}>
                    <Text style={styles.votedArtistName}>{artist.name}</Text>
                    <Text style={styles.votedArtistCategory}>{artist.category}</Text>
                  </View>
                  <View style={styles.votedCount}>
                    <Ionicons name="heart" size={16} color={COLORS.error} />
                    <Text style={styles.votedCountText}>{artistVotes.length}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Contests</Text>
        <TouchableOpacity onPress={() => setShowRules(true)}>
          <Ionicons name="information-circle" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.seasonBanner}>
        <Ionicons name="trophy" size={24} color={COLORS.gold} />
        <View style={styles.seasonInfo}>
          <Text style={styles.seasonTitle}>{currentSeason}</Text>
          <Text style={styles.seasonMonth}>Month {currentMonth} of 6</Text>
        </View>
        <TouchableOpacity style={styles.scheduleBtn} onPress={() => setShowSchedule(true)}>
          <Ionicons name="calendar" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[
          { id: 'contests', label: 'Contests', icon: 'trophy' },
          { id: 'leaderboard', label: 'Leaderboard', icon: 'podium' },
          { id: 'my-votes', label: 'My Votes', icon: 'heart' },
        ].map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id as TabType)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={18} 
              color={activeTab === tab.id ? COLORS.textPrimary : COLORS.textMuted} 
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'contests' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories} contentContainerStyle={styles.categoriesContent}>
          {categories.map(cat => (
            <TouchableOpacity key={cat} style={[styles.categoryBtn, selectedCategory === cat && styles.categoryActive]} onPress={() => setSelectedCategory(cat)}>
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {activeTab === 'contests' && renderContestsTab()}
        {activeTab === 'leaderboard' && renderLeaderboardTab()}
        {activeTab === 'my-votes' && renderMyVotesTab()}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Contests are FREE to enter. Bi-annual competitions with monthly eliminations. 
            Vote up to 5 times per day for your favorite artists!
          </Text>
        </View>
      </ScrollView>

      {/* Vote Modal */}
      <Modal visible={showVoteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.voteModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vote for Artist</Text>
              <TouchableOpacity onPress={() => setShowVoteModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.votesRemaining}>
              <Ionicons name="heart" size={24} color={COLORS.error} />
              <Text style={styles.votesRemainingText}>
                {selectedContest ? getRemainingVotes(selectedContest.id) : 0} votes remaining today
              </Text>
            </View>

            <FlatList
              data={ARTISTS.slice(0, 10)}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.voteArtistItem}
                  onPress={() => {
                    handleVote(item.id);
                    setShowVoteModal(false);
                  }}
                >
                  <Image source={{ uri: item.image }} style={styles.voteArtistImage} />
                  <View style={styles.voteArtistInfo}>
                    <Text style={styles.voteArtistName}>{item.name}</Text>
                    <Text style={styles.voteArtistVotes}>
                      {selectedContest ? getVotesForArtist(selectedContest.id, item.id).toLocaleString() : 0} votes
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.voteButton}>
                    <Ionicons name="heart" size={24} color={COLORS.error} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Rules Modal */}
      <Modal visible={showRules} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contest Rules</Text>
              <TouchableOpacity onPress={() => setShowRules(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.rulesList}>
              {CONTEST_RULES.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <View style={styles.ruleNumber}>
                    <Text style={styles.ruleNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.ruleContent}>
                    <Text style={styles.ruleTitle}>{rule.title}</Text>
                    <Text style={styles.ruleDesc}>{rule.desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Schedule Modal */}
      <Modal visible={showSchedule} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Elimination Schedule</Text>
              <TouchableOpacity onPress={() => setShowSchedule(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.scheduleList}>
              {ELIMINATION_SCHEDULE.map((item, index) => (
                <View key={index} style={[styles.scheduleItem, index + 1 === currentMonth && styles.scheduleItemActive]}>
                  <View style={[styles.scheduleIndicator, index + 1 <= currentMonth && styles.scheduleIndicatorActive]}>
                    <Ionicons name={item.icon as any} size={16} color={index + 1 <= currentMonth ? COLORS.textPrimary : COLORS.textMuted} />
                  </View>
                  <View style={styles.scheduleContent}>
                    <Text style={styles.scheduleMonth}>{item.month}</Text>
                    <Text style={styles.scheduleAction}>{item.action}</Text>
                    <Text style={styles.scheduleRemaining}>{item.remaining}</Text>
                  </View>
                  {index + 1 === currentMonth && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>NOW</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <MiniPlayer />
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  seasonBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(234,179,8,0.1)', marginHorizontal: 20, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gold },
  seasonInfo: { flex: 1, marginLeft: 12 },
  seasonTitle: { color: COLORS.gold, fontWeight: '700', fontSize: 16 },
  seasonMonth: { color: COLORS.textMuted, fontSize: 13 },
  scheduleBtn: { padding: 8 },
  tabs: { flexDirection: 'row', marginHorizontal: 20, marginTop: 16, gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, backgroundColor: COLORS.backgroundCard, borderRadius: 12 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: COLORS.textPrimary },
  categories: { maxHeight: 50, marginTop: 16 },
  categoriesContent: { paddingHorizontal: 20, gap: 10 },
  categoryBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.backgroundCard },
  categoryActive: { backgroundColor: COLORS.primary },
  categoryText: { color: COLORS.textMuted, fontWeight: '600' },
  categoryTextActive: { color: COLORS.textPrimary },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 180 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, alignItems: 'center' },
  statNumber: { color: COLORS.primary, fontSize: 24, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  contestCard: { backgroundColor: COLORS.backgroundCard, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  contestImage: { width: '100%', height: 150 },
  enteredBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.success, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  enteredText: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '700' },
  contestInfo: { padding: 16 },
  categoryTag: { alignSelf: 'flex-start', backgroundColor: COLORS.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  categoryTagText: { color: COLORS.textPrimary, fontSize: 11, fontWeight: '600' },
  contestTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginTop: 8 },
  contestDesc: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  contestStats: { flexDirection: 'row', gap: 20, marginTop: 16 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
  progressSection: { marginTop: 16 },
  progressLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: COLORS.backgroundLight, borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: COLORS.gold, borderRadius: 3 },
  progressText: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  voteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.error, paddingVertical: 14, borderRadius: 12 },
  voteBtnText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  enterBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 12 },
  enteredBtn: { backgroundColor: COLORS.success },
  enterText: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '700' },
  recordBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.backgroundCard, paddingVertical: 16, borderRadius: 12, marginBottom: 20 },
  recordDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: COLORS.error },
  recordText: { color: COLORS.textPrimary, fontWeight: '600' },
  infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12 },
  infoText: { flex: 1, color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },
  // Leaderboard styles
  leaderboardHeader: { marginBottom: 20 },
  leaderboardTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.backgroundCard, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  filterBtnActive: { backgroundColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontSize: 13 },
  filterTextActive: { color: COLORS.textPrimary },
  podium: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 24, paddingHorizontal: 10 },
  podiumItem: { alignItems: 'center', width: 100 },
  podiumFirst: { marginBottom: 20 },
  podiumSecond: { marginRight: 10 },
  podiumThird: { marginLeft: 10 },
  crownContainer: { position: 'absolute', top: -30, zIndex: 1 },
  podiumImage: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: COLORS.gold },
  podiumName: { color: COLORS.textPrimary, fontWeight: '600', marginTop: 8, fontSize: 13 },
  podiumVotes: { color: COLORS.textMuted, fontSize: 11 },
  rankBadge: { position: 'absolute', bottom: 40, right: 10, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rankFirst: { backgroundColor: COLORS.gold },
  rankSecond: { backgroundColor: '#C0C0C0' },
  rankThird: { backgroundColor: '#CD7F32' },
  rankText: { color: COLORS.background, fontWeight: '700', fontSize: 12 },
  leaderboardList: { gap: 8 },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 12, borderRadius: 12 },
  leaderboardRank: { width: 30, color: COLORS.textMuted, fontWeight: '700', textAlign: 'center' },
  leaderboardImage: { width: 44, height: 44, borderRadius: 22 },
  leaderboardInfo: { flex: 1, marginLeft: 12 },
  leaderboardName: { color: COLORS.textPrimary, fontWeight: '600' },
  leaderboardCategory: { color: COLORS.textMuted, fontSize: 12 },
  leaderboardVotes: { alignItems: 'flex-end', marginRight: 12 },
  leaderboardVoteCount: { color: COLORS.textPrimary, fontWeight: '700' },
  leaderboardVoteLabel: { color: COLORS.textMuted, fontSize: 11 },
  quickVoteBtn: { padding: 8 },
  // My Votes styles
  myVotesContainer: { flex: 1 },
  voteSummary: { backgroundColor: COLORS.backgroundCard, padding: 20, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  voteSummaryTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  voteSummaryCount: { color: COLORS.textMuted, marginTop: 4 },
  emptyVotes: { alignItems: 'center', paddingVertical: 40 },
  emptyVotesText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyVotesSubtext: { color: COLORS.textMuted, marginTop: 8, textAlign: 'center' },
  startVotingBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 20 },
  startVotingText: { color: COLORS.textPrimary, fontWeight: '600' },
  votedArtistsList: { gap: 12 },
  votedArtistCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12 },
  votedArtistImage: { width: 50, height: 50, borderRadius: 25 },
  votedArtistInfo: { flex: 1, marginLeft: 12 },
  votedArtistName: { color: COLORS.textPrimary, fontWeight: '600' },
  votedArtistCategory: { color: COLORS.textMuted, fontSize: 13 },
  votedCount: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  votedCountText: { color: COLORS.error, fontWeight: '700' },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  voteModalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%', paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.backgroundCard },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  votesRemaining: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, backgroundColor: COLORS.backgroundCard },
  votesRemainingText: { color: COLORS.textPrimary, fontWeight: '600' },
  voteArtistItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.backgroundCard },
  voteArtistImage: { width: 50, height: 50, borderRadius: 25 },
  voteArtistInfo: { flex: 1, marginLeft: 12 },
  voteArtistName: { color: COLORS.textPrimary, fontWeight: '600' },
  voteArtistVotes: { color: COLORS.textMuted, fontSize: 13 },
  voteButton: { padding: 8 },
  rulesList: { padding: 20 },
  ruleItem: { flexDirection: 'row', marginBottom: 16 },
  ruleNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  ruleNumberText: { color: COLORS.textPrimary, fontWeight: '700' },
  ruleContent: { flex: 1, marginLeft: 12 },
  ruleTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 15 },
  ruleDesc: { color: COLORS.textMuted, fontSize: 13, marginTop: 4, lineHeight: 20 },
  scheduleList: { padding: 20 },
  scheduleItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingLeft: 12 },
  scheduleItemActive: { backgroundColor: 'rgba(139,92,246,0.1)', marginLeft: 0, paddingVertical: 12, borderRadius: 12 },
  scheduleIndicator: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.backgroundLight, marginRight: 16, justifyContent: 'center', alignItems: 'center' },
  scheduleIndicatorActive: { backgroundColor: COLORS.primary },
  scheduleContent: { flex: 1 },
  scheduleMonth: { color: COLORS.textPrimary, fontWeight: '700' },
  scheduleAction: { color: COLORS.textSecondary, fontSize: 14 },
  scheduleRemaining: { color: COLORS.textMuted, fontSize: 12 },
  currentBadge: { backgroundColor: COLORS.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  currentBadgeText: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '700' },
});
