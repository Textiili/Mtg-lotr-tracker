import { useEffect } from "react";
import { useFonts } from 'expo-font';
import { Platform } from "react-native";
import * as SplashScreen from 'expo-splash-screen';
import * as NavigationBar from 'expo-navigation-bar';
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ScreenParams } from './types/params';

import GameSetup from './screens/GameSetup';
import GameScreen from "./screens/GameScreen";
import ScannerScreen from "./screens/ScannerScreen";

const Stack = createNativeStackNavigator<ScreenParams>();

export default function App() {
  //TODO: fontError handling and errorBoundary?
  const [fontsLoaded, fontError] = useFonts({
    'MiddleEarth': require('./assets/fonts/MiddleEarth.ttf'),
  });

  useEffect(() => {
    async function hideSystemBars() {
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync('hidden');
        await NavigationBar.setBackgroundColorAsync('transparent');
      }
    }
    
    hideSystemBars();

    if (!fontsLoaded) {
      SplashScreen.preventAutoHideAsync();
    } else {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return;
  }
  
  return (
    <NavigationContainer>
      <StatusBar hidden={true}/>
      <Stack.Navigator initialRouteName="GameSetup">
        <Stack.Screen name="GameSetup" component={GameSetup} options={{headerShown: false}} />
        <Stack.Screen name="GameScreen" component={GameScreen} options={{headerShown: false}} />
        <Stack.Screen name="ScannerScreen" component={ScannerScreen} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
