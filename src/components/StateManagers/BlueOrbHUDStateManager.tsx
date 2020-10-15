import React, { useEffect, useMemo } from "react";
import { useBlueOrbStore } from "../../store";

const BlueOrbHUDStateManager = (props: any) => {
  const setCurrentBlueOrbHudId = useBlueOrbStore((state) => state.setCurrentBlueOrbHudId);
  const toggleHud = useBlueOrbStore((state) => state.toggleHud);

  const dispatcherObjects = useMemo(
    () => ({
      moveUp: { duration: 3903.704 },
      moveDown: { duration: 3903.704 },
      moveLeft: { duration: 3903.704 },
      moveRight: { duration: 3903.704 },
      changeBlueOrbFocus: { duration: 500 },
    }),
    []
  );

  useEffect(() => {
    if (props.eventState) {
      const targetBlueOrbHudId = props.targetBlueOrbHudId;

      const dispatchedAction =
        dispatcherObjects[props.eventState as keyof typeof dispatcherObjects];

      toggleHud();

      setTimeout(() => {
        setCurrentBlueOrbHudId(targetBlueOrbHudId);

        toggleHud();
      }, dispatchedAction.duration);
    }
  }, [
    dispatcherObjects,
    props.eventState,
    props.targetBlueOrbGreenText,
    props.targetBlueOrbHudId,
    setCurrentBlueOrbHudId,
    toggleHud,
  ]);
  return null;
};

export default BlueOrbHUDStateManager;
