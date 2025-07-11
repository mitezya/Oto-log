
import React, { useState } from 'react';
import type { SongRecord } from './types';
import { useBookshelf } from './hooks/useBookshelf';
import BookshelfView from './components/BookshelfView';
import AddSongFlow from './components/AddSongFlow';
import BookDetailView from './components/BookDetailView';
import { PlusIcon } from './components/icons';

type View = 'bookshelf' | 'add_song' | 'detail';

const App: React.FC = () => {
  const { bookshelf, addSong, updateSong, deleteSong } = useBookshelf();
  const [currentView, setCurrentView] = useState<View>('bookshelf');
  const [selectedSong, setSelectedSong] = useState<SongRecord | null>(null);

  const handleAddSongClick = () => {
    setCurrentView('add_song');
  };

  const handleSelectSong = (song: SongRecord) => {
    setSelectedSong(song);
    setCurrentView('detail');
  };

  const handleCloseFlows = () => {
    setCurrentView('bookshelf');
    setSelectedSong(null);
  };
  
  const handleSaveSong = (song: SongRecord) => {
    if (bookshelf.find(s => s.id === song.id)) {
        updateSong(song);
    } else {
        addSong(song);
    }
    handleCloseFlows();
  };


  const renderView = () => {
    switch (currentView) {
      case 'add_song':
        return <AddSongFlow onSave={handleSaveSong} onCancel={handleCloseFlows} />;
      case 'detail':
        return selectedSong ? <BookDetailView song={selectedSong} onClose={handleCloseFlows} onDelete={deleteSong} /> : null;
      case 'bookshelf':
      default:
        return <BookshelfView bookshelf={bookshelf} onSelectSong={handleSelectSong} onAddSongClick={handleAddSongClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] text-[#4A4A4A]">
      <header className="p-6 border-b border-gray-200/80 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-20">
        <h1 className="text-3xl font-serif text-[#3A3A3A] cursor-pointer" onClick={handleCloseFlows}>メモリーミュージックシェルフ</h1>
        {currentView === 'bookshelf' && (
             <button
                onClick={handleAddSongClick}
                className="flex items-center gap-2 bg-[#8B5CF6] text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-[#7C3AED] transition-transform transform hover:scale-105"
                >
                <PlusIcon className="w-5 h-5" />
                思い出を追加
            </button>
        )}
      </header>
      <main className="p-4 sm:p-6 md:p-8">
        {renderView()}
      </main>
      <footer className="text-center p-4 text-xs text-gray-400">
        <p>&copy; 2024 メモリーミュージックシェルフ。音楽であなただけの物語を。</p>
      </footer>
    </div>
  );
};

export default App;