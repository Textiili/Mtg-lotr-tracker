import React, { useState, useRef, useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Button, StyleSheet, Text, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { ScryfallCard, ScryfallRuling } from '../types/scryfall';

type ScanState = 'READY' | 'SCANNING' | 'SCANNED' | 'ERROR';

export default function ScannerScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [facing] = useState<CameraType>('back');

  const [scanState, setScanState] = useState<ScanState>('READY');

  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const [cardData, setCardData] = useState<ScryfallCard | null>(null);
  const [rulings, setRulings] = useState<ScryfallRuling[]>([]);

  useEffect(() => {
      const lockOrientation = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      };
      
      lockOrientation();
      
      return () => {
        ScreenOrientation.unlockAsync();
      };
    }, []);

  const handleScanCard = async () => {
    if (!cameraRef.current) return;
    
    setScanState('SCANNING');
    
    try {
      const photo = await capturePhoto();
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
      base64: true,
    });

    if (!photo) {
      throw new Error('Failed to capture image');
    }

    setImage(photo.uri);
    return photo.base64;
  };

  const analyzeImage = async (imageBase64: string | undefined) => {
    if (!imageBase64) {
      throw new Error('No image data to analyze');
    }

    if (!process.env.EXPO_PUBLIC_API_KEY) {
      throw new Error('Api key is missing!');
    }

    try {
      const response = await fetch(//TODO: API_KEY
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
  
      if (data.rulings_uri) {
        const rulingsRes = await fetch(data.rulings_uri);
        const rulingsData = await rulingsRes.json();
        setRulings(rulingsData.data);
      }
    } catch (error) {
      console.error('Card search error:', error);
      throw new Error('Failed to find card');
    }
  };
  
  const resetScanner = () => {
    setScanState('READY');
    setCardData(null);
    setImage(null);
    setExtractedText(null);
  };

  const renderDebugView = () => (
    <SafeAreaView style={styles.container}>
      <Image 
        source={{ uri: image! }}
        style={styles.cardImage}
        resizeMode="contain"
      />
      {extractedText && (
        <View style={styles.textContainer}>
          <Text style={styles.extractedText}>Extracted Text:</Text>
          <Text style={styles.extractedTextContent}>{extractedText}</Text>
        </View>
      )}
      <View style={styles.bottomButtonContainer}>
        <Button title="Scan Another Card" onPress={resetScanner} />
      </View>
    </SafeAreaView>
  );

  const renderCardResult = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.infoContainer}>
          <Text style={styles.header}>CARD INFO:</Text>
          
          <View style={styles.information}>
              {cardData?.image_uris?.normal && (
                <Image 
                  source={{ uri: cardData.image_uris.normal }} 
                  style={styles.cardImage} 
                  resizeMode="cover"
                />
              )}
            <View style={styles.priceTextContainer}>
              {cardData?.prices?.eur && (
                <Text style={styles.priceText}>Standard: {cardData.prices.eur} €</Text>
              )}
              {cardData?.prices?.eur_foil && (
                <Text style={styles.priceText}>Foil: {cardData.prices.eur_foil} €</Text>
              )}
              {cardData?.prices?.usd && (
                <Text style={styles.priceText}>Standard: {cardData.prices.usd} $</Text>
              )}
              {cardData?.prices?.eur_foil && (
                <Text style={styles.priceText}>Foil: {cardData.prices.usd_foil} $</Text>
              )}
            </View>
          </View>
        </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {rulings.length > 0 ? (
          <View style={styles.rulesContainer}>
            {rulings.map((ruling, index) => (
              <Text key={index} style={[styles.cardText, { marginBottom: 20}]}>
                - {ruling.comment} ({ruling.published_at})
              </Text>
            ))}
          </View>
          ) : (
          <View style={styles.rulesContainer}>
            <Text style={styles.noRulesText}>No additional rules found</Text>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.bottomButtonContainer}>
        <Button title="Scan Another Card" onPress={resetScanner} />
      </View>
    </SafeAreaView>
  );

  const renderCameraView = () => (
    <SafeAreaView style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
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
    </SafeAreaView>
  );

  if (image && scanState !== 'SCANNED') return renderDebugView();
  if (scanState === 'SCANNED' && cardData) return renderCardResult();
  return renderCameraView();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
  },
  scanButton: {
    padding: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: 'MiddleEarth',
    color: 'black',
  },
  infoContainer: {
    marginTop: 20,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  header: {
    marginBottom: 20,
    fontSize: 24,
    fontFamily: 'MiddleEarth',
    color: 'white',
    alignSelf: 'center',
  },
  cardType: {
    fontSize: 14,
    fontFamily: 'MiddleEarth',
    color: 'white',
    marginBottom: 10,
    alignSelf: 'center',
  },
  information: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  cardImage: {
    width: 150,
    height: 200,
    borderRadius: 5,
    overflow: 'hidden',
  },
  priceTextContainer: {
    flexDirection: 'column',
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'MiddleEarth',
    color: 'white',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 80, 
  },
  rulesContainer: {
    padding: 20,
  },
  rulesTitle: {
    fontSize: 18,
    fontFamily: 'MiddleEarth',
    color: 'white',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontFamily: 'MiddleEarth',
    color: 'white',
    lineHeight: 24,
  },
  noRulesText: {
    fontSize: 16,
    fontFamily: 'MiddleEarth',
    color: 'white',
    textAlign: 'center',
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
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    backgroundColor: 'black',
    paddingVertical: 10,
  },
});