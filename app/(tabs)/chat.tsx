import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Image, View as RNView, ActivityIndicator } from 'react-native';
import { Text, View } from '@/components/Themed';
import { chat, chatWithImage } from '@/services/openai';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define message type
type Message = {
  id: string;
  text: string;
  fromUser: boolean;
  image?: string;
  timestamp: string;
};

// Define chat history type for maintaining conversation context
type ChatHistoryItem = {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
  timestamp: string;
  image?: string;
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Load chat history from AsyncStorage
  useEffect(() => {
    loadChatHistory();
  }, []);
  
  // Save chat history when messages change
  useEffect(() => {
    if (messages.length > 0) {
      const chatHistoryToSave = JSON.stringify(chatHistory);
      AsyncStorage.setItem('chatHistory', chatHistoryToSave);
    }
  }, [chatHistory]);
  
  // Load chat history from AsyncStorage
  const loadChatHistory = async () => {
    try {
      const storedChatHistory = await AsyncStorage.getItem('chatHistory');
      const storedMessages = await AsyncStorage.getItem('messages');
      
      if (storedChatHistory) {
        setChatHistory(JSON.parse(storedChatHistory));
      }
      
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };
  
  // Save messages to AsyncStorage
  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem('messages', JSON.stringify(messages));
    }
  }, [messages]);

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || isLoading) return;

    const userMessage = inputText.trim();
    const messageId = Date.now().toString();
    const timestamp = new Date().toISOString();
    
    // Create a new user message
    const newUserMessage: Message = {
      id: messageId,
      text: userMessage,
      fromUser: true,
      timestamp,
      ...(selectedImage && { image: selectedImage })
    };
    
    // Add user message to messages array
    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);
    
    // Update chat history
    const userHistoryItem: ChatHistoryItem = {
      role: 'user',
      content: selectedImage 
        ? [ 
            { type: "text", text: userMessage },
            { 
              type: "image_url", 
              image_url: { url: selectedImage }
            }
          ]
        : userMessage,
      timestamp,
      ...(selectedImage && { image: selectedImage })
    };
    
    const updatedHistory = [...chatHistory, userHistoryItem];
    setChatHistory(updatedHistory);

    try {
      // Use chatWithImage if there's an image, otherwise use regular chat
      const response = selectedImage 
        ? await chatWithImage(userMessage, selectedImage, 
            // Convert chatHistory to the format expected by chatWithImage
            chatHistory.map(({ role, content }) => ({ role, content }))
          )
        : await chat(userMessage);
      
      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        fromUser: false,
        timestamp: new Date().toISOString()
      };
      
      // Add assistant message to messages array
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update chat history with assistant response
      const assistantHistoryItem: ChatHistoryItem = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory([...updatedHistory, assistantHistoryItem]);
      
      // Clear selected image
      setSelectedImage(null);
      
      // Scroll to bottom
      scrollViewRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      Alert.alert('Error', errorMessage);
      // Remove the user's message if there was an error
      setMessages(prev => prev.filter(msg => msg.id !== messageId)); 
      setChatHistory(updatedHistory.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const cancelImage = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.fromUser ? styles.userMessage : styles.botMessage,
            ]}
          >
            {message.image && (
              <Image 
                source={{ uri: message.image }} 
                style={styles.messageImage} 
                resizeMode="cover"
              />
            )}
            <Text style={[
              styles.messageText,
              message.fromUser ? styles.userMessageText : styles.botMessageText,
            ]}>
              {message.text}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.botMessage]}>
            <ActivityIndicator size="small" color="#666" />
            <Text style={[styles.messageText, styles.botMessageText, styles.loadingText]}>
              Thinking...
            </Text>
          </View>
        )}
      </ScrollView>

      {selectedImage && (
        <RNView style={styles.selectedImageContainer}>
          <Image 
            source={{ uri: selectedImage }} 
            style={styles.selectedImage} 
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.cancelImageButton}
            onPress={cancelImage}
          >
            <Text style={styles.cancelImageText}>✕</Text>
          </TouchableOpacity>
        </RNView>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <RNView style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.imageButton}
            onPress={pickImage}
            disabled={isLoading}
          >
            <Text style={styles.imageButtonText}>📷</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.imageButton}
            onPress={takePhoto}
            disabled={isLoading}
          >
            <Text style={styles.imageButtonText}>📸</Text>
          </TouchableOpacity>
        </RNView>
        
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={selectedImage ? "Describe what you want to know about this image..." : "Type a message..."}
          placeholderTextColor="#666"
          multiline
          editable={!isLoading}
          onSubmitEditing={handleSend}
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            ((!inputText.trim() && !selectedImage) || isLoading) && styles.sendButtonDisabled
          ]}
          onPress={handleSend}
          disabled={(!inputText.trim() && !selectedImage) || isLoading}
        >
          <Text style={styles.sendButtonText}>
            {isLoading ? '...' : 'Send'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
  },
  userMessageText: {
    color: '#fff',
  },
  botMessageText: {
    color: '#000',
  },
  loadingText: {
    marginLeft: 8,
  },
  inputContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 12,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 20,
    marginTop: 8,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imageButton: {
    padding: 10,
    marginRight: 8,
  },
  imageButtonText: {
    fontSize: 24,
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
  selectedImageContainer: {
    margin: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 150,
  },
  cancelImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelImageText: {
    color: '#fff',
    fontSize: 16,
  },
}); 