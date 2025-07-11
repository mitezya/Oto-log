
import React, { useState, useRef, useEffect } from 'react';
import type { SongRecord, ChatMessage } from '../types';
import { startChat, continueChat, generateSummaryAndTags, continueChatStream } from '../services/geminiService';
import type { Chat } from '@google/genai';
import { SparklesIcon, CloseIcon } from './icons';

interface AddSongFlowProps {
  onSave: (song: SongRecord) => void;
  onCancel: () => void;
}

type FlowStep = 'details' | 'chat' | 'summary';

const AddSongFlow: React.FC<AddSongFlowProps> = ({ onSave, onCancel }) => {
  const [step, setStep] = useState<FlowStep>('details');
  const [songDetails, setSongDetails] = useState({ title: '', artist: '', releaseYear: '' });
  const [chat, setChat] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);
  
  const handleStartChat = () => {
    if (songDetails.title && songDetails.artist) {
      const newChat = startChat(songDetails.title, songDetails.artist);
      setChat(newChat);
      setIsAiTyping(true);
      // AIからの最初のメッセージを取得するために、ユーザーからのトリガーメッセージを送信
      handleInitialMessage(newChat);
      setStep('chat');
    }
  };

  const handleInitialMessage = async (newChat: Chat) => {
    try {
        const stream = await continueChatStream(newChat, "お願いします。");
        let fullResponse = "";
        
        // AIの応答用にプレースホルダーを追加
        setChatHistory([{ role: 'model', parts: [{ text: '' }] }]);

        for await (const chunk of stream) {
            const chunkText = chunk.text;
            fullResponse += chunkText;
            setChatHistory(prev => {
                const updatedHistory = [...prev];
                const lastMessage = updatedHistory[updatedHistory.length - 1];
                if (lastMessage.role === 'model') {
                    lastMessage.parts[0].text = fullResponse;
                }
                return updatedHistory;
            });
        }
    } catch (error) {
        console.error("Streaming chat failed on initial message:", error);
        setChatHistory([{ role: 'model', parts: [{ text: "申し訳ありません、応答を取得できませんでした。もう一度お試しください。" }] }]);
    } finally {
        setIsAiTyping(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !chat || isAiTyping) return;

    const userMessageText = userInput.trim();
    const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: userMessageText }] };
    
    setChatHistory(prev => [...prev, newUserMessage, { role: 'model', parts: [{ text: '' }] }]);
    
    setUserInput('');
    setIsAiTyping(true);

    try {
      const stream = await continueChatStream(chat, userMessageText);

      let fullResponse = "";
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullResponse += chunkText;
        setChatHistory(prev => {
          const updatedHistory = [...prev];
          const lastMessage = updatedHistory[updatedHistory.length - 1];
          if (lastMessage.role === 'model') {
            lastMessage.parts[0].text = fullResponse;
          }
          return updatedHistory;
        });
      }
    } catch (error) {
      console.error("Streaming chat failed:", error);
      setChatHistory(prev => {
        const updatedHistory = [...prev];
        const lastMessage = updatedHistory[updatedHistory.length - 1];
        if (lastMessage.role === 'model' && lastMessage.parts[0].text === '') {
            lastMessage.parts[0].text = "申し訳ありません、応答を取得できませんでした。もう一度お試しください。";
        }
        return updatedHistory;
      });
    } finally {
      setIsAiTyping(false);
    }
  };
  
  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    const { summary: generatedSummary, tags: generatedTags } = await generateSummaryAndTags(chatHistory, songDetails.title, songDetails.artist);
    setSummary(generatedSummary);
    setTags(generatedTags);
    setIsSummarizing(false);
    setStep('summary');
  };

  const handleSave = () => {
    const newRecord: SongRecord = {
      id: crypto.randomUUID(),
      ...songDetails,
      coverArtUrl: `https://picsum.photos/seed/${encodeURIComponent(songDetails.title)}/400/400`,
      summary,
      chatHistory,
      tags,
      createdAt: new Date().toISOString(),
    };
    onSave(newRecord);
  };

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">新しい思い出を追加</h2>
        <p className="text-gray-500 mt-1">まず、曲の詳細情報を入力しましょう。</p>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">曲名</label>
          <input type="text" id="title" placeholder="例: Bohemian Rhapsody" value={songDetails.title} onChange={(e) => setSongDetails({...songDetails, title: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#7C3AED] focus:border-[#7C3AED] placeholder:text-gray-400" />
        </div>
        <div>
          <label htmlFor="artist" className="block text-sm font-medium text-gray-700">アーティスト</label>
          <input type="text" id="artist" placeholder="例: Queen" value={songDetails.artist} onChange={(e) => setSongDetails({...songDetails, artist: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#7C3AED] focus:border-[#7C3AED] placeholder:text-gray-400" />
        </div>
        <div>
          <label htmlFor="releaseYear" className="block text-sm font-medium text-gray-700">リリース年（任意）</label>
          <input type="text" id="releaseYear" placeholder="例: 1975" value={songDetails.releaseYear} onChange={(e) => setSongDetails({...songDetails, releaseYear: e.target.value})} className="mt-1 block w-full px-3 py-2 bg-gray-900 text-white border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[#7C3AED] focus:border-[#7C3AED] placeholder:text-gray-400" />
        </div>
      </div>
      <button onClick={handleStartChat} disabled={!songDetails.title || !songDetails.artist} className="w-full bg-[#8B5CF6] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#7C3AED] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed">
        インタビューを開始
      </button>
    </div>
  );

  const renderChatStep = () => (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">AIインタビュー</h2>
      <div ref={chatContainerRef} className="flex-grow bg-gray-50 p-4 rounded-lg overflow-y-auto mb-4 h-96 border">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-[#8B5CF6] text-white rounded-br-none' : 'bg-white text-gray-800 shadow-sm rounded-bl-none border'}`}>
              <p className="whitespace-pre-wrap">{msg.parts[0].text || '...'}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={userInput} 
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="あなたの想いを入力してください..." 
          className="flex-grow p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none placeholder:text-gray-400 disabled:bg-gray-800"
          disabled={isAiTyping}
        />
        <button onClick={handleSendMessage} disabled={isAiTyping || !userInput} className="bg-[#8B5CF6] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#7C3AED] transition-all disabled:bg-gray-400">送信</button>
      </div>
       <button onClick={handleGenerateSummary} disabled={chatHistory.length < 2 || isAiTyping || isSummarizing} className="w-full mt-4 bg-green-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-green-600 transition-all disabled:bg-gray-400 flex items-center justify-center">
        {isSummarizing ? (
          <>
            <SparklesIcon className="w-5 h-5 mr-2 animate-pulse" />
            要約中...
          </>
        ) : (
          "完了して要約"
        )}
      </button>
    </div>
  );

  const renderSummaryStep = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">思い出の要約</h2>
       {isSummarizing ? (
           <div className="text-center py-10">
               <SparklesIcon className="w-12 h-12 text-[#8B5CF6] mx-auto animate-pulse" />
               <p className="mt-4 text-gray-600">AIがあなたの物語を作成中です...</p>
           </div>
       ) : (
           <>
               <textarea
                   value={summary}
                   onChange={(e) => setSummary(e.target.value)}
                   rows={10}
                   className="w-full p-3 bg-gray-900 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none"
               />
               <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">タグ:</span>
                   {tags.map((tag, i) => <span key={i} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{tag}</span>)}
               </div>
               <button onClick={handleSave} className="w-full bg-[#8B5CF6] text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-[#7C3AED] transition-all">
                   本棚に保存
               </button>
           </>
       )}
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 'details': return renderDetailsStep();
      case 'chat': return renderChatStep();
      case 'summary': return renderSummaryStep();
      default: return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col relative transform transition-all duration-300 ease-out scale-95 animate-scale-in">
          <button onClick={onCancel} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
          {renderStep()}
        </div>
    </div>
  );
};

export default AddSongFlow;
