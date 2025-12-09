import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Track, TRACKS } from '../data/tracks';
import { Message, Chat, Post, Transaction } from '../types';

interface Wallet {
  balance: number;
  credits: number;
  frozen: boolean;
}

interface AppState {
  currentTrack: Track | null;
  isPlaying: boolean;
  playlist: Track[];
  favorites: string[];
  following: string[];
  likedTracks: string[];
  dislikedTracks: string[];
  wallet: Wallet;
  user: { id: string; name: string; isArtist: boolean; artistId?: string; image?: string } | null;
  messages: Message[];
  chats: Chat[];
  posts: Post[];
  transactions: Transaction[];
}

interface AppContextType extends AppState {
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  toggleFavorite: (trackId: string) => void;
  toggleFollow: (artistId: string) => void;
  likeTrack: (trackId: string) => void;
  dislikeTrack: (trackId: string) => void;
  updateWallet: (amount: number) => void;
  useCredit: (amount: number) => void;
  setUser: (user: AppState['user']) => void;
  sendMessage: (receiverId: string, text: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp'>) => void;
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'dislikes' | 'comments'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentTrack: null,
    isPlaying: false,
    playlist: TRACKS.slice(0, 5),
    favorites: [],
    following: [],
    likedTracks: [],
    dislikedTracks: [],
    wallet: { balance: 250, credits: 0, frozen: false },
    user: { id: 'user1', name: 'Music Fan', isArtist: true, artistId: '1', image: '' },
    messages: [],
    chats: [],
    posts: [],
    transactions: [],
  });

  const playTrack = (track: Track) => setState(s => ({ ...s, currentTrack: track, isPlaying: true }));
  const togglePlay = () => setState(s => ({ ...s, isPlaying: !s.isPlaying }));
  const addToPlaylist = (track: Track) => setState(s => ({ ...s, playlist: [...s.playlist, track] }));
  const removeFromPlaylist = (trackId: string) => setState(s => ({ ...s, playlist: s.playlist.filter(t => t.id !== trackId) }));
  const toggleFavorite = (trackId: string) => setState(s => ({ ...s, favorites: s.favorites.includes(trackId) ? s.favorites.filter(id => id !== trackId) : [...s.favorites, trackId] }));
  const toggleFollow = (artistId: string) => setState(s => ({ ...s, following: s.following.includes(artistId) ? s.following.filter(id => id !== artistId) : [...s.following, artistId] }));
  const likeTrack = (trackId: string) => setState(s => ({ ...s, likedTracks: [...s.likedTracks.filter(id => id !== trackId), trackId], dislikedTracks: s.dislikedTracks.filter(id => id !== trackId) }));
  const dislikeTrack = (trackId: string) => setState(s => ({ ...s, dislikedTracks: [...s.dislikedTracks.filter(id => id !== trackId), trackId], likedTracks: s.likedTracks.filter(id => id !== trackId) }));
  const updateWallet = (amount: number) => setState(s => ({ ...s, wallet: { ...s.wallet, balance: s.wallet.balance + amount } }));
  const useCredit = (amount: number) => setState(s => ({ ...s, wallet: { ...s.wallet, credits: s.wallet.credits + amount, frozen: true } }));
  const setUser = (user: AppState['user']) => setState(s => ({ ...s, user }));
  const sendMessage = (receiverId: string, text: string) => {
    const msg: Message = { id: Date.now().toString(), senderId: state.user?.id || '', receiverId, text, timestamp: Date.now(), read: false };
    setState(s => ({ ...s, messages: [...s.messages, msg] }));
  };
  const addTransaction = (tx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTx: Transaction = { ...tx, id: Date.now().toString(), timestamp: Date.now() };
    setState(s => ({ ...s, transactions: [...s.transactions, newTx] }));
  };
  const addPost = (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'dislikes' | 'comments'>) => {
    const newPost: Post = { ...post, id: Date.now().toString(), timestamp: Date.now(), likes: 0, dislikes: 0, comments: 0 };
    setState(s => ({ ...s, posts: [...s.posts, newPost] }));
  };

  return (
    <AppContext.Provider value={{ ...state, playTrack, togglePlay, addToPlaylist, removeFromPlaylist, toggleFavorite, toggleFollow, likeTrack, dislikeTrack, updateWallet, useCredit, setUser, sendMessage, addTransaction, addPost }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
