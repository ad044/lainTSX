import React from "react";
import { useStore } from "../store";
import "../static/css/language.css";
import { useCallback } from "react";

const Language = () => {
  const currentLanguage = useStore((state) => state.language);
  const setLanguage = useStore((state) => state.setLanguage);

  const supportedLanguages = [
    { language: "English", code: "en" },
    { language: "French", code: "fr" },
    { language: "German", code: "de" },
    { language: "Japanese", code: "ja" },
    { language: "Korean", code: "ko" },
    { language: "Portuguese, Brazilian", code: "pt-BR"},
    { language: "Russian", code: "ru"}
  ];

  const updateLanguage = useCallback(
    (langCode) => {
      setLanguage(langCode);
      localStorage.setItem("lainLanguage", JSON.stringify(langCode));
    },
    [setLanguage]
  );

  return (
    <>
      <p className="keybinding-note">
        From here you can select which language you want the game's subtitles to
        be in.
        <br />
        This list will be updated gradually as more translations get completed.
      </p>
      <br />
      {supportedLanguages.map((entry) => (
        <p
          className="language-entry"
          key={entry.code}
          style={currentLanguage === entry.code ? { color: "#ffa531" } : {}}
          onClick={() => updateLanguage(entry.code)}
        >
          {entry.language}
        </p>
      ))}
    </>
  );
};

export default Language;
