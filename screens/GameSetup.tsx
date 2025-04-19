import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function GameSetup() {
  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      return () => {
        ScreenOrientation.unlockAsync();
      };
    }, [])
  );

  const [players, setPlayers] = useState<number | null>(null);
  const [startingLife, setStartingLife] = useState<number | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.header}>Players</Text>
        <View style={styles.buttonRow}>
          {['1', '2', '3', '4'].map((player, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.button, players === index + 1 && styles.selectedButton]}
              onPress={() => setPlayers(index + 1)}>
              <Text style={styles.buttonText}>{player}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Starting Life</Text>
        <View style={styles.buttonRow}>
          {[25, 30, 40, 60].map((life) => (
            <TouchableOpacity
              key={life}
              style={[styles.button, startingLife === life && styles.selectedButton]}
              onPress={() => setStartingLife(life)}>
              <Text style={styles.buttonText}>{life}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.startButtonContainer, players && startingLife ? styles.enabledButton : styles.disabledButton]}
          onPress={() => console.log('Game Started')}
          disabled={!players || !startingLife}>
          <Text style={styles.buttonText}>Start Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
    backgroundColor: 'black',
  },
  section: {
    marginTop: 100,
  },
  header: {
    fontFamily: 'MiddleEarth',
    fontSize: 24,
    color: 'white',
    marginBottom: 30,
    alignSelf: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    width: 70,
    height: 70,
    backgroundColor: 'white',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: '#5c5c5c',
  },
  buttonText: {
    fontFamily: 'MiddleEarth',
    fontSize: 18,
    color: 'black',
  },
  startButtonContainer: {
    marginBottom: 30,
    width: 160,
    height: 80,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  disabledButton: {
    backgroundColor: '#5c5c5c', 
  },
  enabledButton: {
    backgroundColor: 'white', 
  },
});
