import React, { useState } from 'react';
import { Text, SafeAreaView, View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
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
    <ImageBackground
      source={require('../assets/images/parchment.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
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
        <TouchableOpacity
          onPress={() => navigation.navigate('GameScreen', 
            {
              players: players!,
              startingLife: startingLife!,
            }
          )}
          style={[
            styles.startGameButton,
            (!players || !startingLife) && styles.startGameButtonDisabled,
          ]}
          disabled={!players || !startingLife}
        >
          <Text style={styles.buttonText}>Start game</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  section: {
    marginTop: 100,
  },
  header: {
    fontFamily: 'MiddleEarth',
    fontSize: 35,
    marginBottom: 30,
    alignSelf: 'center',
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: 'rgba(105,77,37, 0.5)',
  },
  selectedButton: {
    backgroundColor: 'rgb(56,38,17)',
  },
  buttonText: {
    fontFamily: 'MiddleEarth',
    fontSize: 18,
    color: 'white',
    textShadowColor: 'black',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 1,
  },
  startGameButton: {
    marginBottom: 100,
    width: 160,
    height: 80,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgb(56,38,17)',
  },
  startGameButtonDisabled: {
    backgroundColor: 'rgba(105,77,37, 0.5)',
  }
});
