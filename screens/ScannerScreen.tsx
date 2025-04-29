import React, { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Alert, ScrollView, View } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

type ScryfallCard = {
  name: string;
  type_line: string;
  prices: {
    usd?: string;
    usd_foil?: string;
    usd_etched?: string;
  };
  image_uris?: {
    normal?: string;
    large?: string;
  };
  rulings_uri?: string;
};

type ScryfallRuling = {
  object: 'ruling';
  oracle_id: string;
  source: string;
  published_at: string;
  comment: string;
};

type ScanState = 'READY' | 'SCANNING' | 'SCANNED' | 'ERROR';

export default function ScannerScreen() {
  const cameraRef = useRef<CameraView>(null);
  
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanState, setScanState] = useState<ScanState>('READY');

  const [cardData, setCardData] = useState<ScryfallCard | null>(null);
  const [rulings, setRulings] = useState<ScryfallRuling[]>([]);

  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

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

    try {
      const response = await fetch(
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

  const renderPermissionRequest = () => (
    <SafeAreaView style={styles.container}>
      <Text style={styles.message}>Camera permission needed to scan cards!</Text>
      <Button onPress={requestPermission} title="Grant Permission" />
    </SafeAreaView>
  );

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
      <View style={styles.cardHeader}>
          <Text style={styles.cardName}>{cardData?.name}</Text>
          <Text style={styles.cardType}>{cardData?.type_line}</Text>
          
          <View style={styles.infoContainer}>
            {cardData?.image_uris?.normal && (
              <Image 
                source={{ uri: cardData.image_uris.normal }} 
                style={styles.cardImage} 
                resizeMode="contain"
              />
            )}
            <View style={styles.priceTextContainer}>
              {cardData?.prices?.usd && (
                <Text style={styles.priceText}>Standard: ${cardData.prices.usd}</Text>
              )}
              {cardData?.prices?.usd_foil && (
                <Text style={styles.priceText}>Foil: ${cardData.prices.usd_foil}</Text>
              )}
              {cardData?.prices?.usd_etched && (
                <Text style={styles.priceText}>Etched: ${cardData.prices.usd_etched}</Text>
              )}
            </View>
          </View>
        </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {rulings.length > 0 && (
          <View style={styles.rulesContainer}>
            {rulings.map((ruling, index) => (
              <Text key={index} style={[styles.cardText, { marginBottom: 20}]}>
                - {ruling.comment} ({ruling.published_at})
              </Text>
            ))}
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

  if (!permission) return <SafeAreaView />;
  if (!permission.granted) return renderPermissionRequest();
  if (image && scanState !== 'SCANNED') return renderDebugView();
  if (scanState === 'SCANNED' && cardData) return renderCardResult();
  return renderCameraView();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
    color: 'white',
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cardName: {
    fontSize: 24,
    fontFamily: 'MiddleEarth',
    color: 'white',
    marginBottom: 5,
    alignSelf: 'center',
  },
  cardType: {
    fontSize: 14,
    fontFamily: 'MiddleEarth',
    color: 'white',
    marginBottom: 10,
    alignSelf: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: '50%',
    height: 200,
  },
  priceTextContainer: {
    flexDirection: 'column',
  },
  priceText: {
    fontSize: 16,
    fontFamily: 'MiddleEarth',
    color: 'gold',
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