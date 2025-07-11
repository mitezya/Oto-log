
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { ChatMessage } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const chatModel = 'gemini-2.5-flash';
const summaryModel = 'gemini-2.5-flash';

export const startChat = (songTitle: string, artist: string): Chat => {
  const systemInstruction = `あなたは「オト」という名前の、共感的で好奇心旺盛なインタビュアーです。あなたの目的は、ユーザーが${artist}の「${songTitle}」という曲にまつわる個人的な思い出や感情を深く探求する手助けをすることです。自由回答形式の、掘り下げるような質問を投げかけ、ユーザーが自分の物語を言葉にできるよう優しく導いてください。会話の始めに、その曲との最初の出会いについて尋ねてください。返答は簡潔で、会話のような口調を保ってください。`;

  return ai.chats.create({
    model: chatModel,
    config: {
      systemInstruction: systemInstruction,
    },
  });
};

export const continueChat = async (chat: Chat, message: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending chat message:", error);
    return "申し訳ありません、問題が発生しました。もう一度お試しいただけますか？";
  }
};

export const continueChatStream = async (chat: Chat, message: string) => {
  try {
    // This returns the stream which is an async iterable.
    return await chat.sendMessageStream({ message });
  } catch (error) {
    console.error("Error sending streaming chat message:", error);
    // Rethrow to be handled by the UI component
    throw error;
  }
};


export const generateSummaryAndTags = async (chatHistory: ChatMessage[], songTitle: string, artist: string): Promise<{ summary: string; tags: string[] }> => {
  const conversationText = chatHistory
    .map(msg => `${msg.role === 'user' ? 'ユーザー' : 'オト'}: ${msg.parts[0].text}`)
    .join('\n');

  const prompt = `以下の「${songTitle}」 by ${artist}に関する会話に基づき、次の2つのことを実行してください:
1. ユーザーの思い出と感情について、心温まる物語風の要約を作成してください。ユーザーの視点（一人称「私」）で記述してください。要約は、一貫性のある一つの段落で記述してください。
2. 要約の後、改行して「TAGS:」と記述し、その後にユーザーの体験を最もよく表す感情的なキーワードを3〜5個、カンマ区切りでリストアップしてください（例：懐かしい, 希望に満ちた, ほろ苦い, 力づけられる）。

以下が会話です:
---
${conversationText}
---`;

  try {
    const response = await ai.models.generateContent({
        model: summaryModel,
        contents: prompt
    });

    const text = response.text;
    const parts = text.split('\nTAGS:');
    
    const summary = (parts[0] || '').trim();
    const tagsString = (parts[1] || '').trim();
    
    const tags = tagsString ? tagsString.split(',').map(tag => tag.trim().toLowerCase()) : ['タグなし'];

    return { summary, tags };

  } catch (error) {
    console.error("Error generating summary:", error);
    return { summary: "現時点では要約を生成できませんでした。", tags: [] };
  }
};