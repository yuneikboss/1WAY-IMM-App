import { IMAGES } from '../constants/images';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumArt: string;
  duration: number;
  plays: number;
  price: number;
  genre: string;
  billboardRank?: number;
}

export const TRACKS: Track[] = [
  { id: '1', title: 'Midnight Dreams', artist: 'DJ Nova', artistId: '1', album: 'Neon Nights', albumArt: IMAGES.albums[0], duration: 234, plays: 15000000, price: 1.99, genre: 'Hip-Hop', billboardRank: 1 },
  { id: '2', title: 'Soul Fire', artist: 'Lyric Storm', artistId: '2', album: 'Storm Rising', albumArt: IMAGES.albums[1], duration: 198, plays: 12500000, price: 1.99, genre: 'R&B', billboardRank: 2 },
  { id: '3', title: 'Flow State', artist: 'Flow Master', artistId: '3', album: 'Mastery', albumArt: IMAGES.albums[2], duration: 256, plays: 11000000, price: 1.99, genre: 'Rap', billboardRank: 3 },
  { id: '4', title: 'Electric Love', artist: 'Melody Queen', artistId: '4', album: 'Royalty', albumArt: IMAGES.albums[3], duration: 212, plays: 9800000, price: 1.99, genre: 'Pop', billboardRank: 4 },
  { id: '5', title: 'Bass Drop', artist: 'Bass King', artistId: '5', album: 'Kingdom', albumArt: IMAGES.albums[4], duration: 187, plays: 8500000, price: 1.99, genre: 'EDM', billboardRank: 5 },
  { id: '6', title: 'Hidden Verse', artist: 'Verse Viper', artistId: '6', album: 'Shadows', albumArt: IMAGES.albums[5], duration: 245, plays: 7200000, price: 1.99, genre: 'Hip-Hop', billboardRank: 6 },
  { id: '7', title: 'Rebel Yell', artist: 'Rhythm Rebel', artistId: '7', album: 'Revolution', albumArt: IMAGES.albums[6], duration: 223, plays: 6100000, price: 1.99, genre: 'Trap', billboardRank: 7 },
  { id: '8', title: 'Soul Deep', artist: 'Soul Sister', artistId: '8', album: 'Soulful', albumArt: IMAGES.albums[7], duration: 267, plays: 5400000, price: 1.99, genre: 'Soul', billboardRank: 8 },
  { id: '9', title: 'Chill Vibes', artist: 'Beat Wizard', artistId: '9', album: 'Wizardry', albumArt: IMAGES.albums[8], duration: 189, plays: 4800000, price: 1.99, genre: 'Lo-Fi', billboardRank: 9 },
  { id: '10', title: 'Night Rider', artist: 'DJ Nova', artistId: '1', album: 'Neon Nights', albumArt: IMAGES.albums[0], duration: 201, plays: 4200000, price: 1.99, genre: 'Hip-Hop', billboardRank: 10 },
];
