import React, { useState, useRef } from 'react';
import { RouteProp } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ScanButton from '../components/ScanButton';
import { useScreenOrientation } from '../hooks/useScreenOrientation';
import { ScreenParams } from '../types/params';

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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const changeLife = (index: number, delta: number) => {
    setLifeTotals(prev => {
      const updated = [...prev];
      updated[index] += delta;
      return updated;
    });
  };

  const changeCommanderDamage = (receiverIndex: number, fromIndex: number, delta: number) => {
    setCommanderDamage(prev => {
      const updated = prev.map(row => [...row]);
      const current = updated[receiverIndex][fromIndex];
      const newValue = Math.min(21, Math.max(0, current + delta)); 
  
      if (newValue > current) {
        changeLife(receiverIndex, -(newValue - current));
      }
  
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

  const getOverlayStyle = (viewerIndex: number): object => {//TODO!
    console.log(`Players: ${players} ViewerIndex: ${viewerIndex}`);
    let rotation = 0;
    
    if (players === 2) {
      rotation = viewerIndex === 0 ? 180 : 90;
    } else {
      rotation = viewerIndex > 2 ? 180 : 0;
    }

    return {
      // transform: [{ rotate: `${rotation}deg` }],
    };
  };

  const renderPlayerContents = (index: number, viewerIndex: number | null) => {
    const isCommanderTarget = viewerIndex !== null && index !== viewerIndex;

    return (
      <View>
        {isCommanderTarget && (
          <View style={[styles.commanderMenuOverlay]}>
            <View style={[styles.commanderMenuContent, getOverlayStyle(viewerIndex)]}>
              <Text style={styles.commanderText}>From player {index + 1}</Text>
              <View style={styles.commanderRow}>
                <TouchableOpacity
                  onPress={() => changeCommanderDamage(viewerIndex, index, -1)}
                  style={styles.commanderButton}
                >
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.commanderText}>
                  {commanderDamage[viewerIndex][index]}
                </Text>
                <TouchableOpacity
                  onPress={() => changeCommanderDamage(viewerIndex, index, 1)}
                  style={styles.commanderButton}
                >
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity onPress={() => toggleCommanderMenu(index)}>
          <View style={styles.lifeContainer}>
            <TouchableOpacity
              onPress={() => changeLife(index, -1)}
              onLongPress={() => startChangingByTen(index, -1)}
              onPressOut={stopChangingByTen}
              style={styles.button}
            >
              <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>

            <Text style={styles.lifeText}>{lifeTotals[index]}</Text>

            <TouchableOpacity
              onPress={() => changeLife(index, 1)}
              onLongPress={() => startChangingByTen(index, 1)}
              onPressOut={stopChangingByTen}
              style={styles.button}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
    <View style={styles.container}>
      <ScanButton playerLayout={players} />
      {renderLayout()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
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
    backgroundColor: '#111',
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
    color: 'white',
    fontSize: 60,
    minWidth: 80,
    textAlign: 'center',
    marginHorizontal: 15,
  },
  button: {
    backgroundColor: '#333',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'MiddleEarth',
    fontSize: 30,
    color: 'white',
  },
  commanderMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#222d',
    borderRadius: 15,
    zIndex: 10,
  },
  commanderMenuContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commanderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    justifyContent: 'space-between',
  },
  commanderText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'MiddleEarth',
    minWidth: 90,
    textAlign: 'center',
  },
  commanderButton: {
    backgroundColor: '#444',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
});