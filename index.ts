export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Chat {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
}

export interface Post {
  id: string;
  artistId: string;
  type: 'post' | 'reel' | 'story';
  content: string;
  mediaUrl?: string;
  likes: number;
  dislikes: number;
  comments: number;
  timestamp: number;
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'purchase' | 'sale' | 'demo' | 'tour' | 'sponsor';
  amount: number;
  fee: number;
  fromId?: string;
  toId?: string;
  description: string;
  timestamp: number;
}

export interface StoreItem {
  id: string;
  artistId: string;
  type: 'music' | 'video' | 'beat';
  title: string;
  price: number;
  coverUrl: string;
  sales: number;
}

export interface BoothSession {
  id: string;
  artistId: string;
  type: 'record' | 'edit' | 'live';
  isLive: boolean;
  viewers: number;
  featuringArtists: string[];
  startTime: number;
}

export interface UserContent {
  id: string;
  artistId: string;
  type: 'music' | 'video' | 'picture';
  title: string;
  url: string;
  timestamp: number;
}
