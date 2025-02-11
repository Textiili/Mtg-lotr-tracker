import { ImageBackground, StyleSheet, Text, View } from "react-native";
import FullscreenHandler from "./components/FullScreenHandler";
import React from "react";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

//TODO: Custom splash screen for download
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'Hobbiton': require('./assets/fonts/HobbitonBrushhand.ttf'),
    'MiddleEarth': require('./assets/fonts/MiddleEarth.ttf'),
  });

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <FullscreenHandler />
      <ImageBackground
        source={require("./assets/images/middle-earth-map.webp")}
        style={styles.background}
        resizeMode="cover"
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
