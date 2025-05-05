import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  SafeAreaView, Image, 
  ActivityIndicator,
  ScrollView, 
  View
} from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { ScryfallCard, ScryfallRuling } from '../types/scryfall';
import { useScreenOrientation } from '../hooks/useScreenOrientation';
import { analyzeImage } from '../utils/analyzeImage';
import { fetchCardData } from '../utils/fetchCardData';

type ScanState = 'READY' | 'SCANNING' | 'SCANNED' | 'ERROR'; 

export default function ScannerScreen() {
  const cameraRef = useRef<CameraView>(null);

  const [cameraFacing] = useState<CameraType>('back');

  useScreenOrientation('portrait');

  const [scanState, setScanState] = useState<ScanState>('READY');

  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

  const [cardData, setCardData] = useState<ScryfallCard | null>(null);
  const [rulings, setRulings] = useState<ScryfallRuling[]>([]);

  const handleScanCard = async () => {
    if (!cameraRef.current) return;
    
    setScanState('SCANNING');
    
    try {
      const photo = await capturePhoto();
      const imageText = await analyzeImage(photo, process.env.EXPO_PUBLIC_API_KEY);
      setExtractedText(imageText);

      const data = await fetchCardData(imageText);
      setCardData(data.card);
      setRulings(data.rulings);
      setScanState('SCANNED');
    } catch (error) {
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
  
  const resetScanner = () => {
    setScanState('READY');
    setCardData(null);
    setImage(null);
    setExtractedText(null);
  };

  const renderDebugView = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.debugWrapper}>
        <View style={styles.debugTop}>
          <Image 
            source={{ uri: image! }}
            style={styles.debugImage}
            resizeMode="contain"
          />
          {extractedText && (
            <View style={styles.extractedTextContainer}>
              <Text style={styles.extractedText}>Extracted Text:</Text>
              <Text style={styles.extractedTextContent}>{extractedText}</Text>
            </View>
          )}
        </View>
  
        <View style={styles.debugBottom}>
          <TouchableOpacity
            onPress={resetScanner}
            style={[
              styles.scanAnotherCardButton,
              scanState === 'SCANNING' && styles.scanAnotherCardButtonDisabled
            ]} 
            disabled={scanState === 'SCANNING'}
          >
            {scanState === 'SCANNING' ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.scanAnotherCardButtonText}>Scan Another Card</Text>
            )}
          </TouchableOpacity>
        </View>
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
      
      <TouchableOpacity
        onPress={resetScanner}
        style={styles.scanAnotherCardButton}
      >
        <Text style={styles.scanAnotherCardButtonText}>Scan Another Card</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  const renderCameraView = () => (
    <SafeAreaView style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={cameraFacing}
        ref={cameraRef}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            onPress={handleScanCard}
            style={styles.scanButton} 
            disabled={scanState === 'SCANNING'}
          >
            {scanState === 'SCANNING' ? (
              <ActivityIndicator color="black" />
            ) : (
              <Image
                source={require('../assets/images/ring-inscription.png')}
                style={styles.scanButtonImage}
                resizeMode="contain"
              />
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
    backgroundColor: 'black'
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: '20%',
  },
  scanButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.20)',
    borderRadius: 60,
    width: 120,
    height: 120,
    justifyContent: 'space-around',
  },
  scanButtonImage: {
    width: '100%',
    height: '100%',
  },
  debugWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  debugTop: {
    alignItems: 'center',
    marginTop: '10%',
  },
  debugImage: {
    width: 200,
    height: 280,
    borderRadius: 8,
    marginBottom: 20,
  },
  extractedTextContainer: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    margin: 20,
    borderRadius: 8,
  },
  extractedText: {
    color: 'white',
    fontSize: 30,
    fontFamily: 'MiddleEarth',
    marginBottom: 5,
    textAlign: 'center',
  },
  extractedTextContent: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'MiddleEarth',
  },
  debugBottom: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  scanAnotherCardButton: {
    marginTop: 10,
    marginBottom: 10,
    width: 200,
    height: 90,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'white',
  },
  scanAnotherCardButtonText: {
    fontSize: 15,
    fontFamily: 'MiddleEarth',
    color: 'black',
  },
  scanAnotherCardButtonDisabled: {
    opacity: 0.5,
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
});