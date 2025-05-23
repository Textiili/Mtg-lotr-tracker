import { useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';

type OrientationType = 'portrait' | 'landscape';

/**
 * Custom hook to manage screen orientation based on screen focus
 * @param orientation The desired orientation: 'portrait' or 'landscape'
 */
export const useScreenOrientation = (orientation: OrientationType) => {//TODO: Fix screen not locking! Is screen orientation needed?
  useFocusEffect(
    React.useCallback(() => {
      const setOrientation = async () => {
        try {
          await ScreenOrientation.unlockAsync();
          
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