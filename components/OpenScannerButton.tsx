import React from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenParams } from '../types/params';

type NavigationProp = NativeStackNavigationProp<ScreenParams, 'GameScreen'>;

type ScanButtonProps = {
  playerLayout: number;
};

export default function OpenScannerButton({ playerLayout }: ScanButtonProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation<NavigationProp>();

  const handlePress = async () => {
    if (permission?.granted) {
      navigation.navigate('ScannerScreen');
      return;
    }

    const cameraPermission = await requestPermission();
    
    if (cameraPermission.granted) {
      navigation.navigate('ScannerScreen');
    } else {
      console.log('Camera permission denied');
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.scanButton,
        playerLayout === 1 ? styles.leftAligned : styles.centered
      ]}
      onPress={handlePress}
    >
      <Image
        source={require('../assets/images/ring-inscription.png')}
        style={styles.buttonImage}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  scanButton: {
    zIndex: 1,
    backgroundColor: 'rgb(105,77,37)',
    borderRadius: 45,
    height: 90,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftAligned: {
    position: 'absolute',
    top: '50%',
    right: '5%',
    transform: [{ translateX: -45 }, { translateY: -45 }],
  },
  centered: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -45 }, { translateY: -45 }],
  },
  buttonImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden', 
  },
});
