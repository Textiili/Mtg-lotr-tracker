import { ImageBackground, Image, StyleSheet, Text, View } from "react-native";
import FullscreenHandler from "./components/FullScreenHandler";
import { useState, useEffect, useCallback } from "react";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

const imageUri = require("./assets/images/MiddleEarthMap.webp");
//TODO: Custom splash screen for download?
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [fontsLoaded, fontError] = useFonts({
    'Hobbiton': require('./assets/fonts/HobbitonBrushhand.ttf'),
    'MiddleEarth': require('./assets/fonts/MiddleEarth.ttf'),
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && imageLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, imageLoaded]);

  const onImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, [])

  return (
    <>
      <FullscreenHandler />
      <ImageBackground
        source={imageUri}
        style={styles.background}
        resizeMode="cover"
        onLoad={onImageLoad}
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>Middle-earth</Text>
        </View>
      </ImageBackground>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  text: {
    fontFamily: 'MiddleEarth',
    color: 'black',
    fontSize: 80,
  },
});
