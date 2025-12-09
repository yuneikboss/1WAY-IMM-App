import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'cashapp' | 'chime' | 'applepay' | 'bank';
  name: string;
  last4?: string;
  email?: string;
  routingNumber?: string;
  accountNumber?: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  displayName: string;
  bio: string;
  profileImage: string;
  coverImage: string;
  city: string;
  state: string;
  country: string;
  isPremium: boolean;
  premiumExpiry?: number;
  isArtist: boolean;
  ownedMics: string[];
  activeMic: string;
  storageUsed: number;
  storageLimit: number;
  createdAt: number;
  lastLogin: number;
  uploadedMusic: MediaItem[];
  uploadedVideos: MediaItem[];
  uploadedPictures: MediaItem[];
}

export interface MediaItem {
  id: string;
  uri: string;
  name: string;
  type: 'music' | 'video' | 'picture';
  size: number;
  uploadedAt: number;
}

export interface Receipt {
  id: string;
  type: 'purchase' | 'subscription' | 'payout' | 'deposit';
  amount: number;
  fee: number;
  description: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: number;
}

export interface Vote {
  id: string;
  contestId: string;
  artistId: string;
  userId: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  type: 'vote' | 'elimination' | 'advance' | 'winner' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  data?: any;
}

export interface ContestVotes {
  [artistId: string]: number;
}

interface AuthState {
  isAuthenticated: boolean;
  hasAcceptedGuidelines: boolean;
  hasSeenContestRules: boolean;
  isVerified: boolean;
  profile: UserProfile | null;
  paymentMethods: PaymentMethod[];
  receipts: Receipt[];
  votes: Vote[];
  notifications: Notification[];
  dailyVotesRemaining: { [contestId: string]: number };
  contestVotes: { [contestId: string]: ContestVotes };
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  acceptGuidelines: () => void;
  acceptContestRules: () => void;
  verifyEmail: (code: string) => Promise<boolean>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  purchasePremium: () => Promise<boolean>;
  purchaseMic: (micId: string, price: number) => Promise<boolean>;
  addFunds: (amount: number, methodId: string) => Promise<boolean>;
  requestPayout: (amount: number, methodId: string) => Promise<boolean>;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'timestamp'>) => void;
  voteForArtist: (contestId: string, artistId: string) => Promise<boolean>;
  getVotesForArtist: (contestId: string, artistId: string) => number;
  getRemainingVotes: (contestId: string) => number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getUnreadCount: () => number;
  uploadMedia: (type: 'music' | 'video' | 'picture', uri: string, name: string, size: number) => void;
  removeMedia: (type: 'music' | 'video' | 'picture', id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MAX_DAILY_VOTES = 5;

const DEFAULT_PROFILE: UserProfile = {
  id: '',
  email: '',
  username: '',
  displayName: 'New Artist',
  bio: '',
  profileImage: '',
  coverImage: '',
  city: '',
  state: '',
  country: 'United States',
  isPremium: false,
  isArtist: true,
  ownedMics: ['basic'],
  activeMic: 'basic',
  storageUsed: 0,
  storageLimit: 5 * 1024 * 1024 * 1024, // 5GB free
  createdAt: Date.now(),
  lastLogin: Date.now(),
  uploadedMusic: [],
  uploadedVideos: [],
  uploadedPictures: [],
};

// Sample contest votes for demo
const INITIAL_CONTEST_VOTES: { [contestId: string]: ContestVotes } = {
  '1': {
    '1': 1250,
    '2': 980,
    '3': 875,
    '4': 720,
    '5': 650,
    '6': 580,
    '7': 490,
    '8': 420,
    '9': 380,
    '10': 310,
  },
  '2': {
    '1': 890,
    '2': 750,
    '3': 680,
    '4': 590,
    '5': 520,
  },
  '3': {
    '1': 1100,
    '2': 920,
    '3': 810,
    '4': 700,
    '5': 620,
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    hasAcceptedGuidelines: false,
    hasSeenContestRules: false,
    isVerified: false,
    profile: null,
    paymentMethods: [],
    receipts: [],
    votes: [],
    notifications: [
      {
        id: '1',
        type: 'system',
        title: 'Welcome to 1WAY!',
        message: 'Start your journey to the top. Upload your music and compete in contests!',
        read: false,
        timestamp: Date.now() - 3600000,
      },
    ],
    dailyVotesRemaining: {},
    contestVotes: INITIAL_CONTEST_VOTES,
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setState(s => ({
      ...s,
      isAuthenticated: true,
      isVerified: true,
      profile: {
        ...DEFAULT_PROFILE,
        id: Date.now().toString(),
        email,
        username: email.split('@')[0],
        displayName: email.split('@')[0],
        lastLogin: Date.now(),
      },
    }));
    return true;
  };

  const signup = async (email: string, username: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setState(s => ({
      ...s,
      profile: {
        ...DEFAULT_PROFILE,
        id: Date.now().toString(),
        email,
        username,
        displayName: username,
        createdAt: Date.now(),
        lastLogin: Date.now(),
      },
    }));
    return true;
  };

  const logout = () => {
    setState({
      isAuthenticated: false,
      hasAcceptedGuidelines: false,
      hasSeenContestRules: false,
      isVerified: false,
      profile: null,
      paymentMethods: [],
      receipts: [],
      votes: [],
      notifications: [],
      dailyVotesRemaining: {},
      contestVotes: INITIAL_CONTEST_VOTES,
    });
  };

  const acceptGuidelines = () => {
    setState(s => ({ ...s, hasAcceptedGuidelines: true }));
  };

  const acceptContestRules = () => {
    setState(s => ({ ...s, hasSeenContestRules: true }));
  };

  const verifyEmail = async (code: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (code.length === 6) {
      setState(s => ({ ...s, isVerified: true, isAuthenticated: true }));
      return true;
    }
    return false;
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setState(s => ({
      ...s,
      profile: s.profile ? { ...s.profile, ...updates } : null,
    }));
  };

  const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: Date.now().toString(),
      isDefault: state.paymentMethods.length === 0,
    };
    setState(s => ({ ...s, paymentMethods: [...s.paymentMethods, newMethod] }));
  };

  const removePaymentMethod = (id: string) => {
    setState(s => ({
      ...s,
      paymentMethods: s.paymentMethods.filter(m => m.id !== id),
    }));
  };

  const setDefaultPaymentMethod = (id: string) => {
    setState(s => ({
      ...s,
      paymentMethods: s.paymentMethods.map(m => ({
        ...m,
        isDefault: m.id === id,
      })),
    }));
  };

  const addReceipt = (receipt: Omit<Receipt, 'id' | 'timestamp'>) => {
    const newReceipt: Receipt = {
      ...receipt,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    setState(s => ({ ...s, receipts: [...s.receipts, newReceipt] }));
  };

  const purchasePremium = async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    setState(s => ({
      ...s,
      profile: s.profile ? {
        ...s.profile,
        isPremium: true,
        premiumExpiry: Date.now() + oneYear,
        storageLimit: 100 * 1024 * 1024 * 1024,
      } : null,
    }));
    addReceipt({
      type: 'subscription',
      amount: 12,
      fee: 0,
      description: '1WAY Premium - 1 Year',
      paymentMethod: state.paymentMethods.find(m => m.isDefault)?.name || 'Card',
      status: 'completed',
    });
    return true;
  };

  const purchaseMic = async (micId: string, price: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    setState(s => ({
      ...s,
      profile: s.profile ? {
        ...s.profile,
        ownedMics: [...s.profile.ownedMics, micId],
        activeMic: micId,
      } : null,
    }));
    addReceipt({
      type: 'purchase',
      amount: price,
      fee: 0,
      description: `Virtual Microphone - ${micId}`,
      paymentMethod: state.paymentMethods.find(m => m.isDefault)?.name || 'Card',
      status: 'completed',
    });
    return true;
  };

  const addFunds = async (amount: number, methodId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const method = state.paymentMethods.find(m => m.id === methodId);
    addReceipt({
      type: 'deposit',
      amount,
      fee: 0,
      description: `Added funds to wallet`,
      paymentMethod: method?.name || 'Card',
      status: 'completed',
    });
    return true;
  };

  const requestPayout = async (amount: number, methodId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const method = state.paymentMethods.find(m => m.id === methodId);
    const fee = amount * 0.02;
    addReceipt({
      type: 'payout',
      amount,
      fee,
      description: `Instant payout to ${method?.name || 'account'}`,
      paymentMethod: method?.name || 'Bank',
      status: 'completed',
    });
    return true;
  };

  const voteForArtist = async (contestId: string, artistId: string): Promise<boolean> => {
    const remaining = state.dailyVotesRemaining[contestId] ?? MAX_DAILY_VOTES;
    
    if (remaining <= 0) {
      return false;
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    const newVote: Vote = {
      id: Date.now().toString(),
      contestId,
      artistId,
      userId: state.profile?.id || '',
      timestamp: Date.now(),
    };

    setState(s => ({
      ...s,
      votes: [...s.votes, newVote],
      dailyVotesRemaining: {
        ...s.dailyVotesRemaining,
        [contestId]: remaining - 1,
      },
      contestVotes: {
        ...s.contestVotes,
        [contestId]: {
          ...s.contestVotes[contestId],
          [artistId]: (s.contestVotes[contestId]?.[artistId] || 0) + 1,
        },
      },
    }));

    return true;
  };

  const getVotesForArtist = (contestId: string, artistId: string): number => {
    return state.contestVotes[contestId]?.[artistId] || 0;
  };

  const getRemainingVotes = (contestId: string): number => {
    return state.dailyVotesRemaining[contestId] ?? MAX_DAILY_VOTES;
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now(),
      read: false,
    };
    setState(s => ({ ...s, notifications: [newNotification, ...s.notifications] }));
  };

  const markNotificationRead = (id: string) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const markAllNotificationsRead = () => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => ({ ...n, read: true })),
    }));
  };

  const getUnreadCount = (): number => {
    return state.notifications.filter(n => !n.read).length;
  };

  const uploadMedia = (type: 'music' | 'video' | 'picture', uri: string, name: string, size: number) => {
    const newMedia: MediaItem = {
      id: Date.now().toString(),
      uri,
      name,
      type,
      size,
      uploadedAt: Date.now(),
    };

    setState(s => {
      if (!s.profile) return s;
      
      const key = type === 'music' ? 'uploadedMusic' : type === 'video' ? 'uploadedVideos' : 'uploadedPictures';
      return {
        ...s,
        profile: {
          ...s.profile,
          [key]: [...s.profile[key], newMedia],
          storageUsed: s.profile.storageUsed + size,
        },
      };
    });
  };

  const removeMedia = (type: 'music' | 'video' | 'picture', id: string) => {
    setState(s => {
      if (!s.profile) return s;
      
      const key = type === 'music' ? 'uploadedMusic' : type === 'video' ? 'uploadedVideos' : 'uploadedPictures';
      const media = s.profile[key].find(m => m.id === id);
      
      return {
        ...s,
        profile: {
          ...s.profile,
          [key]: s.profile[key].filter(m => m.id !== id),
          storageUsed: s.profile.storageUsed - (media?.size || 0),
        },
      };
    });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup,
      logout,
      acceptGuidelines,
      acceptContestRules,
      verifyEmail,
      updateProfile,
      addPaymentMethod,
      removePaymentMethod,
      setDefaultPaymentMethod,
      purchasePremium,
      purchaseMic,
      addFunds,
      requestPayout,
      addReceipt,
      voteForArtist,
      getVotesForArtist,
      getRemainingVotes,
      addNotification,
      markNotificationRead,
      markAllNotificationsRead,
      getUnreadCount,
      uploadMedia,
      removeMedia,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
