import React, { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

type ScryfallCard = {//TODO: Move types to types folder!
  name: string;
  oracle_text: string;
  type_line: string;
  mana_cost?: string;
  image_uris?: {
    normal?: string;
    large?: string;
  };
};

type ScanState = 'READY' | 'SCANNING' | 'SCANNED' | 'ERROR';

const { width, height } = Dimensions.get('window');

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  
  const [facing] = useState<CameraType>('back');

  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('READY');
  const [cardData, setCardData] = useState<ScryfallCard | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const handleScanCard = async () => {
    if (!cameraRef.current) return;
    
    setScanState('SCANNING');
    
    try {
      const photo = await capturePhoto();
      //TODO: Don't analyzeImage before checking it came out right!
      await analyzeImage(photo);
      setScanState('SCANNED');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to scan card');
      console.error(error);
      setScanState('ERROR');
    }
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) throw new Error('Camera not ready');
    
    const photo = await cameraRef.current.takePictureAsync({
      skipProcessing: false,
      exif: false,
      quality: 0.8,
    });

    if (!photo) {
      throw new Error('Failed to capture image');
    }

    const photoWidth = photo.width;
    const photoHeight = photo.height;

    const cropX = 0.1 * photoWidth;
    const cropY = 0.15 * photoHeight;
    const cropWidth = 0.8 * photoWidth;
    const cropHeight = 0.08 * photoHeight;

    const resultImage = await ImageManipulator.manipulateAsync(//TODO: Deprecated
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
      { 
        compress: 0.7, 
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true
      }
    );

    if (!resultImage) {
      throw new Error('Failed to edit image!');
    }

    setEditedImage(resultImage.uri);
    return resultImage.base64;
  };

  const analyzeImage = async (imageBase64: string | undefined) => {
    if (!imageBase64) {
      throw new Error('No image data to analyze');
    }

    try {
      const response = await fetch(//TODO: Search for better/safer way to assign api key!
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.EXPO_PUBLIC_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } },
                { text: 'What is the name of the trading card? Answer only with the name.' }
              ]
            }]
          })
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) throw new Error('No text found in response');
      
      setExtractedText(text);
      await searchCard(text);
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error('Failed to analyze image');
    }
  };

  const searchCard = async (cardName: string) => {
    try {
      const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`);
      const data = await response.json();
      
      if (data.object === 'error') {
        throw new Error(data.details || 'Card not found');
      }
      
      setCardData(data);
    } catch (error) {
      console.error('Card search error:', error);
      throw new Error('Failed to find card');
    }
  };

  const resetScanner = () => {
    setScanState('READY');
    setCardData(null);
    setEditedImage(null);
    setExtractedText(null);
  };

  const renderPermissionRequest = () => (
    <View style={styles.container}>
      <Text style={styles.message}>We need camera permission to scan cards</Text>
      <Button onPress={requestPermission} title="Grant Permission" />
    </View>
  );

  const renderDebugView = () => (
    <View style={styles.container}>
      <Image 
        source={{ uri: editedImage! }}
        style={styles.cardImage}
        resizeMode="contain"
      />
      {extractedText && (
        <View style={styles.textContainer}>
          <Text style={styles.extractedText}>Extracted Text:</Text>
          <Text style={styles.extractedTextContent}>{extractedText}</Text>
        </View>
      )}
      <Button title="Scan Another Card" onPress={resetScanner} />
    </View>
  );

  const renderCardResult = () => (
    <View style={styles.container}>
      {cardData?.image_uris?.normal && (
        <Image 
          source={{ uri: cardData.image_uris.normal }} 
          style={styles.cardImage} 
          resizeMode="contain"
        />
      )}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{cardData?.name}</Text>
        <Text style={styles.cardType}>{cardData?.type_line}</Text>
        {cardData?.mana_cost && (
          <Text style={styles.cardMana}>Cost: {cardData.mana_cost}</Text>
        )}
        <Text style={styles.cardText}>{cardData?.oracle_text}</Text>
      </View>
      <Button title="Scan Another Card" onPress={resetScanner} />
    </View>
  );

  const renderCameraView = () => (
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
            style={[
              styles.scanButton,
              scanState === 'SCANNING' && styles.scanButtonDisabled
            ]} 
            onPress={handleScanCard}
            disabled={scanState === 'SCANNING'}
          >
            {scanState === 'SCANNING' ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Scan Card</Text>
            )}
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );

  if (!permission) return <View />;
  if (!permission.granted) return renderPermissionRequest();
  if (editedImage && scanState !== 'SCANNED') return renderDebugView();
  if (scanState === 'SCANNED' && cardData) return renderCardResult();
  return renderCameraView();
}

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
    ...StyleSheet.absoluteFillObject,
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
  scanButtonDisabled: {
    opacity: 0.7,
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
  textContainer: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    margin: 20,
    borderRadius: 8,
  },
  extractedText: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  extractedTextContent: {
    color: 'white',
  },
});