import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';

type ScryfallCard = {
  name: string;
  oracle_text: string;
  type_line: string;
  mana_cost?: string;
  image_uris?: {
    normal?: string;
    large?: string;
  };
};

export default function CameraScreen() {
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [cardData, setCardData] = useState<ScryfallCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [croppedImageUri, setCroppedImageUri] = useState<string | null>(null);  // NEW
  const cameraRef = useRef<CameraView>(null);

  const scanCard = async () => {
    if (!cameraRef.current) return;

    try {
      setLoading(true);

      const photo = await cameraRef.current.takePictureAsync({
        skipProcessing: false,
        exif: false,
        quality: 0.8,
      });

      if (!photo || !photo.uri) {
        throw new Error('Failed to capture image');
      }

      const photoWidth = photo.width;
      const photoHeight = photo.height;

      const cropX = 0.1 * photoWidth;
      const cropY = 0.15 * photoHeight;
      const cropWidth = 0.8 * photoWidth;
      const cropHeight = 0.08 * photoHeight;

      const cropResult = await ImageManipulator.manipulateAsync(//TODO: Deprecated
        photo.uri,
        [
          {
            crop: {
              originX: cropX,
              originY: cropY,
              width: cropWidth,
              height: cropHeight,
            }
          }
        ],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      if (!cropResult || !cropResult.uri) {
        throw new Error('Failed to crop image');
      }

      setCroppedImageUri(cropResult.uri); 

      //TODO: OCR


    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to scan card');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setCardData(null);
    setSearchText('');
    setCroppedImageUri(null);
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to scan cards</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  if (croppedImageUri) { 
    return (//NOTE: Debug view for cropped image
      <View style={styles.container}>
        <Image 
          source={{ uri: croppedImageUri }}
          style={styles.cardImage}
          resizeMode="contain"
        />
        <Button title="Scan Another Card" onPress={resetScanner} />
      </View>
    );
  }

  if (scanned && cardData) {
    return (
      <View style={styles.container}>
        {cardData.image_uris?.normal && (
          <Image 
            source={{ uri: cardData.image_uris.normal }} 
            style={styles.cardImage} 
            resizeMode="contain"
          />
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{cardData.name}</Text>
          <Text style={styles.cardType}>{cardData.type_line}</Text>
          {cardData.mana_cost && (
            <Text style={styles.cardMana}>Cost: {cardData.mana_cost}</Text>
          )}
          <Text style={styles.cardText}>{cardData.oracle_text}</Text>
        </View>
        <Button title="Scan Another Card" onPress={resetScanner} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <Text style={styles.scanText}>Align card name here</Text>
          </View>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={scanCard}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Scan Card</Text>
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  message: {
    textAlign: 'center',
    color: 'white',
    marginBottom: 20,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scanArea: {
    marginTop: height * 0.15,
    width: width * 0.8,
    height: height * 0.08,
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 20,
  },
  scanButton: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  cardImage: {
    width: '100%',
    height: 300,
    marginTop: 20,
  },
  cardInfo: {
    padding: 20,
    flex: 1,
  },
  cardName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  cardType: {
    fontSize: 18,
    fontStyle: 'italic',
    color: 'white',
    marginBottom: 10,
  },
  cardMana: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: 'white',
    lineHeight: 24,
  },
});
