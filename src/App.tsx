import React, { useEffect, useState } from "react";
import MainScene from "./components/MainScene/MainScene";
import "./static/css/hub.css";
import "./static/css/main.css";
import { Canvas } from "react-three-fiber";
import { RecoilRoot } from "recoil";
import Boot from "./components/Boot";

const App = () => {
  const [moveToGame, setMoveToGame] = useState(false);

  useEffect(() => {
    document.title = "< index >";
    document.getElementsByTagName("body")[0].className = "main-body";
    return () => {
      document.getElementsByTagName("body")[0].className = "";
    };
  }, []);

  return (
    <div id="game-root" className="game">
      {/*<Boot setMoveToGame={setMoveToGame} />*/}
      {/* {moveToGame ? <MainScene /> : <Boot setMoveToGame={setMoveToGame} />} */}
        <Canvas concurrent>
          <RecoilRoot>
            <MainScene />
          </RecoilRoot>
        </Canvas>
    </div>
  );
};

export default App;
