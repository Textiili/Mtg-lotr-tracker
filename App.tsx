import { ImageBackground, StyleSheet, Text, View } from "react-native";
import FullscreenHandler from "./components/FullScreenHandler";
import React from "react";

export default function App() {
  return (
    <>
      <FullscreenHandler />
      <ImageBackground
        source={require("./assets/images/middle-earth-map.webp")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.text}>Tt</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  text: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
