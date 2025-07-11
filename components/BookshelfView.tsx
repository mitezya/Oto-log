
import React, { useState, useMemo } from 'react';
import type { SongRecord } from '../types';
import { PlusIcon } from './icons';

interface BookProps {
  song: SongRecord;
  onSelect: (song: SongRecord) => void;
}

const Book: React.FC<BookProps> = ({ song, onSelect }) => (
  <div
    className="group relative w-[60px] h-[240px] cursor-pointer perspective-1000"
    onClick={() => onSelect(song)}
  >
    <div className="relative w-full h-full transform-style-3d group-hover:transform-rotate-y-15 transition-transform duration-500 ease-in-out">
      {/* Spine */}
      <div className="absolute top-0 left-0 w-[60px] h-full bg-[#3a3a3a] transform-origin-left transform-rotate-y-0 text-white flex flex-col justify-between p-2 shadow-lg"
           style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${song.coverArtUrl})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="[writing-mode:vertical-rl] rotate-180 text-center font-bold text-sm drop-shadow-lg">{song.title}</div>
        <div className="[writing-mode:vertical-rl] rotate-180 text-center text-xs opacity-80 drop-shadow-md">{song.artist}</div>
      </div>
    </div>
  </div>
);


interface BookshelfViewProps {
  bookshelf: SongRecord[];
  onSelectSong: (song: SongRecord) => void;
  onAddSongClick: () => void;
}

const BookshelfView: React.FC<BookshelfViewProps> = ({ bookshelf, onSelectSong, onAddSongClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'createdAt' | 'title' | 'artist'>('createdAt');

  const filteredAndSortedBooks = useMemo(() => {
    return bookshelf
      .filter(song =>
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .sort((a, b) => {
        if (sortOrder === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return a[sortOrder].localeCompare(b[sortOrder]);
      });
  }, [bookshelf, searchTerm, sortOrder]);

  return (
    <div className="animate-fade-in">
        <div className="mb-8 p-4 bg-white/60 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
                <input
                    type="text"
                    placeholder="曲名、アーティスト名、タグで検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none"
                />
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none bg-white"
                >
                    <option value="createdAt">追加日順</option>
                    <option value="title">曲名順</option>
                    <option value="artist">アーティスト順</option>
                </select>
            </div>
        </div>

      {bookshelf.length === 0 ? (
        <div className="text-center py-20 px-6 bg-white/60 rounded-xl shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-gray-700 mb-4">本棚は空です</h2>
            <p className="text-gray-500 mb-8">曲と思い出を追加して、コレクションを始めましょう。</p>
            <button
                onClick={onAddSongClick}
                className="inline-flex items-center gap-2 bg-[#8B5CF6] text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-[#7C3AED] transition-transform transform hover:scale-105"
            >
                <PlusIcon className="w-6 h-6" />
                最初の思い出を追加する
            </button>
        </div>
      ) : (
        <div className="bg-gradient-to-b from-[#e0dacd] to-[#d3c9b8] p-4 rounded-xl shadow-inner">
             <div className="relative flex items-end h-[300px] gap-2 p-4 overflow-x-auto bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] bg-[#a08a73] rounded-lg shadow-xl">
                {filteredAndSortedBooks.map(song => (
                    <Book key={song.id} song={song} onSelect={onSelectSong} />
                ))}
            </div>
            <div className="h-2 bg-[#5D4037] rounded-b-lg shadow-md"></div>
        </div>
      )}
    </div>
  );
};

export default BookshelfView;