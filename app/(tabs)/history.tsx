import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { LineChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SymptomHistory = {
  timestamp: string;
  symptoms: Array<{
    name: string;
    rating: number;
  }>;
};

export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<SymptomHistory[]>([]);
  const [selectedSymptom, setSelectedSymptom] = useState('Overall Health');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('symptomsHistory');
      if (data) {
        const parsedData = JSON.parse(data) as SymptomHistory[];
        setHistory(parsedData);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#A1CEDC" />
      </ThemedView>
    );
  }

  if (history.length === 0) {
    return (
      <ThemedView style={styles.noDataContainer}>
        <ThemedText type="title">No Data Yet</ThemedText>
        <ThemedText style={styles.noDataText}>
          Complete your daily health check-in to see your progress here.
        </ThemedText>
      </ThemedView>
    );
  }

  const chartData = {
    labels: history.slice(-7).map(entry => 
      new Date(entry.timestamp).toLocaleDateString(undefined, { weekday: 'short' })
    ),
    datasets: [
      {
        data: history.slice(-7).map(entry => {
          const symptom = entry.symptoms.find(s => s.name === selectedSymptom);
          return symptom ? symptom.rating : 0;
        }),
        color: () => '#A1CEDC',
        strokeWidth: 2,
      },
    ],
  };

  const calculateAverage = (symptomName: string): number => {
    const ratings = history.slice(-7).map(entry => {
      const symptom = entry.symptoms.find(s => s.name === symptomName);
      return symptom ? symptom.rating : 0;
    });
    const sum = ratings.reduce((a, b) => a + b, 0);
    return Number((sum / ratings.length).toFixed(1));
  };

  const getImprovement = (symptomName: string): string => {
    if (history.length < 2) return 'Not enough data';
    
    const recent = history[history.length - 1].symptoms.find(s => s.name === symptomName)?.rating || 0;
    const previous = history[history.length - 2].symptoms.find(s => s.name === symptomName)?.rating || 0;
    
    if (recent === previous) return 'Stable';
    return recent > previous ? 'Improving' : 'Declining';
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Health History</ThemedText>
        <ThemedText type="subtitle">Your wellness journey over time</ThemedText>
      </ThemedView>

      <ThemedView style={styles.chartContainer}>
        <ThemedText type="defaultSemiBold">{selectedSymptom} Trend</ThemedText>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(161, 206, 220, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#A1CEDC',
            },
          }}
          bezier
          style={styles.chart}
        />
      </ThemedView>

      <ThemedView style={styles.summaryContainer}>
        <ThemedText type="defaultSemiBold">Weekly Summary</ThemedText>
        <ThemedView style={styles.summaryItem}>
          <ThemedText>Average {selectedSymptom}</ThemedText>
          <ThemedText type="defaultSemiBold">{calculateAverage(selectedSymptom)}/10</ThemedText>
        </ThemedView>
        <ThemedView style={styles.summaryItem}>
          <ThemedText>Trend</ThemedText>
          <ThemedText type="defaultSemiBold">{getImprovement(selectedSymptom)}</ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.recommendationsContainer}>
        <ThemedText type="defaultSemiBold">Health Insights</ThemedText>
        <ThemedText style={styles.recommendation}>
          • Track your symptoms daily for better insights
        </ThemedText>
        <ThemedText style={styles.recommendation}>
          • Discuss significant changes with your healthcare provider
        </ThemedText>
        <ThemedText style={styles.recommendation}>
          • Use the chat feature for specific health questions
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  header: {
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  chartContainer: {
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
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  summaryContainer: {
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
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  recommendationsContainer: {
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
  recommendation: {
    marginTop: 8,
  },
}); 