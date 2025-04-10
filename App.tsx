import { View, ActivityIndicator } from "react-native";
import { useFonts } from 'expo-font';
import * as ScreenOrientation from 'expo-screen-orientation'
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useCallback, ReactNode } from "react";
import { useFocusEffect } from "@react-navigation/native";

import GameSetup from './screens/GameSetup';

const Stack = createNativeStackNavigator();

interface OrientationWrapperProps {
  children: ReactNode;
  orientation: ScreenOrientation.OrientationLock;
}

function OrientationWrapper({ children, orientation }: OrientationWrapperProps) {
  useFocusEffect(
    useCallback(() => {
      ScreenOrientation.lockAsync(orientation);
      
      return () => {
        ScreenOrientation.unlockAsync();
      };
    }, [orientation])
  );

  return <>{children}</>;
}

function GameSetupWithOrientation() {
  return (
    <OrientationWrapper orientation={ScreenOrientation.OrientationLock.PORTRAIT}>
      <GameSetup />
    </OrientationWrapper>
  );
}

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
        <Stack.Screen name="Setup" options={{headerShown: false}} component={GameSetupWithOrientation} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
