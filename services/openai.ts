import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

// Use environment variable for API key
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

// Make sure it's defined
if (!OPENAI_API_KEY) {
  throw new Error('Missing OpenAI API key. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Required for React Native
});

const SYSTEM_PROMPT = `You are a medical AI assistant. Your responses should be:
1. Brief and clear
2. Focused on actionable medical advice
3. Include disclaimers when necessary
4. Professional but approachable

When analyzing images:
1. Look for visible symptoms or conditions
2. Describe what you observe clinically
3. Suggest relevant follow-up questions
4. Provide preliminary assessment with appropriate medical disclaimers`;

// Define types for our messages
type MessageRole = 'user' | 'assistant' | 'system';
type ChatMessage = { role: MessageRole; content: string | any[] };

// Text-only chat function
export async function chat(message: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response received from AI');
    }
    
    return response;
  } catch (error) {
    console.error('Error in chat:', error);
    throw new Error('Failed to get response. Please try again.');
  }
}

// Process the image URI and convert to base64 data URL
export async function processImage(imageUri: string): Promise<string> {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image. Please try again.');
  }
}

// Chat with text and optionally an image
export async function chatWithImage(
  message: string, 
  imageUri?: string, 
  conversationHistory: ChatMessage[] = []
) {
  try {
    // Prepare conversation history with system prompt
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT } as ChatCompletionMessageParam
    ];
    
    // Add previous conversation
    for (const msg of conversationHistory) {
      messages.push({ 
        role: msg.role, 
        content: msg.content 
      } as ChatCompletionMessageParam);
    }
    
    // Prepare user message (with or without image)
    if (imageUri) {
      // Process image to get base64 data URL
      const base64Data = await processImage(imageUri);
      
      // Create content array with text and image
      messages.push({ 
        role: "user", 
        content: [
          { type: "text", text: message },
          {
            type: "image_url",
            image_url: {
              url: base64Data
            }
          }
        ]
      } as ChatCompletionMessageParam);
    } else {
      // Text-only message
      messages.push({ 
        role: "user", 
        content: message 
      } as ChatCompletionMessageParam);
    }
    
    // Send to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024,
    });
    
    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response received from AI');
    }
    
    return response;
  } catch (error) {
    console.error('Error in chat with image:', error);
    throw new Error('Failed to get response. Please try again.');
  }
}

// Original Image analysis function (keeping for backwards compatibility)
export async function analyzeImage(imageUri: string, prompt: string = "What do you observe in this medical image? Please provide a clinical assessment.") {
  try {
    const base64Data = await processImage(imageUri);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: base64Data
              }
            }
          ]
        }
      ],
      max_tokens: 1024,
    });

    const result = completion.choices[0]?.message?.content;
    
    if (!result) {
      throw new Error('No analysis received from AI');
    }
    
    return result;
  } catch (error) {
    console.error('Error analyzing image:', error);
    throw new Error('Failed to analyze image. Please try again.');
  }
} 