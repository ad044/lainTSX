import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "../static/css/mainpage.css";
import Credit from "./Credit";
import Header from "./Header";
import QA from "./QA";

const MainPage = () => {
  useEffect(() => {
    document.title = "< index >";
  }, []);

  return (
    <>
      <Header />
      <p className="header-paragraph">
        This is a web reimplementation of the Serial Experiments Lain PSX game
        with the aim to provide multi-language support.
        <br />
        <b>Please make sure to read the <Link to="/notes">notes</Link> before you
        start playing.</b>
        <br />
        <br />
      </p>
      <p className="faq">
        FAQ:
        <br /> <br />
        <QA
          question={
            "I'm extremely confused about the game and I'm not sure what I'm doing."
          }
          answer={`The game is meant to be confusing, if you feel like you can't enjoy it the way it is, check out the <a href="/#/guide">guide</a>. Keep in mind though that this is only my interpretation of the game and what I pieced together while developing it, it could be wrong.`}
        />
        <QA
          question={"Source code?"}
          answer={`<a href="https://github.com/ad044/lainTSX">On my github</a>.`}
        />
        <QA
          question={"I found an issue/have a suggestion/etc."}
          answer={`Use the <a href="https://github.com/ad044/lainTSX/issues">Github issue tracker</a> and tell us about it!`}
        />
        <QA
          question={"Is it possible to run the game offline?"}
          answer={`Yes, please follow <a href="https://laingame.net/offline.html">this guide</a>.`}
        />
      </p>
      <h2 className="mainpage-header">credits</h2>
      <p className="credits">
        <Credit
          name={"m35"}
          credit={"Created jPSXdec/laintools, reverse engineering."}
        />
        <Credit name={"ad"} credit={"Main dev/project lead."} />
        <Credit
          name={"elliotcraft79"}
          credit={
            "Programming help, reverse engineering, voice/sound effect extraction, extraction automation script, subtitle timing."
          }
        />
        <Credit
          name={"Yukkuri"}
          credit={
            "Programming/GLSL help, asset extraction, reverse engineering."
          }
        />
        <Credit
          name={"spaztron64"}
          credit={"Reverse engineering, sound extraction."}
        />
        <Credit name={"Popcorn"} credit={"Programming help."} />
        <Credit
          name={"lelenium"}
          credit={"Managing subtitles/translation, sprites."}
        />
        <Credit name={"BimBuns"} credit={"Fonts, help with Japanese."} />
        <Credit name={"Phenomenal"} credit={"Help with 3D stuff, fonts."} />
        <Credit name={"wires"} credit={"Help with asset extraction."} />
        <Credit name={"oo"} credit={"Help with Japanese."} />
        <Credit name={"JToke"} credit={"Help with shaders."} />
        <Credit name={"Galaktion"} credit={"Help with sprites."} />
        <Credit name={"retard"} credit={"Made 3D models."} />
        <Credit name={"knobluch"} credit={"Made 3D models."} />
        <Credit name={"ridderhoff"} credit={"Help with 3D stuff."} />
        <Credit
          name={"claire"}
          credit={"Helped with Japanese and Lain's voice."}
        />
        <Credit name={"Lorenzo"} credit={"Majority of the subtitle timing."} />
        <Credit
          name={"mutronics"}
          credit={"Subtitle timing, translation, owner of laingame."}
        />
        <Credit name={"Shuji"} credit={"Translation."} />
        <Credit
          name={"Magikarp"}
          credit={"Provided initial models for the rings."}
        />
        <Credit
          name={"The God of Kino"}
          credit={"Writing the guide."}
        />
        <Credit
          name={
            "mutronics, lelenium, Lorenzo, elliotcraft79, Nichts, Mikix, shemishtameshel, espilya, Yokuba, oo, Shuji, BimBuns, claire, Eternofímero, Cal, Cena"
          }
          credit={"Subtitle timing team."}
        />{" "}
        <Credit
          name={
            "DarcoldDestolle, Gigoteur, Pierre Missègue, atomheartother"
          }
          credit={"French translation."}
        />{" "}
        <Credit
          name={
            "publicdesert, Sealtyth, Doftos, dogukan57"
          }
          credit={"German translation."}
        />{" "}
        <Credit
          name={
            "RadioYamashita, Dylan Del Castillo Dunn Meynell"
          }
          credit={"Japanese transcript."}
        />{" "}
        <Credit
          name={
            "Cyle, Chair Broken, aeon, Mainu, karuhaku, pb29"
          }
          credit={"Korean translation."}
        />{" "}
        <Credit
          name={
            "LaCreatura, Brenner da Costa, Fuka, Lucas Emanuel, workingsea, lucasafshc, Sudonyn, Layla Dead"
          }
          credit={"Portuguese, Brazilian translation."}
        />{" "}
        <Credit
          name={
            "AstartaHao, cherrydrum, Dolamroth, FormerSmoker, Ilya, Kamagata Emiko, mutronics, Oldovschik, Shouner, tsu, Va1 V3R"
          }
          credit={"Russian translation."}
        />{" "}
        <Credit
          name={"psx.lain.pl team"}
          credit={"Providing the base translation."}
        />{" "}
        <Credit
          name={"INITIATE"}
          credit={"Helping the project gain recognition initially."}
        />{" "}
        Special thanks to <a href="https://twitter.com/pmndrs">Poimandres</a> for answering all
        the dumb questions I had while programming and creating the amazing
        libraries used in this project.
      </p>
      <br />
    </>
  );
};

export default MainPage;
