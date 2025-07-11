
import React from 'react';
import type { SongRecord } from '../types';
import { CloseIcon } from './icons';

interface BookDetailViewProps {
  song: SongRecord;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const BookDetailView: React.FC<BookDetailViewProps> = ({ song, onClose, onDelete }) => {
    
  const handleDelete = () => {
    if (window.confirm("この思い出を本当に削除しますか？この操作は元に戻せません。")) {
        onDelete(song.id);
        onClose();
    }
  }
    
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-30 animate-fade-in p-4">
      <div className="bg-[#FDFBF8] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden transform transition-all duration-300 ease-out scale-95 animate-scale-in">
        
        {/* Left side: Cover Art and Info */}
        <div className="w-full md:w-1/3 bg-gray-100 p-8 flex flex-col items-center justify-center text-center">
            <img src={song.coverArtUrl} alt={`${song.title} cover`} className="w-48 h-48 rounded-lg shadow-2xl mb-6" />
            <h2 className="text-3xl font-serif text-gray-800">{song.title}</h2>
            <h3 className="text-xl text-gray-600 mt-1">{song.artist}</h3>
            {song.releaseYear && <p className="text-gray-500 mt-2">{song.releaseYear}</p>}
            <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-6 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-all"
            >
                YouTubeで聴く
            </a>
        </div>

        {/* Right side: Memory Content */}
        <div className="w-full md:w-2/3 p-8 overflow-y-auto">
            <div className="relative">
                <button onClick={onClose} className="absolute top-0 right-0 text-gray-400 hover:text-gray-700">
                    <CloseIcon className="w-7 h-7" />
                </button>
                <h4 className="text-lg font-serif font-bold text-[#8B5CF6] mb-2">私の思い出</h4>
                <div className="prose max-w-none text-gray-700 bg-white/50 p-4 rounded-md border-l-4 border-[#8B5CF6]/50">
                   <p className="whitespace-pre-wrap">{song.summary}</p>
                </div>
                
                <div className="mt-6">
                    <h5 className="font-bold text-gray-600 mb-2">タグ</h5>
                    <div className="flex flex-wrap gap-2">
                        {song.tags.map((tag, i) => (
                            <span key={i} className="bg-purple-100 text-purple-800 text-sm font-semibold px-3 py-1 rounded-full">{tag}</span>
                        ))}
                    </div>
                </div>

                <div className="mt-8">
                    <details>
                        <summary className="font-bold text-gray-600 cursor-pointer hover:text-gray-800">AIインタビュー全文を表示</summary>
                        <div className="mt-2 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto border text-sm">
                            {song.chatHistory.map((msg, index) => (
                                <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    <span className={`inline-block px-3 py-1 rounded-lg ${msg.role === 'user' ? 'bg-purple-200' : 'bg-gray-200'}`}>
                                        {msg.parts[0].text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </details>
                </div>

                 <div className="mt-8 border-t pt-4">
                    <button onClick={handleDelete} className="text-red-500 hover:text-red-700 font-medium text-sm">
                        この思い出を削除
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailView;