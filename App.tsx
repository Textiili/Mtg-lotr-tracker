import { View, ActivityIndicator } from "react-native";
import { useFonts } from 'expo-font';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from './types/RootStackParamList';

import GameSetup from './screens/GameSetup';
import GameScreen from "./screens/GameScreen";
import ScannerScreen from "./screens/ScannerScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {

  const [fontsLoaded, fontError] = useFonts({
    'MiddleEarth': require('./assets/fonts/MiddleEarth.ttf'),
  });

  if (!fontsLoaded) {
    return(
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large"/>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="ScannerScreen">
        <Stack.Screen name="GameSetup" component={GameSetup} options={{headerShown: false}} />
        <Stack.Screen name="GameScreen" component={GameScreen} options={{headerShown: false}} />
        <Stack.Screen name="ScannerScreen" component={ScannerScreen} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
