import { useCallback, useEffect } from "react";
import { StateManagerProps } from "../EventManager";
import { useStore } from "../../../store";

const LevelSelectionManager = (props: StateManagerProps) => {
  const setSelectedLevel = useStore((state) => state.setSelectedLevel);

  const dispatchObject = useCallback(
    (eventState: {
      event: string;
      selectedLevelIdx: number;
      level: number;
    }) => {
      switch (eventState.event) {
        case "toggle_level_selection":
          return {
            action: setSelectedLevel,
            value: eventState.level,
          };
        case "level_selection_up":
        case "level_selection_down":
          return {
            action: setSelectedLevel,
            value: eventState.selectedLevelIdx,
          };
      }
    },
    [setSelectedLevel]
  );

  useEffect(() => {
    if (props.eventState) {
      const dispatchedObject = dispatchObject(props.eventState);

      if (dispatchedObject) {
        dispatchedObject.action(dispatchedObject.value as any);
      }
    }
  }, [props.eventState, dispatchObject]);

  return null;
};

export default LevelSelectionManager;
