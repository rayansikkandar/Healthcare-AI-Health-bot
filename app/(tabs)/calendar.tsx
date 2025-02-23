import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';

type SymptomHistory = {
  timestamp: string;
  symptoms: Array<{
    name: string;
    rating: number;
  }>;
  isMorningSurvey: boolean;
};

type ChatHistory = {
  timestamp: string;
  text: string;
  sender: 'user' | 'ai';
};

type MarkedDates = {
  [key: string]: {
    marked: boolean;
    dotColor: string;
  };
};

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [sickDaysCount, setSickDaysCount] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadHealthData();
  }, [currentMonth]);

  const loadHealthData = async () => {
    try {
      // Load survey history
      const surveyData = await AsyncStorage.getItem('symptomsHistory');
      const chatData = await AsyncStorage.getItem('chatHistory');
      
      const marked: MarkedDates = {};
      let sickCount = 0;

      // Process survey data
      if (surveyData) {
        const surveyHistory = JSON.parse(surveyData) as SymptomHistory[];
        surveyHistory.forEach(entry => {
          const date = new Date(entry.timestamp);
          const dateStr = date.toISOString().split('T')[0];
          
          // Calculate average rating
          const totalRating = entry.symptoms.reduce((sum, symptom) => sum + symptom.rating, 0);
          const avgRating = totalRating / entry.symptoms.length;
          
          // Mark dates where average rating was below 6 (indicating not feeling well)
          if (avgRating < 6) {
            marked[dateStr] = {
              marked: true,
              dotColor: '#A1CEDC'
            };
            
            // Count sick days for current month
            const entryMonth = date.getMonth();
            const entryYear = date.getFullYear();
            if (entryMonth === currentMonth.getMonth() && entryYear === currentMonth.getFullYear()) {
              sickCount++;
            }
          }
        });
      }

      // Process chat data
      if (chatData) {
        const chatHistory = JSON.parse(chatData) as ChatHistory[];
        const sicknessKeywords = ['sick', 'ill', 'unwell', 'fever', 'pain', 'ache', 'nausea', 'vomit', 'headache'];
        
        chatHistory.forEach(entry => {
          if (entry.sender === 'user') {
            const date = new Date(entry.timestamp);
            const dateStr = date.toISOString().split('T')[0];
            
            // Check if any sickness keywords are mentioned
            const hasSicknessKeyword = sicknessKeywords.some(keyword => 
              entry.text.toLowerCase().includes(keyword)
            );
            
            if (hasSicknessKeyword && !marked[dateStr]) {
              marked[dateStr] = {
                marked: true,
                dotColor: '#A1CEDC'
              };
              
              // Count sick days for current month if not already counted
              const entryMonth = date.getMonth();
              const entryYear = date.getFullYear();
              if (entryMonth === currentMonth.getMonth() && entryYear === currentMonth.getFullYear()) {
                sickCount++;
              }
            }
          }
        });
      }

      setMarkedDates(marked);
      setSickDaysCount(sickCount);
    } catch (error) {
      console.error('Error loading health data:', error);
    }
  };

  const onMonthChange = (month: any) => {
    const newDate = new Date(month.timestamp);
    setCurrentMonth(newDate);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Health Calendar</ThemedText>
        <ThemedText type="subtitle">Track Your Well-being</ThemedText>
      </ThemedView>

      <Calendar
        style={styles.calendar}
        markedDates={markedDates}
        onMonthChange={onMonthChange}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#000000',
          selectedDayBackgroundColor: '#A1CEDC',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#A1CEDC',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#A1CEDC',
          selectedDotColor: '#ffffff',
          arrowColor: '#A1CEDC',
          monthTextColor: '#000000',
          indicatorColor: '#A1CEDC',
        }}
      />

      <ThemedView style={styles.summary}>
        <ThemedText style={styles.summaryText}>
          You reported feeling unwell {sickDaysCount} {sickDaysCount === 1 ? 'day' : 'days'} this month
        </ThemedText>
      </ThemedView>
    </ThemedView>
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
  calendar: {
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  summary: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    margin: 16,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 16,
    textAlign: 'center',
  },
}); 