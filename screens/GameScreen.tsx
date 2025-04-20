import React, { useEffect } from 'react';
import { RouteProp } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { View, Text, StyleSheet } from 'react-native';
import { RootStackParamList } from '../types/RootStackParamList';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'GameScreen'>;

type Props = {
  route: GameScreenRouteProp;
};

export default function GameScreen({ route }: Props) {
  if (
    !route?.params ||
    route.params.players == null ||
    route.params.startingLife == null
  ) {
    console.error(`route.params: ${JSON.stringify(route?.params)}`);
    return (//TODO: ErrorScreen.tsx
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: Missing game setup data</Text>
      </View>
    );
  }

  const { players, startingLife } = route.params;

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    
    lockOrientation();
    
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const renderPlayer = (index: number) => (
    <View key={index} style={styles.playerBox}>
      <Text style={styles.lifeText}>Player {index + 1}{'\n'}{startingLife} HP</Text>
    </View>
  );

  const renderLayout = () => {
    switch (players) {
      case 1:
        return renderPlayer(0);
      case 2:
        return <View style={styles.row}>{[0, 1].map(renderPlayer)}</View>;
      case 3:
        return (
          <>
            <View style={styles.row}>{[0, 1].map(renderPlayer)}</View>
            <View style={styles.fullRow}>{renderPlayer(2)}</View>
          </>
        );
      case 4:
        return <View style={styles.grid}>{[0, 1, 2, 3].map(renderPlayer)}</View>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
    padding: 10,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  fullRow: {
    flex: 1,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playerBox: {
    flex: 1,
    margin: 5,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  lifeText: {
    fontFamily: 'MiddleEarth',
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
  },
});