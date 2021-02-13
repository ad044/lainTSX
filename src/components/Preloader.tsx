import introSpriteSheet from "../static/sprite/intro.png";
import moveDownSpriteSheet from "../static/sprite/jump_down.png";
import moveUpSpriteSheet from "../static/sprite/jump_up.png";
import standingSpriteSheet from "../static/sprite/standing.png";
import moveLeftSpriteSheet from "../static/sprite/move_left.png";
import moveRightSpriteSheet from "../static/sprite/move_right.png";
import bigHudSpriteSheet from "../static/sprite/big_hud.png";
import longHudSpriteSheet from "../static/sprite/long_hud.png";
import boringHudSpriteSheet from "../static/sprite/long_hud_boring.png";
import throwNodeSpriteSheet from "../static/sprite/throw_node.png";
import ripMiddleRingSpriteSheet from "../static/sprite/rip_middle_ring.png";
import ripNodeSpriteSheet from "../static/sprite/rip_node.png";
import prayerSpriteSheet from "../static/sprite/prayer.png";
import knockSpriteSheet from "../static/sprite/knock.png";
import knockAndFallSpriteSheet from "../static/sprite/knock_and_fall.png";
import touchAndScareSpriteSheet from "../static/sprite/touch_and_scare.png";
import touchSleeveSpriteSheet from "../static/sprite/touch_sleeve.png";
import thinkingSpriteSheet from "../static/sprite/thinking.png";
import stretchSpriteSheet from "../static/sprite/stretch.png";
import stretch2SpriteSheet from "../static/sprite/stretch_2.png";
import spinSpriteSheet from "../static/sprite/spin.png";
import scratchHeadSpriteSheet from "../static/sprite/scratch_head.png";
import blushSpriteSheet from "../static/sprite/blush.png";
import handsBehindHeadSpriteSheet from "../static/sprite/hands_behind_head.png";
import handsOnHipsSpriteSheet from "../static/sprite/hands_on_hips.png";
import handsOnHips2SpriteSheet from "../static/sprite/hands_on_hips_2.png";
import handsTogetherSpriteSheet from "../static/sprite/hands_together.png";
import leanForwardSpriteSheet from "../static/sprite/lean_forward.png";
import leanLeftSpriteSheet from "../static/sprite/lean_left.png";
import leanRightSpriteSheet from "../static/sprite/lean_right.png";
import lookAroundSpriteSheet from "../static/sprite/look_around.png";
import playWithHairSpriteSheet from "../static/sprite/play_with_hair.png";

import * as THREE from "three";
import { useLoader, useThree } from "react-three-fiber";
import { memo, useLayoutEffect } from "react";

// this function just preloads lain's spritesheets and other assets cuz they're big and lazy loading them
// used to make the suspense run for a couple milliseconds, resulting in flickering
const Preloader = memo(() => {
  const intro = useLoader(THREE.TextureLoader, introSpriteSheet);
  const moveDown = useLoader(THREE.TextureLoader, moveDownSpriteSheet);
  const moveUp = useLoader(THREE.TextureLoader, moveUpSpriteSheet);
  const moveLeft = useLoader(THREE.TextureLoader, moveLeftSpriteSheet);
  const moveRight = useLoader(THREE.TextureLoader, moveRightSpriteSheet);
  const stand = useLoader(THREE.TextureLoader, standingSpriteSheet);
  const throwNode = useLoader(THREE.TextureLoader, throwNodeSpriteSheet);
  const bigHud = useLoader(THREE.TextureLoader, bigHudSpriteSheet);
  const longHud = useLoader(THREE.TextureLoader, longHudSpriteSheet);
  const boringHud = useLoader(THREE.TextureLoader, boringHudSpriteSheet);
  const ripMiddleRing = useLoader(
    THREE.TextureLoader,
    ripMiddleRingSpriteSheet
  );
  const ripNode = useLoader(THREE.TextureLoader, ripNodeSpriteSheet);
  const prayer = useLoader(THREE.TextureLoader, prayerSpriteSheet);
  const knock = useLoader(THREE.TextureLoader, knockSpriteSheet);
  const knockAndFall = useLoader(THREE.TextureLoader, knockAndFallSpriteSheet);
  const touchAndScare = useLoader(
    THREE.TextureLoader,
    touchAndScareSpriteSheet
  );
  const touchSleeve = useLoader(THREE.TextureLoader, touchSleeveSpriteSheet);
  const thinking = useLoader(THREE.TextureLoader, thinkingSpriteSheet);
  const stretch = useLoader(THREE.TextureLoader, stretchSpriteSheet);
  const stretch2 = useLoader(THREE.TextureLoader, stretch2SpriteSheet);
  const spinSprite = useLoader(THREE.TextureLoader, spinSpriteSheet);
  const scratchHead = useLoader(THREE.TextureLoader, scratchHeadSpriteSheet);
  const blush = useLoader(THREE.TextureLoader, blushSpriteSheet);
  const handsBehindHead = useLoader(
    THREE.TextureLoader,
    handsBehindHeadSpriteSheet
  );
  const handsOnHips = useLoader(THREE.TextureLoader, handsOnHipsSpriteSheet);
  const handsOnHips2 = useLoader(THREE.TextureLoader, handsOnHips2SpriteSheet);
  const handsTogether = useLoader(
    THREE.TextureLoader,
    handsTogetherSpriteSheet
  );
  const leanForward = useLoader(THREE.TextureLoader, leanForwardSpriteSheet);
  const leanLeft = useLoader(THREE.TextureLoader, leanLeftSpriteSheet);
  const leanRight = useLoader(THREE.TextureLoader, leanRightSpriteSheet);
  const lookAround = useLoader(THREE.TextureLoader, lookAroundSpriteSheet);
  const playWithHair = useLoader(THREE.TextureLoader, playWithHairSpriteSheet);

  const { gl } = useThree();
  useLayoutEffect(() => {
    gl.initTexture(intro);
    gl.initTexture(moveDown);
    gl.initTexture(moveUp);
    gl.initTexture(moveLeft);
    gl.initTexture(moveRight);
    gl.initTexture(stand);
    gl.initTexture(longHud);
    gl.initTexture(bigHud);
    gl.initTexture(boringHud);
    gl.initTexture(throwNode);
    gl.initTexture(ripMiddleRing);
    gl.initTexture(ripNode);
    gl.initTexture(prayer);
    gl.initTexture(touchAndScare);
    gl.initTexture(knock);
    gl.initTexture(knockAndFall);
    gl.initTexture(touchSleeve);
    gl.initTexture(thinking);
    gl.initTexture(stretch);
    gl.initTexture(stretch2);
    gl.initTexture(spinSprite);
    gl.initTexture(scratchHead);
    gl.initTexture(blush);
    gl.initTexture(handsBehindHead);
    gl.initTexture(leanForward);
    gl.initTexture(leanLeft);
    gl.initTexture(leanRight);
    gl.initTexture(lookAround);
    gl.initTexture(playWithHair);
    gl.initTexture(handsOnHips);
    gl.initTexture(handsOnHips2);
    gl.initTexture(handsTogether);
  }, [
    moveDown,
    moveUp,
    moveLeft,
    moveRight,
    stand,
    gl,
    bigHud,
    boringHud,
    longHud,
    intro,
    throwNode,
    ripMiddleRing,
    ripNode,
    prayer,
    touchAndScare,
    knock,
    knockAndFall,
    touchSleeve,
    thinking,
    stretch,
    stretch2,
    spinSprite,
    scratchHead,
    blush,
    handsBehindHead,
    leanForward,
    leanLeft,
    leanRight,
    lookAround,
    playWithHair,
    handsOnHips,
    handsOnHips2,
    handsTogether,
  ]);
  return null;
});

export default Preloader;
