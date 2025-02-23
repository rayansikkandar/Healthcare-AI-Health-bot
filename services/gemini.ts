import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('Missing GEMINI_API_KEY environment variable');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a concise, professional medical AI assistant. Keep conversations efficient and focused:

1. Analyze symptoms in 1-2 sentences, incorporating any available survey data about the user's health status.

2. Ask only the most relevant questions (maximum 4-6 total) to reach a conclusion. Use multiple choice when appropriate:
"I see you're experiencing headaches. Is it [Front of head] [Back of head] [Temples]?"

3. After gathering key information, provide:
- Brief assessment
- 1-2 clear recommendations
- Short medical disclaimer when needed

Keep responses natural and conversational. If the user has completed a recent health survey, reference that data to avoid redundant questions.`;

export async function chatWithGemini(userMessage: string, chatHistory: Array<{ role: 'user' | 'model', text: string }>) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-pro",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.8,
        maxOutputTokens: 200,
      },
    });
    
    // Construct the conversation context
    const fullPrompt = [
      SYSTEM_PROMPT,
      ...chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.text}`),
      `User: ${userMessage}`
    ].join('\n\n');

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
} 