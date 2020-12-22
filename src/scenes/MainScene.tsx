import { a } from "@react-spring/three";
import { OrbitControls } from "@react-three/drei";
import React, { Suspense } from "react";
import Site from "../components/MainScene/Site";
import Lain from "../components/MainScene/Lain";
import Preloader from "../components/Preloader";
import GrayPlanes from "../components/MainScene/GrayPlanes";
import MiddleRing from "../components/MainScene/MiddleRing";
import { useMainSceneStore } from "../store";
import GreenTextRenderer from "../components/TextRenderer/GreenTextRenderer";
import HUD from "../components/MainScene/HUD";
import YellowOrb from "../components/MainScene/YellowOrb";
import YellowTextRenderer from "../components/TextRenderer/YellowTextRenderer";
import LevelSelection from "../components/MainScene/LevelSelection";
import Pause from "../components/MainScene/PauseSubscene/Pause";
import Starfield from "../components/MainScene/Starfield/Starfield";

const MainScene = () => {
  const currentSubscene = useMainSceneStore((state) => state.subscene);

  const isPaused = currentSubscene === "pause";

  return (
    <perspectiveCamera position-z={3}>
      <Suspense fallback={null}>
        <a.group>
          <Preloader />
          <Site />
          <HUD visible={!isPaused} />
          <GreenTextRenderer visible={!isPaused} />
          <YellowTextRenderer visible={!isPaused} />
          <YellowOrb visible={!isPaused} />
          <GrayPlanes visible={!isPaused} />
          <MiddleRing />
          <LevelSelection visible={!isPaused} />
          <Pause visible={isPaused} />
          <Starfield visible={!isPaused} />
          <OrbitControls />
          <pointLight color={0xffffff} position={[0, 0, 7]} intensity={1} />
          <pointLight color={0x7f7f7f} position={[0, 10, 0]} intensity={1.5} />
          <pointLight color={0xffffff} position={[8, 0, 0]} intensity={0.2} />
          <pointLight color={0xffffff} position={[-8, 0, 0]} intensity={0.2} />
        </a.group>
        <Lain />
      </Suspense>
    </perspectiveCamera>
  );
};
export default MainScene;
