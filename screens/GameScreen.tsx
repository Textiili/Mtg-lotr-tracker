import React, { useState, useRef } from 'react';
import { RouteProp } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import OpenScannerButton from '../components/OpenScannerButton';
import { useScreenOrientation } from '../hooks/useScreenOrientation';
import { ScreenParams } from '../types/params';
import { getRotationForPlayer } from '../utils/rotation';

type GameScreenRouteProp = RouteProp<ScreenParams, 'GameScreen'>;

type Props = {
  route: GameScreenRouteProp;
};

export default function GameScreen({ route }: Props) {
  useScreenOrientation('landscape');

  const { players } = route.params;
  const [lifeTotals, setLifeTotals] = useState<number[]>(
    () => Array.from({ length: players }, () => route.params.startingLife)
  );
  const [commanderDamage, setCommanderDamage] = useState<number[][]>(
    () => Array.from({ length: players }, () => Array(players).fill(0))
  );
  const [commanderMenuVisible, setCommanderMenuVisible] = useState<number | null>(null);
  const [lifeChangeDeltas, setLifeChangeDeltas] = useState<(number | null)[]>(
    () => Array(players).fill(null)
  );

  const deltaTimeouts = useRef<(NodeJS.Timeout | null)[]>(Array(players).fill(null));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const changeLife = (index: number, delta: number) => {
    setLifeTotals(prev => {
      const updated = [...prev];
      updated[index] += delta;
      return updated;
    });

    if (deltaTimeouts.current[index]) {
      clearTimeout(deltaTimeouts.current[index]!);
    }

    setLifeChangeDeltas(prev => {
      const updated = [...prev];
      updated[index] = (updated[index] ?? 0) + delta;
      return updated;
    });

    deltaTimeouts.current[index] = setTimeout(() => {
      setLifeChangeDeltas(prev => {
        const updated = [...prev];
        updated[index] = null;
        return updated;
      });
      deltaTimeouts.current[index] = null;
    }, 1000);
  };

  const changeCommanderDamage = (receiverIndex: number, fromIndex: number, delta: number) => {
    setCommanderDamage(prev => {
      const updated = prev.map(row => [...row]);
      const current = updated[receiverIndex][fromIndex];
      const newValue = Math.min(21, Math.max(0, current + delta));

      const diff = newValue - current;
      if (diff !== 0) changeLife(receiverIndex, -diff);

      updated[receiverIndex][fromIndex] = newValue;
      return updated;
    });
  };

  const toggleCommanderMenu = (index: number) => {
    setCommanderMenuVisible(prev => (prev === index ? null : index));
  };

  const TIMING = {
    initialDelay: 0,
    repeatInterval: 500,
    acceleration: 0.9,
    maxSpeed: 50,
  };

  const startChangingByTen = (index: number, delta: number) => {
    let speed = TIMING.repeatInterval;
    timeoutRef.current = setTimeout(() => {
      const change = () => {
        changeLife(index, delta * 10);
        speed = Math.max(TIMING.maxSpeed, speed * TIMING.acceleration);
        intervalRef.current = setTimeout(change, speed);
      };
      change();
    }, TIMING.initialDelay);
  };

  const stopChangingByTen = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearTimeout(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  };

  const renderPlayerContents = (index: number, viewerIndex: number | null) => {
    const isCommanderTarget = viewerIndex !== null && index !== viewerIndex;
    const rotation = isCommanderTarget ? getRotationForPlayer(players, index, viewerIndex) : 0;

    return (
      <View>
        {isCommanderTarget && (
          <View style={styles.commanderDamageMenuOverlay}>
            <View style={[styles.commanderDamageMenuContent, { transform: [{ rotate: `${rotation}deg` }] }]}>
              <Text style={styles.commanderDamageText}>From player {index + 1}</Text>
              <View style={styles.commanderDamageRow}>
                <TouchableOpacity
                  onPress={() => changeCommanderDamage(viewerIndex, index, -1)}
                  onLongPress={() => changeCommanderDamage(viewerIndex, index, -21)}
                  style={styles.commanderDamageButton}
                >
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.commanderDamageText}>
                  {commanderDamage[viewerIndex][index]}
                </Text>
                <TouchableOpacity
                  onPress={() => changeCommanderDamage(viewerIndex, index, 1)}
                  onLongPress={() => changeCommanderDamage(viewerIndex, index, 21)}
                  style={styles.commanderDamageButton}
                >
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Player stats */}
        <View style={styles.lifeContainer}>
          <TouchableOpacity
            onPress={() => changeLife(index, -1)}
            onLongPress={() => startChangingByTen(index, -1)}
            onPressOut={stopChangingByTen}
            style={styles.button}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => toggleCommanderMenu(index)}>
            <View style={{ alignItems: 'center' }}>
              {lifeChangeDeltas[index] !== null && (
                <Text
                  style={styles.lifeDeltaText}
                >
                  {lifeChangeDeltas[index]! > 0 ? '+' : ''}
                  {lifeChangeDeltas[index]}
                </Text>
              )}
              <Text style={styles.lifeText}>{lifeTotals[index]}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => changeLife(index, 1)}
            onLongPress={() => startChangingByTen(index, 1)}
            onPressOut={stopChangingByTen}
            style={styles.button}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderLayout = () => {
    switch (players) {
      case 1:
        return (
          <View style={styles.singlePlayerContainer}>
            <View style={styles.playerBox}>{renderPlayerContents(0, commanderMenuVisible)}</View>
          </View>
        );
      case 2:
        return (
          <View style={styles.twoPlayerContainer}>
            <View style={[styles.playerBox, { transform: [{ rotate: '90deg' }] }]}>
              {renderPlayerContents(0, commanderMenuVisible)}
            </View>
            <View style={[styles.playerBox, { transform: [{ rotate: '-90deg' }] }]}>
              {renderPlayerContents(1, commanderMenuVisible)}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.threePlayerContainer}>
            <View style={[styles.topRow, styles.flippedRow]}>
              <View style={styles.playerBox}>{renderPlayerContents(0, commanderMenuVisible)}</View>
              <View style={styles.playerBox}>{renderPlayerContents(1, commanderMenuVisible)}</View>
            </View>
            <View style={styles.bottomRow}>
              <View style={styles.playerBox}>{renderPlayerContents(2, commanderMenuVisible)}</View>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.fourPlayerContainer}>
            <View style={[styles.topRow, styles.flippedRow]}>
              <View style={styles.playerBox}>{renderPlayerContents(0, commanderMenuVisible)}</View>
              <View style={styles.playerBox}>{renderPlayerContents(1, commanderMenuVisible)}</View>
            </View>
            <View style={styles.bottomRow}>
              <View style={styles.playerBox}>{renderPlayerContents(2, commanderMenuVisible)}</View>
              <View style={styles.playerBox}>{renderPlayerContents(3, commanderMenuVisible)}</View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/parchment.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <OpenScannerButton playerLayout={players} />
        {renderLayout()}
      </View>
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
    backgroundColor: 'rgba(98, 47, 0, 0.54)',
  },
  singlePlayerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoPlayerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  threePlayerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fourPlayerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flippedRow: {
    transform: [{ rotate: '180deg' }],
  },
  playerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.10)',
    borderRadius: 15,
    minHeight: 150,
  },
  lifeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  lifeText: {
    fontFamily: 'MiddleEarth',
    color: 'black',
    fontSize: 60,
    minWidth: 80,
    textAlign: 'center',
    marginHorizontal: 15,
  },
  lifeDeltaText: {
    position: 'absolute',
    top: -30,
    fontSize: 20,
    fontFamily: 'MiddleEarth',
    textAlign: 'center',
    zIndex: 10,
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.30)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'MiddleEarth',
    fontSize: 30,
    color: 'black',
  },
  commanderDamageMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: -20,
    right: -20,
    bottom: -20,
    backgroundColor: '#5F452A',
    borderRadius: 15,
    zIndex: 2,
  },
  commanderDamageMenuContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commanderDamageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    justifyContent: 'space-between',
  },
  commanderDamageText: {
    color: 'black',
    fontSize: 20,
    fontFamily: 'MiddleEarth',
    minWidth: 60,
    textAlign: 'center',
  },
  commanderDamageButton: {
    backgroundColor: '#76552C',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
});
