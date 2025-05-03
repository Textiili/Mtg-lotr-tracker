// src/hooks/useScreenOrientation.ts
import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';

type OrientationType = 'portrait' | 'landscape';

/**
 * Custom hook to manage screen orientation based on screen focus
 * @param orientation The desired orientation: 'portrait' or 'landscape'
 */
export const useScreenOrientation = (orientation: OrientationType) => {
  useFocusEffect(
    React.useCallback(() => {
      const setOrientation = async () => {
        try {
          // First unlock any existing orientation lock
          await ScreenOrientation.unlockAsync();
          
          // Then lock to the requested orientation
          if (orientation === 'portrait') {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            console.log('Portrait orientation set');
          } else {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            console.log('Landscape orientation set');
          }
        } catch (error) {
          console.error(`Failed to set ${orientation} orientation:`, error);
        }
      };

      setOrientation();
    }, [orientation])
  );
};