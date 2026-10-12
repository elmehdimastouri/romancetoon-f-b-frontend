export interface ChapterPage {
  page: number
  url: string
  width?: number
  height?: number
}

export interface Chapter {
  id: string
  number: number
  title: string
  releaseDate: string
  views: string
  pagesCount: number
  isLocked?: boolean
  freeUnlockDate?: string
  pages?: ChapterPage[]
}

export interface Manga {
  id: string
  slug: string
  title: string
  alternativeTitles?: string[]
  cover: string
  banner: string
  synopsis: string
  author: string
  artist: string
  genres: string[]
  rating: number
  ratingCount: string
  status: 'Ongoing' | 'Completed' | 'Hiatus'
  views: string
  bookmarks: string
  badge?: 'HOT' | 'NEW' | 'TRENDING' | 'EXCLUSIVE'
  chapters: Chapter[]
}

// Sample realistic romance webtoons collection
export const sampleMangas: Manga[] = [
  {
    id: 'manga_611ac7d4f93e7',
    slug: 'secret-sweetheart-of-the-tycoon',
    title: 'Secret Sweetheart of the Tycoon',
    alternativeTitles: ['The Billionaire\'s Hidden Rose', 'Tycoon\'s Beloved Contract Wife'],
    cover: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1920&q=80',
    synopsis: 'To save her family from bankruptcy, Seraphina agreed to a one-year marriage of convenience with Damian Thorne, the coldest CEO in the capital. She expected indifference and strictly business boundaries. What she didn\'t expect was how Damian\'s gaze would soften only in her presence, or the intoxicating warmth beneath his icy exterior. When secrets of the past resurface, will their contract blossom into genuine destiny?',
    author: 'Clara Delacroix',
    artist: 'Studio Rosebloom',
    genres: ['Romance', 'CEO & Drama', 'Contract Marriage', 'Contemporary'],
    rating: 4.9,
    ratingCount: '48.2K',
    status: 'Ongoing',
    views: '1.4M',
    bookmarks: '124K',
    badge: 'HOT',
    chapters: [
      {
        id: '1',
        number: 1,
        title: 'Chapter 1: The Midnight Contract',
        releaseDate: '3 days ago',
        views: '142K',
        pagesCount: 6,
        pages: [
          { page: 1, url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 },
          { page: 2, url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85', width: 900, height: 1400 },
          { page: 3, url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 },
          { page: 4, url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 },
          { page: 5, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85', width: 900, height: 1400 },
          { page: 6, url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 }
        ]
      },
      {
        id: '2',
        number: 2,
        title: 'Chapter 2: His Unspoken Rules',
        releaseDate: '2 days ago',
        views: '118K',
        pagesCount: 5,
        pages: [
          { page: 1, url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=900&q=85', width: 900, height: 1400 },
          { page: 2, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 },
          { page: 3, url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 },
          { page: 4, url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85', width: 900, height: 1400 },
          { page: 5, url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=85', width: 900, height: 1350 }
        ]
      },
      {
        id: '3',
        number: 3,
        title: 'Chapter 3: The Gala Encounter',
        releaseDate: 'Yesterday',
        views: '95K',
        pagesCount: 5
      },
      {
        id: '4',
        number: 4,
        title: 'Chapter 4: A Stolen Whisper in the Rain',
        releaseDate: '3 hours ago',
        views: '62K',
        pagesCount: 6,
        isLocked: false
      }
    ]
  },
  {
    id: 'manga_722be881f44a1',
    slug: 'the-villainess-captured-the-emperors-heart',
    title: 'The Villainess Captured the Emperor\'s Heart',
    alternativeTitles: ['I Seduced the Tyrant by Mistake', 'Reborn as the Ruthless Queen'],
    cover: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1920&q=80',
    synopsis: 'Reincarnated as Lady Juliette, the villainess destined for execution, she vowed to break off her engagement and live a peaceful life away from the royal palace. However, every time she tries to distance herself, the ruthless tyrant emperor finds her rebelliousness even more fascinating.',
    author: 'Evelyn Vane',
    artist: 'Moonlit Studio',
    genres: ['Romance', 'Historical', 'Villainess', 'Fantasy', 'Royalty'],
    rating: 4.95,
    ratingCount: '62.1K',
    status: 'Ongoing',
    views: '2.1M',
    bookmarks: '189K',
    badge: 'TRENDING',
    chapters: [
      { id: '1', number: 1, title: 'Chapter 1: Avoiding the Guillotine', releaseDate: '1 week ago', views: '210K', pagesCount: 5 },
      { id: '2', number: 2, title: 'Chapter 2: The Emperor\'s Sudden Visit', releaseDate: '5 days ago', views: '180K', pagesCount: 5 },
      { id: '3', number: 3, title: 'Chapter 3: A Dance That Changed Destiny', releaseDate: '2 days ago', views: '145K', pagesCount: 5 }
    ]
  },
  {
    id: 'manga_833cf992a55b2',
    slug: 'coffee-spells-and-starlight-kisses',
    title: 'Coffee Spells & Starlight Kisses',
    alternativeTitles: ['Late Night Brew with a Magician', 'The Barista & The Archmage'],
    cover: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1920&q=80',
    synopsis: 'A cozy modern urban fantasy romance where an everyday coffee shop barista discovers that her regular midnight customer is actually the centuries-old guardian of the starry veil.',
    author: 'Iris Sterling',
    artist: 'Aura Arts',
    genres: ['Romance', 'Cozy Fantasy', 'Modern Romance', 'Magic'],
    rating: 4.88,
    ratingCount: '31.4K',
    status: 'Ongoing',
    views: '890K',
    bookmarks: '77K',
    badge: 'NEW',
    chapters: [
      { id: '1', number: 1, title: 'Chapter 1: Midnight Espresso', releaseDate: '4 days ago', views: '95K', pagesCount: 5 },
      { id: '2', number: 2, title: 'Chapter 2: Sugar and Spells', releaseDate: 'Yesterday', views: '78K', pagesCount: 5 }
    ]
  },
  {
    id: 'manga_944da003b66c3',
    slug: 'under-the-duke-s-enchanted-petals',
    title: 'Under the Duke\'s Enchanted Petals',
    alternativeTitles: ['The Thorned Duke\'s Gentle Touch', 'Rose Garden Romance'],
    cover: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1920&q=80',
    synopsis: 'Rumors said the Duke of Blackwood was a monster whose garden withered any who dared enter. When desperate botanist Elena accepts a commission to heal his sacred roses, she uncovers the tender heart beneath the curse.',
    author: 'Lucian Grey',
    artist: 'Petal Works',
    genres: ['Romance', 'Historical', 'Slow Burn', 'Drama'],
    rating: 4.92,
    ratingCount: '44.8K',
    status: 'Ongoing',
    views: '1.2M',
    bookmarks: '105K',
    chapters: [
      { id: '1', number: 1, title: 'Chapter 1: The Withered Rose', releaseDate: '2 weeks ago', views: '150K', pagesCount: 5 },
      { id: '2', number: 2, title: 'Chapter 2: The First Blossom', releaseDate: '1 week ago', views: '130K', pagesCount: 5 }
    ]
  }
]
