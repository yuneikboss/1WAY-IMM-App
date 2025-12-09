import { IMAGES } from '../constants/images';

export interface Contest {
  id: string;
  title: string;
  prize: number;
  participants: number;
  deadline: string;
  image: string;
  category: string;
  description: string;
}

export const CONTESTS: Contest[] = [
  {
    id: '1',
    title: 'Beat Battle Championship',
    prize: 10000,
    participants: 256,
    deadline: '5 days left',
    image: IMAGES.albums[0],
    category: 'Beat Makers',
    description: 'Show off your production skills in the ultimate beat battle',
  },
  {
    id: '2',
    title: 'Freestyle Friday Finals',
    prize: 5000,
    participants: 128,
    deadline: '3 days left',
    image: IMAGES.albums[1],
    category: 'Freestylers',
    description: 'Live freestyle competition with real-time voting',
  },
  {
    id: '3',
    title: 'Ghost Writer Challenge',
    prize: 7500,
    participants: 89,
    deadline: '1 week left',
    image: IMAGES.albums[2],
    category: 'Ghost Writers',
    description: 'Write the best verse for a mystery artist',
  },
  {
    id: '4',
    title: 'Collab Contest',
    prize: 15000,
    participants: 312,
    deadline: '2 weeks left',
    image: IMAGES.albums[3],
    category: 'Featured Artists',
    description: 'Create the best collaboration track',
  },
];
