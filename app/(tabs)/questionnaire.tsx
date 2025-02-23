import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

type SymptomRating = {
  name: string;
  rating: number;
};

const SYMPTOMS = [
  { name: 'Overall Health', rating: 5 },
  { name: 'Energy Level', rating: 5 },
  { name: 'Pain Level', rating: 5 },
  { name: 'Mood', rating: 5 },
  { name: 'Sleep Quality', rating: 5 },
];

const DEMO_INTERVAL = 1; // 1 minute for demo
const NORMAL_INTERVAL = 24; // 24 hours for normal operation

export default function QuestionnaireScreen() {
  const [symptoms, setSymptoms] = useState<SymptomRating[]>(SYMPTOMS);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [lastSubmissionTime, setLastSubmissionTime] = useState<Date | null>(null);
  const [timeUntilNextSubmission, setTimeUntilNextSubmission] = useState('');
  const [isMorningSurvey, setIsMorningSurvey] = useState(true);

  useEffect(() => {
    checkSurveyStatus();
    const interval = setInterval(() => {
      updateTimeUntilNext();
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSubmissionTime]);

  const checkSurveyStatus = async () => {
    try {
      const lastSubmission = await AsyncStorage.getItem('lastSubmissionTime');
      if (!lastSubmission) {
        setHasSubmittedToday(false);
        return;
      }

      const lastTime = new Date(lastSubmission);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);

      if (hoursDiff < NORMAL_INTERVAL) {
        setHasSubmittedToday(true);
        const nextTime = new Date(lastTime);
        nextTime.setHours(lastTime.getHours() + NORMAL_INTERVAL);
        const timeDiff = nextTime.getTime() - now.getTime();
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilNextSubmission(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        );
      } else {
        setHasSubmittedToday(false);
        setTimeUntilNextSubmission('');
      }
    } catch (error) {
      console.error('Error checking survey status:', error);
    }
  };

  const getRatingDescription = (rating: number): string => {
    if (rating <= 2) return 'Very Poor';
    if (rating <= 4) return 'Poor';
    if (rating <= 6) return 'Fair';
    if (rating <= 8) return 'Good';
    return 'Excellent';
  };

  const handleSubmit = async () => {
    try {
      const now = new Date();
      await AsyncStorage.setItem('lastSubmissionTime', now.toISOString());
      setLastSubmissionTime(now);
      setHasSubmittedToday(true);

      const existingData = await AsyncStorage.getItem('symptomsHistory');
      const history = existingData ? JSON.parse(existingData) : [];
      history.push({
        timestamp: now.toISOString(),
        symptoms,
        isMorningSurvey,
      });
      await AsyncStorage.setItem('symptomsHistory', JSON.stringify(history));

      // Navigate back to home
      router.back();
    } catch (error) {
      console.error('Error saving submission:', error);
    }
  };

  const resetSurvey = async () => {
    try {
      // Clear all relevant data
      await AsyncStorage.removeItem('lastSubmissionTime');
      await AsyncStorage.removeItem('symptomsHistory');
      await AsyncStorage.removeItem('chatHistory');
      
      // Reset states
      setHasSubmittedToday(false);
      setTimeUntilNextSubmission('');
      setLastSubmissionTime(null);
      
      // Reset symptoms to default values
      setSymptoms(SYMPTOMS);
      
      // Navigate back to home screen
      router.back();
    } catch (error) {
      console.error('Error resetting survey:', error);
    }
  };

  const updateTimeUntilNext = () => {
    if (!lastSubmissionTime) return;

    const now = new Date();
    const nextSubmissionTime = new Date(lastSubmissionTime);
    nextSubmissionTime.setHours(lastSubmissionTime.getHours() + NORMAL_INTERVAL);

    const timeDiff = nextSubmissionTime.getTime() - now.getTime();
    if (timeDiff <= 0) {
      setHasSubmittedToday(false);
      setTimeUntilNextSubmission('');
      return;
    }

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    setTimeUntilNextSubmission(
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    );
  };

  if (hasSubmittedToday) {
    return (
      <ThemedView style={styles.completedContainer}>
        <ThemedText type="title">Morning Check-in Completed</ThemedText>
        <ThemedText style={styles.completedText}>
          Morning check-in completed! Next check-in will be available in:
        </ThemedText>
        <ThemedText type="title" style={styles.timer}>
          {timeUntilNextSubmission}
        </ThemedText>
        <TouchableOpacity style={styles.submitButton} onPress={resetSurvey}>
          <ThemedText style={styles.submitButtonText}>Reset Survey (Demo)</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Morning Health Check</ThemedText>
        <ThemedText type="subtitle">How are you feeling this morning?</ThemedText>
      </ThemedView>

      {symptoms.map((symptom, index) => (
        <ThemedView key={symptom.name} style={styles.symptomContainer}>
          <ThemedText type="defaultSemiBold">{symptom.name}</ThemedText>
          <ThemedText style={styles.ratingText}>
            {getRatingDescription(symptom.rating)} ({symptom.rating}/10)
          </ThemedText>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={symptom.rating}
            onValueChange={(value) => {
              const newSymptoms = [...symptoms];
              newSymptoms[index] = { ...newSymptoms[index], rating: value };
              setSymptoms(newSymptoms);
            }}
            minimumTrackTintColor="#A1CEDC"
            maximumTrackTintColor="#E3F2FD"
            thumbTintColor="#A1CEDC"
          />
          <ThemedView style={styles.sliderLabels}>
            <ThemedText style={styles.sliderLabel}>Worst</ThemedText>
            <ThemedText style={styles.sliderLabel}>Best</ThemedText>
          </ThemedView>
        </ThemedView>
      ))}

      <TouchableOpacity 
        style={styles.submitButton}
        onPress={handleSubmit}>
        <ThemedText style={styles.submitButtonText}>Submit Check-in</ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  symptomContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: -8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  ratingText: {
    textAlign: 'center',
    marginVertical: 8,
  },
  submitButton: {
    backgroundColor: '#A1CEDC',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completedContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  completedText: {
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 16,
  },
  nextSubmissionText: {
    marginTop: 32,
    opacity: 0.7,
  },
  timer: {
    marginTop: 8,
    fontSize: 36,
    fontVariant: ['tabular-nums'],
  },
}); 