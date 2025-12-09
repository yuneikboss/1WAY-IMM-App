import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, Alert, TextInput, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from './constants/colors';
import { IMAGES } from './constants/images';
import MiniPlayer from './components/MiniPlayer';
import BottomNav from './components/BottomNav';
import { useApp } from './context/AppContext';
import { useAuth } from './context/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, following, favorites, wallet, posts, addPost } = useApp();
  const { profile, updateProfile, logout, uploadMedia, removeMedia, notifications, getUnreadCount } = useAuth();
  const [activeTab, setActiveTab] = useState<'posts' | 'music' | 'videos' | 'pictures'>('posts');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [editName, setEditName] = useState(profile?.displayName || 'Artist');
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [editCity, setEditCity] = useState(profile?.city || '');
  const [editState, setEditState] = useState(profile?.state || '');

  const handleCreateContent = (type: 'post' | 'reel' | 'story') => {
    addPost({ artistId: user?.artistId || '', type, content: `New ${type} created!` });
    Alert.alert('Content Created', `Your ${type} has been published!`);
  };

  const handleUpload = (type: 'music' | 'video' | 'picture') => {
    const mockUri = `file://mock_${type}_${Date.now()}`;
    const mockName = `${type}_${Date.now()}.${type === 'music' ? 'mp3' : type === 'video' ? 'mp4' : 'jpg'}`;
    const mockSize = type === 'music' ? 5000000 : type === 'video' ? 20000000 : 2000000;
    
    Alert.alert(
      `Upload ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      'Select a file to upload',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upload', 
          onPress: () => {
            uploadMedia(type, mockUri, mockName, mockSize);
            Alert.alert('Success', `${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
          }
        }
      ]
    );
  };

  const handleProfilePicture = () => {
    Alert.alert('Profile Picture', 'Update your profile picture', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Update', 
        onPress: () => {
          updateProfile({ profileImage: IMAGES.artists[Math.floor(Math.random() * IMAGES.artists.length)] });
          Alert.alert('Success', 'Profile picture updated!');
        }
      }
    ]);
  };

  const handleSaveProfile = () => {
    updateProfile({ displayName: editName, bio: editBio, city: editCity, state: editState });
    setShowEditModal(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/onboarding'); }}
    ]);
  };

  const handleDeleteMedia = (type: 'music' | 'video' | 'picture', id: string, name: string) => {
    Alert.alert('Delete', `Delete ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { removeMedia(type, id); Alert.alert('Deleted', 'File removed'); }},
    ]);
  };

  const userPosts = posts.filter(p => p.artistId === user?.artistId);
  const isPremium = profile?.isPremium;
  const storagePercent = profile ? (profile.storageUsed / profile.storageLimit) * 100 : 0;
  const storageUsedGB = profile ? (profile.storageUsed / (1024 * 1024 * 1024)).toFixed(2) : '0';
  const storageLimitGB = profile ? (profile.storageLimit / (1024 * 1024 * 1024)).toFixed(0) : '5';
  const unreadCount = getUnreadCount();

  const renderMediaGrid = () => {
    if (activeTab === 'posts') {
      return userPosts.length === 0 ? (
        <View style={styles.emptyContent}>
          <Ionicons name="images-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No posts yet</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => handleCreateContent('post')}>
            <Text style={styles.createText}>Create Post</Text>
          </TouchableOpacity>
        </View>
      ) : userPosts.map(post => (
        <View key={post.id} style={styles.postCard}>
          <Text style={styles.postContent}>{post.content}</Text>
          <View style={styles.postStats}>
            <Text style={styles.postStat}>{post.likes} likes</Text>
            <Text style={styles.postStat}>{post.comments} comments</Text>
          </View>
        </View>
      ));
    }

    const mediaList = activeTab === 'music' ? profile?.uploadedMusic || [] : activeTab === 'videos' ? profile?.uploadedVideos || [] : profile?.uploadedPictures || [];

    if (mediaList.length === 0) {
      return (
        <View style={styles.emptyContent}>
          <Ionicons name={activeTab === 'music' ? 'musical-notes-outline' : activeTab === 'videos' ? 'videocam-outline' : 'images-outline'} size={48} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No {activeTab} yet</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => handleUpload(activeTab === 'music' ? 'music' : activeTab === 'videos' ? 'video' : 'picture')}>
            <Text style={styles.createText}>Upload {activeTab.slice(0, -1)}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.mediaGrid}>
        {mediaList.map(item => (
          <TouchableOpacity key={item.id} style={styles.mediaItem} onLongPress={() => handleDeleteMedia(item.type, item.id, item.name)}>
            <View style={styles.mediaPlaceholder}>
              <Ionicons name={item.type === 'music' ? 'musical-notes' : item.type === 'video' ? 'videocam' : 'image'} size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.mediaName} numberOfLines={1}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setShowNotifications(true)} style={styles.notifBtn}>
              <Ionicons name="notifications" size={24} color={COLORS.primary} />
              {unreadCount > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEditModal(true)}><Ionicons name="create" size={24} color={COLORS.primary} /></TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/messages')}><Ionicons name="chatbubbles" size={24} color={COLORS.primary} /></TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleProfilePicture}>
            <Image source={{ uri: profile?.profileImage || IMAGES.artists[0] }} style={styles.avatar} />
            <View style={styles.editAvatarBtn}><Ionicons name="camera" size={16} color={COLORS.textPrimary} /></View>
          </TouchableOpacity>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{profile?.displayName || 'Artist'}</Text>
            {isPremium && <View style={styles.premiumBadge}><Ionicons name="diamond" size={14} color={COLORS.gold} /></View>}
          </View>
          <Text style={styles.userType}>{profile?.isArtist ? 'Artist Account' : 'Fan Account'}</Text>
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : <TouchableOpacity onPress={() => setShowEditModal(true)}><Text style={styles.addBio}>+ Add bio</Text></TouchableOpacity>}
          {(profile?.city || profile?.state) && <View style={styles.locationRow}><Ionicons name="location" size={14} color={COLORS.textMuted} /><Text style={styles.locationText}>{[profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ')}</Text></View>}
          <View style={styles.stats}>
            <View style={styles.stat}><Text style={styles.statValue}>{following.length}</Text><Text style={styles.statLabel}>Following</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>{favorites.length}</Text><Text style={styles.statLabel}>Favorites</Text></View>
            <View style={styles.stat}><Text style={styles.statValue}>${wallet.balance.toFixed(0)}</Text><Text style={styles.statLabel}>Balance</Text></View>
          </View>
        </View>

        {!isPremium && (
          <TouchableOpacity style={styles.premiumBanner} onPress={() => router.push('/premium')}>
            <Ionicons name="diamond" size={24} color={COLORS.gold} />
            <View style={styles.premiumBannerContent}><Text style={styles.premiumBannerTitle}>Upgrade to Premium</Text><Text style={styles.premiumBannerDesc}>$12/year - Unlock all features</Text></View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        )}

        <View style={styles.storageCard}>
          <View style={styles.storageHeader}><Ionicons name="cloud" size={20} color={COLORS.primary} /><Text style={styles.storageTitle}>Storage</Text><Text style={styles.storageValue}>{storageUsedGB}GB / {storageLimitGB}GB</Text></View>
          <View style={styles.storageBar}><View style={[styles.storageProgress, { width: `${Math.min(storagePercent, 100)}%` }]} /></View>
        </View>

        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Upload Content</Text>
          <View style={styles.uploadBtns}>
            <TouchableOpacity style={styles.uploadBtn} onPress={() => handleUpload('music')}><Ionicons name="musical-note" size={20} color={COLORS.textPrimary} /><Text style={styles.uploadText}>Music</Text></TouchableOpacity>
            <TouchableOpacity style={styles.uploadBtn} onPress={() => handleUpload('video')}><Ionicons name="videocam" size={20} color={COLORS.textPrimary} /><Text style={styles.uploadText}>Video</Text></TouchableOpacity>
            <TouchableOpacity style={styles.uploadBtn} onPress={() => handleUpload('picture')}><Ionicons name="image" size={20} color={COLORS.textPrimary} /><Text style={styles.uploadText}>Picture</Text></TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabs}>
          {(['posts', 'music', 'videos', 'pictures'] as const).map(tab => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Ionicons name={tab === 'posts' ? 'grid' : tab === 'music' ? 'musical-notes' : tab === 'videos' ? 'videocam' : 'images'} size={18} color={activeTab === tab ? COLORS.textPrimary : COLORS.textMuted} />
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.contentGrid}>{renderMediaGrid()}</View>

        <View style={styles.menuSection}>
          {[{ icon: 'wallet', label: 'Wallet', route: '/wallet' }, { icon: 'mic', label: 'Virtual Mics', route: '/microphones' }, { icon: 'sparkles', label: '1WAY AI', route: '/ai-assistant' }, { icon: 'diamond', label: 'Premium', route: '/premium' }, { icon: 'storefront', label: '1Way Store', route: '/store' }, { icon: 'musical-notes', label: 'Music Booth', route: '/booth' }, { icon: 'trophy', label: 'Contests', route: '/contests' }, { icon: 'globe', label: 'Global Stats', route: '/global-stats' }].map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={() => router.push(item.route as any)}><Ionicons name={item.icon as any} size={22} color={COLORS.primary} /><Text style={styles.menuText}>{item.label}</Text><Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} /></TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}><Ionicons name="log-out" size={22} color={COLORS.error} /><Text style={[styles.menuText, styles.logoutText]}>Logout</Text><Ionicons name="chevron-forward" size={20} color={COLORS.error} /></TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Edit Profile</Text><TouchableOpacity onPress={() => setShowEditModal(false)}><Ionicons name="close" size={24} color={COLORS.textPrimary} /></TouchableOpacity></View>
            <ScrollView style={styles.modalScroll}>
              <TouchableOpacity style={styles.editAvatarSection} onPress={handleProfilePicture}><Image source={{ uri: profile?.profileImage || IMAGES.artists[0] }} style={styles.editAvatar} /><Text style={styles.changePhotoText}>Change Photo</Text></TouchableOpacity>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Display Name</Text><TextInput style={styles.textInput} value={editName} onChangeText={setEditName} placeholder="Your name" placeholderTextColor={COLORS.textMuted} /></View>
              <View style={styles.inputGroup}><Text style={styles.inputLabel}>Bio</Text><TextInput style={[styles.textInput, styles.bioInput]} value={editBio} onChangeText={setEditBio} placeholder="Tell us about yourself..." placeholderTextColor={COLORS.textMuted} multiline numberOfLines={4} /></View>
              <View style={styles.inputRow}><View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>City</Text><TextInput style={styles.textInput} value={editCity} onChangeText={setEditCity} placeholder="City" placeholderTextColor={COLORS.textMuted} /></View><View style={[styles.inputGroup, { flex: 1 }]}><Text style={styles.inputLabel}>State</Text><TextInput style={styles.textInput} value={editState} onChangeText={setEditState} placeholder="State" placeholderTextColor={COLORS.textMuted} /></View></View>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}><Text style={styles.saveBtnText}>Save Changes</Text></TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showNotifications} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Notifications</Text><TouchableOpacity onPress={() => setShowNotifications(false)}><Ionicons name="close" size={24} color={COLORS.textPrimary} /></TouchableOpacity></View>
            <FlatList data={notifications} keyExtractor={item => item.id} renderItem={({ item }) => (
              <View style={[styles.notifItem, !item.read && styles.notifUnread]}>
                <View style={styles.notifIcon}><Ionicons name={item.type === 'vote' ? 'heart' : item.type === 'elimination' ? 'trending-down' : item.type === 'advance' ? 'trending-up' : item.type === 'winner' ? 'trophy' : 'notifications'} size={20} color={item.type === 'vote' ? COLORS.error : item.type === 'elimination' ? COLORS.error : item.type === 'advance' ? COLORS.success : item.type === 'winner' ? COLORS.gold : COLORS.primary} /></View>
                <View style={styles.notifContent}><Text style={styles.notifTitle}>{item.title}</Text><Text style={styles.notifMessage}>{item.message}</Text><Text style={styles.notifTime}>{new Date(item.timestamp).toLocaleDateString()}</Text></View>
              </View>
            )} ListEmptyComponent={<View style={styles.emptyNotif}><Ionicons name="notifications-off" size={48} color={COLORS.textMuted} /><Text style={styles.emptyNotifText}>No notifications yet</Text></View>} />
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
  content: { paddingBottom: 180 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerActions: { flexDirection: 'row', gap: 16 },
  title: { fontSize: 32, fontWeight: '800', color: COLORS.textPrimary },
  notifBtn: { position: 'relative' },
  notifBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.error, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { color: COLORS.textPrimary, fontSize: 10, fontWeight: '700' },
  profileCard: { alignItems: 'center', padding: 20 },
  avatarContainer: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: COLORS.primary },
  editAvatarBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  userName: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  premiumBadge: { backgroundColor: 'rgba(234,179,8,0.2)', padding: 4, borderRadius: 8 },
  userType: { fontSize: 14, color: COLORS.textMuted },
  bio: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 20, lineHeight: 20 },
  addBio: { color: COLORS.primary, marginTop: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  locationText: { color: COLORS.textMuted, fontSize: 13 },
  stats: { flexDirection: 'row', gap: 40, marginTop: 20 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  statLabel: { fontSize: 12, color: COLORS.textMuted },
  premiumBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(234,179,8,0.1)', marginHorizontal: 20, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gold },
  premiumBannerContent: { flex: 1, marginLeft: 12 },
  premiumBannerTitle: { color: COLORS.gold, fontWeight: '700', fontSize: 16 },
  premiumBannerDesc: { color: COLORS.textMuted, fontSize: 13 },
  storageCard: { backgroundColor: COLORS.backgroundCard, marginHorizontal: 20, marginTop: 16, padding: 16, borderRadius: 12 },
  storageHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  storageTitle: { flex: 1, color: COLORS.textPrimary, fontWeight: '600' },
  storageValue: { color: COLORS.textMuted, fontSize: 13 },
  storageBar: { height: 6, backgroundColor: COLORS.backgroundLight, borderRadius: 3, marginTop: 12 },
  storageProgress: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  uploadSection: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  uploadBtns: { flexDirection: 'row', gap: 12 },
  uploadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary, paddingVertical: 12, borderRadius: 12 },
  uploadText: { color: COLORS.textPrimary, fontWeight: '600' },
  tabs: { flexDirection: 'row', paddingHorizontal: 20, gap: 8 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 10, borderRadius: 12, backgroundColor: COLORS.backgroundCard },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { color: COLORS.textMuted, fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: COLORS.textPrimary },
  contentGrid: { padding: 20 },
  emptyContent: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: COLORS.textMuted, marginTop: 12 },
  createBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, marginTop: 16 },
  createText: { color: COLORS.textPrimary, fontWeight: '600' },
  postCard: { backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginBottom: 12 },
  postContent: { color: COLORS.textPrimary },
  postStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  postStat: { color: COLORS.textMuted, fontSize: 12 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  mediaItem: { width: '31%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: COLORS.backgroundCard },
  mediaPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mediaName: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 4, color: COLORS.textPrimary, fontSize: 10, textAlign: 'center' },
  menuSection: { padding: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.backgroundCard, padding: 16, borderRadius: 12, marginBottom: 8 },
  menuText: { flex: 1, color: COLORS.textPrimary, fontSize: 16, marginLeft: 12 },
  logoutItem: { marginTop: 8 },
  logoutText: { color: COLORS.error },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.backgroundCard },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  modalScroll: { padding: 20 },
  editAvatarSection: { alignItems: 'center', marginBottom: 24 },
  editAvatar: { width: 100, height: 100, borderRadius: 50 },
  changePhotoText: { color: COLORS.primary, marginTop: 8, fontWeight: '600' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { color: COLORS.textSecondary, fontSize: 14, marginBottom: 8 },
  textInput: { backgroundColor: COLORS.backgroundCard, borderRadius: 12, padding: 16, color: COLORS.textPrimary, fontSize: 16 },
  bioInput: { height: 100, textAlignVertical: 'top' },
  inputRow: { flexDirection: 'row', gap: 12 },
  saveBtn: { backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8, marginBottom: 40 },
  saveBtnText: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  notifItem: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.backgroundCard },
  notifUnread: { backgroundColor: 'rgba(139,92,246,0.1)' },
  notifIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.backgroundCard, justifyContent: 'center', alignItems: 'center' },
  notifContent: { flex: 1, marginLeft: 12 },
  notifTitle: { color: COLORS.textPrimary, fontWeight: '600' },
  notifMessage: { color: COLORS.textMuted, fontSize: 13, marginTop: 4 },
  notifTime: { color: COLORS.textMuted, fontSize: 11, marginTop: 4 },
  emptyNotif: { alignItems: 'center', paddingVertical: 60 },
  emptyNotifText: { color: COLORS.textMuted, marginTop: 12 },
});
