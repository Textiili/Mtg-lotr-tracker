import React, { useEffect, useState, useRef } from 'react';
import { RouteProp } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ScreenParams } from '../types/params';
import ScanButton from '../components/ScanButton';

type GameScreenRouteProp = RouteProp<ScreenParams, 'GameScreen'>;

type Props = {
  route: GameScreenRouteProp;
};

export default function GameScreen({ route }: Props) {
  // if (!route?.params || !route.params.players || !route.params.startingLife) {
  //   console.error(`route.params: ${JSON.stringify(route?.params)}`);
  //   return (
  //     <View style={styles.errorContainer}>
  //       <Text style={styles.errorText}>Error: Missing game setup data</Text>
  //     </View>
  //   );
  // }

  const { players } = route.params;
  const [lifeTotals, setLifeTotals] = useState<number[]>(() =>
    Array.from({ length: route.params.players }, () => route.params.startingLife)
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    
    lockOrientation();
    
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const changeLife = (index: number, delta: number) => {
    setLifeTotals(prev => {
      const updated = [...prev];
      updated[index] += delta;
      return updated;
    });
  };
  
  const TIMING = {
    initialDelay: 0,
    repeatInterval: 500,  
    acceleration: 0.90,  
    maxSpeed: 50          
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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  };
  
  const renderPlayerContents = (index: number) => {
    return (
      <>
        <View style={styles.lifeContainer}>
          <TouchableOpacity
            onPress={() => changeLife(index, -1)}
            onLongPress={() => startChangingByTen(index, -1)}
            onPressOut={() => stopChangingByTen()}
            style={styles.button}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.lifeText}>{lifeTotals[index]}</Text>

          <TouchableOpacity
            onPress={() => changeLife(index, 1)}
            onLongPress={() => startChangingByTen(index, 1)}
            onPressOut={() => {
              stopChangingByTen();
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };
  
  const renderLayout = () => {
    switch (players) {
      case 1:
        return (
          <View style={styles.singlePlayerContainer}>
            <View style={styles.playerBox}>
              {renderPlayerContents(0)}
            </View>
          </View>
        );
      case 2:
        return (
          <View style={styles.twoPlayerContainer}>
            <View style={[
              styles.playerBox, 
              { transform: [{ rotate: '90deg' }] }
            ]}>
              {renderPlayerContents(0)}
            </View>
            <View style={[
              styles.playerBox, 
              { transform: [{ rotate: '-90deg' }] }
            ]}>
              {renderPlayerContents(1)}
            </View>
          </View>
        );
      case 3:
        return (
          <View style={styles.threePlayerContainer}>
            <View style={[styles.topRow, styles.flippedRow]}>
              <View style={styles.playerBox}>
                {renderPlayerContents(0)}
              </View>
              <View style={styles.playerBox}>
                {renderPlayerContents(1)}
              </View>
            </View>
            <View style={styles.bottomRow}>
              <View style={styles.playerBox}>
                {renderPlayerContents(2)}
              </View>
            </View>
          </View>
        );
      case 4:
        return (
          <View style={styles.fourPlayerContainer}>
            <View style={[styles.topRow, styles.flippedRow]}>
              <View style={styles.playerBox}>
                {renderPlayerContents(0)}
              </View>
              <View style={styles.playerBox}>
                {renderPlayerContents(1)}
              </View>
            </View>
            <View style={styles.bottomRow}>
              <View style={styles.playerBox}>
                {renderPlayerContents(2)}
              </View>
              <View style={styles.playerBox}>
                {renderPlayerContents(3)}
              </View>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black'
  },
  errorText: {
    textAlign: 'center', 
    color: 'red', 
    fontSize: 18
  },
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
});