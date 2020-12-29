import React, {
  createRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import site_a from "../../resources/site_a.json";
import site_b from "../../resources/site_b.json";
import {
  useLevelStore,
  useMediaStore,
  useNodeStore,
  useSceneStore,
  useSiteStore,
} from "../../store";
import t from "../../static/webvtt/test.vtt";
import { SiteType } from "../MainScene/SyncedComponents/Site";

const MediaPlayer = () => {
  const [mediaSource, setMediaSource] = useState<any>();

  const currentScene = useSceneStore((state) => state.currentScene);
  const setScene = useSceneStore((state) => state.setScene);

  const setPercentageElapsed = useMediaStore(
    (state) => state.setPercentageElapsed
  );

  const activeNodeId = useNodeStore((state) => state.activeNodeState.id);
  const activeLevel = useLevelStore((state) => state.activeLevel);

  const requestRef = useRef();
  const videoRef = createRef<HTMLVideoElement>();

  const currentSite = useSiteStore((state) => state.currentSite);

  const siteData = useMemo(() => (currentSite === "a" ? site_a : site_b), [
    currentSite,
  ]);

  const updateTime = useCallback(() => {
    (requestRef.current as any) = requestAnimationFrame(updateTime);
    if (videoRef.current) {
      const timeElapsed = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const percentageElapsed = Math.floor((timeElapsed / duration) * 100);

      if (percentageElapsed % 5 === 0) {
        setPercentageElapsed(percentageElapsed);
        if (percentageElapsed === 100) {
          videoRef.current.currentTime = 0;
          if (
            (siteData as SiteType)[activeLevel][activeNodeId]
              .triggers_final_video === 1
          ) {
            setScene("end");
          } else {
            videoRef.current.pause();
          }
        }
      }
    }
  }, [
    activeLevel,
    activeNodeId,
    setPercentageElapsed,
    setScene,
    siteData,
    videoRef,
  ]);

  useEffect(() => {
    (requestRef.current as any) = requestAnimationFrame(updateTime);
    const curr = requestRef.current;
    return () => cancelAnimationFrame(curr as any);
  }, [updateTime]);

  useEffect(() => {
    if (currentScene === "end") {
      import("../../static/movie/b/ENDROLL1.STR[0].webm").then((media) => {
        setMediaSource(media.default);
        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.play();
        }
      });
    } else if (currentScene === "media" || currentScene === "tak") {
      const nodeMedia = (siteData as SiteType)[activeLevel][activeNodeId]
        .media_file;
      if (nodeMedia.includes("XA")) {
        import(
          "../../static/audio/" + currentSite + "/" + nodeMedia + ".ogg"
        ).then((media) => {
          setMediaSource(media.default);
          if (videoRef.current) {
            videoRef.current.load();
          }
        });
      } else {
        import(
          "../../static/movie/" + currentSite + "/" + nodeMedia + "[0].webm"
        ).then((media) => {
          setMediaSource(media.default);
          if (videoRef.current) {
            videoRef.current.load();
          }
        });
      }
    }
  }, [
    activeLevel,
    activeNodeId,
    currentScene,
    currentSite,
    siteData,
    videoRef,
  ]);

  return (
    <video
      width="800"
      height="600"
      controls
      id="media"
      ref={videoRef}
      style={{
        display: ["media", "tak", "end"].includes(currentScene)
          ? "block"
          : "none",
      }}
    >
      <source src={mediaSource} />
      <track src={t} kind="captions" default />
    </video>
  );
};

export default MediaPlayer;
