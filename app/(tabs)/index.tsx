import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Platform, TouchableOpacity, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SURVEY_INTERVAL = 12; // hours

export default function HomeScreen() {
  const [nextSurveyTime, setNextSurveyTime] = useState<string>('');
  const [canTakeSurvey, setCanTakeSurvey] = useState(true);
  const [isMorningSurvey, setIsMorningSurvey] = useState(true);
  const [completedMorningSurvey, setCompletedMorningSurvey] = useState(false);

  useEffect(() => {
    checkSurveyStatus();
    const interval = setInterval(checkSurveyStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetSurveyTimer = async () => {
    try {
      if (completedMorningSurvey) {
        // If morning survey is done, make evening survey available
        await AsyncStorage.setItem('completedMorningSurvey', 'true');
        await AsyncStorage.removeItem('lastSubmissionTime');
        await AsyncStorage.removeItem('completedEveningSurvey');
        setIsMorningSurvey(false);
        setCanTakeSurvey(true);
        setNextSurveyTime('');
      } else {
        // Reset everything to morning survey
        await AsyncStorage.removeItem('lastSubmissionTime');
        await AsyncStorage.removeItem('completedMorningSurvey');
        await AsyncStorage.removeItem('completedEveningSurvey');
        await AsyncStorage.removeItem('symptomsHistory');
        setIsMorningSurvey(true);
        setCanTakeSurvey(true);
        setCompletedMorningSurvey(false);
        setNextSurveyTime('');
      }
    } catch (error) {
      console.error('Error resetting survey timer:', error);
    }
  };

  const checkSurveyStatus = async () => {
    try {
      const lastSubmission = await AsyncStorage.getItem('lastSubmissionTime');
      const morningStatus = await AsyncStorage.getItem('completedMorningSurvey');
      const eveningStatus = await AsyncStorage.getItem('completedEveningSurvey');
      
      setCompletedMorningSurvey(morningStatus === 'true');
      
      if (morningStatus === 'true' && !eveningStatus) {
        // Morning survey completed, waiting for evening
        setIsMorningSurvey(false);
        
        if (lastSubmission) {
          const lastTime = new Date(lastSubmission);
          const now = new Date();
          const hoursDiff = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < SURVEY_INTERVAL) {
            setCanTakeSurvey(false);
            const nextTime = new Date(lastTime);
            nextTime.setHours(lastTime.getHours() + SURVEY_INTERVAL);
            const timeDiff = nextTime.getTime() - now.getTime();
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            setNextSurveyTime(
              `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
            );
          } else {
            setCanTakeSurvey(true);
            setNextSurveyTime('');
          }
        } else {
          setCanTakeSurvey(true);
          setNextSurveyTime('');
        }
      } else if (!morningStatus) {
        // No surveys completed, show morning survey
        setIsMorningSurvey(true);
        setCanTakeSurvey(true);
        setNextSurveyTime('');
      }
    } catch (error) {
      console.error('Error checking survey status:', error);
    }
  };

  const getSurveyTitle = () => {
    if (!canTakeSurvey) {
      return 'Evening Survey Available Soon';
    }
    return isMorningSurvey ? 'Morning Health Check-in' : 'Evening Health Check-in';
  };

  const getSurveySubtitle = () => {
    if (!canTakeSurvey) {
      return `Next survey available in: ${nextSurveyTime}`;
    }
    return isMorningSurvey 
      ? 'How are you feeling this morning?' 
      : 'How did you feel throughout the day?';
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#E3F2FD', dark: '#1A237E' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.welcomeSection}>
          <ThemedText type="title">HealthScore</ThemedText>
          <ThemedText type="subtitle">Your Personal Health Assistant</ThemedText>
        </ThemedView>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/chat')}>
            <ThemedText type="defaultSemiBold">Start Health Chat</ThemedText>
            <ThemedText>Discuss your symptoms with AI</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, !canTakeSurvey && styles.actionButtonDisabled]}
            onPress={() => canTakeSurvey && router.push('/questionnaire')}
            disabled={!canTakeSurvey}>
            <ThemedText type="defaultSemiBold">{getSurveyTitle()}</ThemedText>
            <ThemedText>{getSurveySubtitle()}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/history')}>
            <ThemedText type="defaultSemiBold">Health History</ThemedText>
            <ThemedText>View your progress over time</ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedView style={styles.healthTipsSection}>
          <ThemedText type="subtitle">Today's Health Tip</ThemedText>
          <ThemedText>
            Regular health tracking helps identify patterns and improve your well-being.
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerImage: {
    height: 150,
    width: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    bottom: 0,
  },
  welcomeSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  quickActions: {
    gap: 16,
  },
  actionButton: {
    backgroundColor: '#A1CEDC',
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#A1CEDC',
  },
  actionButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#E3F2FD',
    borderColor: '#E3F2FD',
  },
  healthTipsSection: {
    marginTop: 32,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    gap: 8,
  },
  resetButton: {
    backgroundColor: '#E3F2FD',
    borderColor: '#A1CEDC',
    marginTop: 16,
  },
});
