import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";

const FullscreenHandler = () => {
  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");

    return () => {
      // Restore navigation bar when component unmounts (optional)
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  return <StatusBar hidden={true} />;
};

export default FullscreenHandler;
