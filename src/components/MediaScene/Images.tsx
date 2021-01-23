import React, {useEffect, useState} from "react";
import {useIdleStore, useMainSceneStore, useSceneStore,} from "../../store";
import {a, useSpring} from "@react-spring/three";
import dummy from "../../static/sprite/dummy.png";
import * as THREE from "three";
import {useLoader} from "react-three-fiber";

const Images = () => {
  const idleNodeImages = useIdleStore((state) => state.images);
  const nodeImages = useMainSceneStore(
    (state) => state.activeNode.image_table_indices
  );

  const currentScene = useSceneStore((state) => state.currentScene);

  const [imageScaleY, setImageScaleY] = useState(3.75);
  const [sceneImages, setSceneImages] = useState([] as any);
  const [activeImage, setActiveImage] = useState<THREE.Texture>();

  const currentSite = useMainSceneStore((state) => state.activeSite);

  const dummyTex = useLoader(THREE.TextureLoader, dummy);

  const mediaPercentageElapsed = useMainSceneStore(
    (state) => state.mediaPercentageElapsed
  );

  const imageScaleState = useSpring({
    imageScaleY: imageScaleY,
    config: { duration: 300 },
  });

  useEffect(() => {
    let images;
    if (currentScene === "media" || currentScene === "tak") {
      images = nodeImages;
    } else if (currentScene === "idle_media") {
      images = idleNodeImages;
    }

    if (images) {
      // checking the length of the img arr doesn't work in some cases
      // since the amount of images varies from 1 to 3.
      // we try all 3 of them for each case, so logging the count to
      // determine whether or not its complete is optimal i think.
      let imgTries = 0;
      const imgArr: { default: string }[] = [];
      Object.entries(images).forEach((img) => {
        imgTries++;
        if (img[1] !== "-1") {
          import(
            "../../static/media_images/" + currentSite + "/" + img[1] + ".png"
          ).then((imageSrc: { default: string }) => {
            imgArr.splice(parseInt(img[0]), 0, imageSrc);
            if (imgTries === 3) {
              setSceneImages(imgArr);
              new THREE.TextureLoader().load(imgArr[0].default, setActiveImage);
            }
          });
        }
      });
    }
  }, [currentScene, currentSite, idleNodeImages, nodeImages]);

  useEffect(() => {
    if (mediaPercentageElapsed === 0 && sceneImages[0]) {
      new THREE.TextureLoader().load(sceneImages[0].default, setActiveImage);
    }
    if (mediaPercentageElapsed === 35 && sceneImages[1]) {
      setImageScaleY(0);
      setTimeout(() => {
        new THREE.TextureLoader().load(sceneImages[1].default, setActiveImage);
        setImageScaleY(3.75);
      }, 300);
    }
    if (mediaPercentageElapsed === 70 && sceneImages[2]) {
      setImageScaleY(0);
      setTimeout(() => {
        new THREE.TextureLoader().load(sceneImages[2].default, setActiveImage);
        setImageScaleY(3.75);
      }, 300);
    }
  }, [mediaPercentageElapsed, sceneImages]);

  return (
    <a.sprite
      position={[-0.2, 0.6, -4]}
      scale={[5, 3.75, 0]}
      scale-y={imageScaleState.imageScaleY}
    >
      <spriteMaterial
        attach="material"
        map={activeImage ? activeImage : dummyTex}
      />
    </a.sprite>
  );
};

export default Images;
