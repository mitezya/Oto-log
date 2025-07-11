
import { useState, useEffect, useCallback } from 'react';
import type { SongRecord } from '../types';

const STORAGE_KEY = 'memoryMusicShelf';

const getInitialBookshelf = (): SongRecord[] => {
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return [];
  }
};

export const useBookshelf = () => {
  const [bookshelf, setBookshelf] = useState<SongRecord[]>(getInitialBookshelf);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookshelf));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [bookshelf]);

  const addSong = useCallback((newSong: Omit<SongRecord, 'id' | 'createdAt'> & { id?: string }) => {
    const songWithDefaults: SongRecord = {
      ...newSong,
      id: newSong.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setBookshelf(prev => [...prev, songWithDefaults]);
  }, []);

  const updateSong = useCallback((updatedSong: SongRecord) => {
    setBookshelf(prev => prev.map(song => (song.id === updatedSong.id ? updatedSong : song)));
  }, []);

  const deleteSong = useCallback((songId: string) => {
    setBookshelf(prev => prev.filter(song => song.id !== songId));
  }, []);

  return { bookshelf, addSong, updateSong, deleteSong };
};
