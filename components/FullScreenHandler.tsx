import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";

const FullscreenHandler = () => {
  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");

    return () => {
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  return <StatusBar hidden={true} />;
};

export default FullscreenHandler;
