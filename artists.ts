import { IMAGES } from '../constants/images';

export interface Artist {
  id: string;
  name: string;
  image: string;
  category: string;
  genre: string;
  followers: number;
  plays: number;
  sales: number;
  certification: 'none' | 'gold' | 'platinum' | 'diamond';
  rank: number;
  verified: boolean;
  isVIP?: boolean;
}

const getImg = (i: number) => IMAGES.artists[i % IMAGES.artists.length];

export const ARTISTS: Artist[] = [
  { id: '1', name: 'DJ Nova', image: getImg(0), category: 'Beat Maker', genre: 'Hip-Hop', followers: 2500000, plays: 45000000, sales: 12500, certification: 'diamond', rank: 1, verified: true, isVIP: true },
  { id: '2', name: 'Lyric Storm', image: getImg(1), category: 'Ghost Writer', genre: 'R&B', followers: 1800000, plays: 32000000, sales: 9800, certification: 'diamond', rank: 2, verified: true, isVIP: true },
  { id: '3', name: 'Flow Master', image: getImg(2), category: 'Freestyler', genre: 'Rap', followers: 1500000, plays: 28000000, sales: 8200, certification: 'platinum', rank: 3, verified: true },
  { id: '4', name: 'Melody Queen', image: getImg(3), category: 'Featured Artist', genre: 'Pop', followers: 1200000, plays: 22000000, sales: 7500, certification: 'platinum', rank: 4, verified: true, isVIP: true },
  { id: '5', name: 'Bass King', image: getImg(4), category: 'Beat Maker', genre: 'EDM', followers: 980000, plays: 18000000, sales: 6200, certification: 'gold', rank: 5, verified: true },
  { id: '6', name: 'Verse Viper', image: getImg(5), category: 'Ghost Writer', genre: 'Hip-Hop', followers: 850000, plays: 15000000, sales: 5800, certification: 'gold', rank: 6, verified: true },
  { id: '7', name: 'Rhythm Rebel', image: getImg(6), category: 'Freestyler', genre: 'Trap', followers: 720000, plays: 12000000, sales: 5200, certification: 'gold', rank: 7, verified: true },
  { id: '8', name: 'Soul Sister', image: getImg(7), category: 'Featured Artist', genre: 'Soul', followers: 650000, plays: 9500000, sales: 4500, certification: 'none', rank: 8, verified: true },
  { id: '9', name: 'Beat Wizard', image: getImg(8), category: 'Beat Maker', genre: 'Lo-Fi', followers: 580000, plays: 8200000, sales: 3800, certification: 'none', rank: 9, verified: false },
  { id: '10', name: 'MC Thunder', image: getImg(9), category: 'Ad-Live', genre: 'Hip-Hop', followers: 520000, plays: 7500000, sales: 3200, certification: 'none', rank: 10, verified: true },
  { id: '11', name: 'Vinyl Vince', image: getImg(10), category: 'Videos', genre: 'R&B', followers: 480000, plays: 6800000, sales: 2900, certification: 'none', rank: 11, verified: true },
  { id: '12', name: 'Echo Elite', image: getImg(11), category: 'VIP Artist', genre: 'EDM', followers: 450000, plays: 6200000, sales: 2600, certification: 'none', rank: 12, verified: true, isVIP: true },
];

export const CATEGORIES = ['All', 'Ad-Live', 'Beat Maker', 'Featured Artist', 'Freestyler', 'Ghost Writer', 'Videos', 'VIP Artist'];
export const GENRES = ['All', 'Hip-Hop', 'R&B', 'Rap', 'Pop', 'EDM', 'Trap', 'Soul', 'Lo-Fi', 'Jazz', 'Rock', 'Country'];
