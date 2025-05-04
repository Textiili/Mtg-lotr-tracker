import React, { useState } from 'react';
import { Text, SafeAreaView, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenParams } from '../types/params';
import { useScreenOrientation } from '../hooks/useScreenOrientation';

export default function GameSetup() {
  const navigation = useNavigation<NativeStackNavigationProp<ScreenParams, 'GameSetup'>>();

  useScreenOrientation('portrait');

  const [players, setPlayers] = useState<number | null>(null);
  const [startingLife, setStartingLife] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.header}>Set players:</Text>
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
        <Text style={styles.header}>Set starting life:</Text>
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
        {players !== null && startingLife !== null && (
          <TouchableOpacity
            style={styles.startGameButton}
            onPress={() => navigation.navigate('GameScreen', 
              {
                players: players!,
                startingLife: startingLife!,
              }
            )}
          >
            <Text style={styles.buttonText}>Start game</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
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
    backgroundColor: '#111',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: 'white',
  },
  buttonText: {
    fontFamily: 'MiddleEarth',
    fontSize: 18,
    color: 'white',
  },
  startGameButton: {
    marginBottom: 100,
    width: 160,
    height: 80,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#111',
  },
});
