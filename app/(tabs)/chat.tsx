import React, { useState, useRef, useCallback } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { chatWithGemini } from '@/services/gemini';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  questions?: string[];
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello, I'm your medical assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const extractQuestions = (text: string): [string, string[]] => {
    const questions: string[] = [];
    const cleanText = text.replace(/\[([^\]]+)\]/g, (match, question) => {
      questions.push(question);
      return '';
    });
    return [cleanText, questions];
  };

  const handleQuestionClick = useCallback((question: string) => {
    setInputText(question);
    sendMessage(question);
  }, []);

  const sendMessage = useCallback(async (forcedMessage?: string) => {
    const messageToSend = forcedMessage || inputText;
    if ((!messageToSend.trim() || isLoading) && !forcedMessage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageToSend.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? ('user' as const) : ('model' as const),
        text: msg.text,
      }));

      const aiResponse = await chatWithGemini(messageToSend, chatHistory);
      const [cleanText, questions] = extractQuestions(aiResponse.trim());

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: cleanText,
        sender: 'ai',
        timestamp: new Date(),
        questions: questions,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble responding right now. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, messages]);

  const renderMessage = ({ item }: { item: Message }) => (
    <View>
      <ThemedView 
        style={[
          styles.messageContainer,
          item.sender === 'user' ? styles.userMessage : styles.aiMessage,
        ]}>
        <ThemedText>{item.text}</ThemedText>
        <ThemedText style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
      </ThemedView>
      {item.questions && item.questions.length > 0 && (
        <View style={styles.questionsContainer}>
          {item.questions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.questionButton}
              onPress={() => handleQuestionClick(question)}>
              <ThemedText style={styles.questionButtonText}>{question}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <ThemedView style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Describe your symptoms..."
          placeholderTextColor="#666"
          multiline
          editable={!isLoading}
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity 
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]} 
          onPress={() => sendMessage()}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.sendButtonText}>Send</ThemedText>
          )}
        </TouchableOpacity>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#A1CEDC',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#A1CEDC',
    borderRadius: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  questionsContainer: {
    marginLeft: 16,
    marginTop: 8,
    gap: 8,
  },
  questionButton: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  questionButtonText: {
    color: '#1A237E',
    fontSize: 14,
  },
}); 