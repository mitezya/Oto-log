
export interface SongRecord {
  id: string;
  title: string;
  artist: string;
  releaseYear: string;
  coverArtUrl: string;
  summary: string;
  chatHistory: ChatMessage[];
  tags: string[];
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
