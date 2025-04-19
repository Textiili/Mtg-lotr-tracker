import { View, ActivityIndicator } from "react-native";
import { useFonts } from 'expo-font';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import GameSetup from './screens/GameSetup';

const Stack = createNativeStackNavigator();

export default function App() {

  const [fontsLoaded, fontError] = useFonts({
    'Hobbiton': require('./assets/fonts/HobbitonBrushhand.ttf'),
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
      <Stack.Navigator initialRouteName="Setup">
        <Stack.Screen name="Setup" component={GameSetup} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
