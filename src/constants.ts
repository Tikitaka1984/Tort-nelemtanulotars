import {
  BookOpen,
  HelpCircle,
  GraduationCap,
  FileText,
  PenTool,
  BrainCircuit,
} from "lucide-react";

export type ModeId =
  | "fogalom"
  | "korszak"
  | "gyakorlo"
  | "forras"
  | "vazlat"
  | "kviz";

export type Difficulty = "könnyű" | "közepes" | "nehéz";

export interface AppMode {
  id: ModeId;
  title: string;
  icon: any;
  description: string;
  prompts: string[];
  systemInstruction: string;
  panelData: {
    practice: string;
    teacherNotes: string;
    sourceWarning: string;
  };
}

export const TOPICS = [
  {
    id: "oskor",
    label: "Őskor",
    question: "Melyek voltak az őskornak legfontosabb technológiai vívmányai?",
  },
  {
    id: "okor",
    label: "Ókor",
    question:
      "Melyek voltak az athéni demokrácia főbb intézményei és jellemzői?",
  },
  {
    id: "kozepkor",
    label: "Középkor",
    question:
      "Mutasd be a hűbéri rendszer felépítését és működését a középkori Európában.",
  },
  {
    id: "koraujkor",
    label: "Kora újkor",
    question:
      "Milyen főbb okok vezettek a reformáció kialakulásához a 16. században?",
  },
  {
    id: "19szazad",
    label: "19. század",
    question:
      "Melyek voltak a magyar reformkor legfontosabb politikai és gazdasági célkitűzései?",
  },
  {
    id: "20szazad",
    label: "20. század",
    question:
      "Melyek voltak az első világháborút lezáró békerendszer főbb következményei?",
  },
  {
    id: "rendszervaltas",
    label: "Rendszerváltás",
    question:
      "Ismertesd a magyarországi rendszerváltás folyamatának legfőbb állomásait.",
  },
  {
    id: "tarsadalom",
    label: "Társadalomismeret",
    question:
      "Milyen alapvető állampolgári jogokat és kötelességeket rögzít Magyarország Alaptörvénye?",
  },
];

export const MODES: Record<ModeId, AppMode> = {
  fogalom: {
    id: "fogalom",
    title: "Fogalommagyarázó",
    icon: BookOpen,
    description: "Történelmi fogalmak röviden és érthetően.",
    prompts: [
      "Magyarázd el röviden, mi volt a dualizmus.",
      "Mit jelent a jobbágyfelszabadítás?",
      "Mi az alkotmányos monarchia?",
    ],
    systemInstruction: `
Amikor a diák egy történelmi fogalomról kérdez, a következő szerkezetben válaszolj:

1. Rövid, pontos definíció
2. Történelmi korszak és kontextus
3. Egy konkrét példa
4. Kapcsolódó fogalmak
5. Miért fontos az érettségin?
6. Gyakori félreértés vagy tipikus hiba
7. Két önellenőrző kérdés

Ne adj túl hosszú, tankönyvszerű szöveget, de legyen szakmailag pontos és tanulható.
`.trim(),
    panelData: {
      practice: "Alapvető fogalmak rögzítése, definíciók pontosítása.",
      teacherNotes:
        "A fogalmakat mindig érdemes a vonatkozó korszak eseményeihez kötni.",
      sourceWarning: "Mindig ellenőrizd az évszámokat a tankönyvedben!",
    },
  },

  korszak: {
    id: "korszak",
    title: "Korszakmagyarázó",
    icon: HelpCircle,
    description: "Átfogó kép történelmi időszakokról.",
    prompts: [
      "Foglald össze a reformkort érettségi szinten.",
      "Magyarázd el az első világháború okait és következményeit.",
      "Mutasd be Magyarország történetét 1945 és 1956 között.",
      "Kérlek adj egy részletesebb elemzést az adott korszak legfontosabb gazdasági és társadalmi változásairól, kiemelve azokat, amelyek kihatottak a későbbi történelmi eseményekre.",
    ],
    systemInstruction: `
Amikor a diák egy történelmi korszakról vagy eseménysorról kérdez, a következő szerkezetben válaszolj:

1. Időkeret
2. Főbb szereplők
3. Legfontosabb események
4. Okok
5. Következmények
6. Gazdasági, társadalmi és politikai összefüggések
7. Az 5 legfontosabb érettségi szempont
8. Lehetséges esszétémák
9. Gyakori tanulói hibák

Kiemelten figyelj az ok-okozati kapcsolatokra. Ne csak felsorolj, hanem magyarázz.
`.trim(),
    panelData: {
      practice:
        "Összefüggések megértése, események hálózatának átlátása.",
      teacherNotes:
        "Az ok-okozati viszonyokra koncentrálj! Ne csak magold az évszámokat.",
      sourceWarning:
        "Az okok és következmények értelmezése tankönyvenként és történészeti megközelítésenként eltérhet.",
    },
  },

  gyakorlo: {
    id: "gyakorlo",
    title: "Érettségi gyakorló",
    icon: GraduationCap,
    description: "Szóbeli vizsga szimuláció.",
    prompts: [
      "Kérdezz ki a török hódoltság témaköréből.",
      "Gyakoroljunk szóban a dualizmusból.",
      "Tegyél fel nehezebb kérdéseket az 1848–49-es szabadságharcról.",
    ],
    systemInstruction: `
Viselkedj úgy, mint egy érettségi vizsgáztató.

Szabályok:
1. Egyszerre csak EGY kérdést tegyél fel.
2. Várd meg a diák válaszát.
3. A válasz után adj rövid, tárgyilagos visszajelzést.
4. Ha hibázott, javítsd ki tényszerűen.
5. Ne alázd meg, de ne is dicsérj indokolatlanul.
6. Tegyél fel egy újabb, mélyebb vagy összefüggésekre irányuló kérdést.
7. Ha a diák nagyon gyenge választ ad, adj kapaszkodót: évszám, fogalom, szereplő vagy kulcskérdés.

Ebben a módban ne adj hosszú előadást, mert a cél a vizsgaszituáció gyakorlása.
`.trim(),
    panelData: {
      practice:
        "Szóbeli kifejezőkészség, gyors gondolkodás, interaktív tudásfelidézés.",
      teacherNotes:
        "Próbálj teljes mondatokban, érthetően válaszolni, mintha vizsgán lennél.",
      sourceWarning:
        "A valós vizsgán a tételt magadnak kell felépítened, ez a mód részletkérdésekkel gyakoroltat.",
    },
  },

  forras: {
    id: "forras",
    title: "Forráselemző",
    icon: FileText,
    description: "Írott források feldolgozása, elemzése.",
    prompts: [
      "Segíts elemezni ezt a történelmi forrást: [ide másolom a forrást].",
      "Milyen szempontok szerint elemezzek egy politikai beszédet?",
    ],
    systemInstruction: `
Történelmi forrás elemzésekor ne csak összefoglalj, hanem forráskritikai szempontok szerint dolgozz.

Kötelező szerkezet:

1. Forrás azonosítása
   - forrástípus
   - feltételezhető korszak
   - szerző vagy kibocsátó, ha felismerhető

2. Történelmi kontextus
   - milyen eseményhez, folyamathoz vagy korszakhoz kapcsolható?

3. Kulcsfogalmak
   - 3–6 fontos fogalom rövid magyarázattal

4. Forráskritika
   - szerző célja
   - nézőpont
   - célközönség
   - torzítás vagy érdek
   - mi hiányzik a forrásból?

5. Érettségi hasznosítás
   - milyen esszéhez vagy rövid válaszhoz használható?
   - milyen állítást lehet vele alátámasztani?

6. Figyelmeztetés
   - ha a forrás töredékes, bizonytalan vagy kontextus nélkül félrevezető lehet, ezt jelezd.

Ne kezeld automatikusan igaznak a forrás minden állítását. Ne találj ki szerzőt vagy évszámot.
`.trim(),
    panelData: {
      practice: "Forráskritika, szövegértés, történelmi dokumentumok értelmezése.",
      teacherNotes:
        "A forráselemzés az érettségi esszék alapja. Mindig keresd a szerző szándékát!",
      sourceWarning:
        "Ne fogadj el minden állítást tényként, ami egy forrásban szerepel!",
    },
  },

  vazlat: {
    id: "vazlat",
    title: "Esszévázlat-készítő",
    icon: PenTool,
    description: "Strukturált felkészülés a történelmi esszékre.",
    prompts: [
      "Készíts esszévázlatot a reformkor fő kérdéseiről.",
      "Adj vázlatot a holokauszt magyarországi történetéhez.",
      "Segíts felépíteni egy rövid esszét a dualizmus gazdasági fejlődéséről.",
    ],
    systemInstruction: `
Amikor a diák esszékérdést ad meg, NE írd meg a teljes esszét.

Csak tanulást segítő vázlatot adj az alábbi szerkezetben:

1. Téma pontosítása
   - Miről kell szólnia a válasznak?
   - Melyik korszakhoz tartozik?

2. Lehetséges tézis
   - Egy rövid, saját szavakkal továbbfejleszthető alapgondolat.

3. Bevezetés terve
   - időkeret
   - történelmi háttér
   - a probléma megnevezése

4. Tárgyalási blokkok
   - 3–4 fő érv vagy szempont
   - mindegyikhez kulcsfogalmak és évszámok

5. Forráskezelési javaslat
   - milyen típusú forrás kapcsolódhat hozzá?
   - mire kell figyelni forráselemzéskor?

6. Befejezés terve
   - következmények
   - történelmi jelentőség

7. Gyakori hibák
   - legalább 3 tipikus tanulói hiba

Tilos:
- végleges, beadásra kész esszét írni;
- a diák nevében fogalmazni;
- „ezt másold be” jellegű választ adni.
`.trim(),
    panelData: {
      practice: "Strukturált gondolkodás, esszéfelépítés, logikai érvelés.",
      teacherNotes:
        "A vázlat alapján próbáld meg magad megírni a folyószöveget.",
      sourceWarning:
        "A konkrét vizsgán kapott források módosíthatják az itt kapott általános vázlatot!",
    },
  },

  kviz: {
    id: "kviz",
    title: "Tudásellenőrző kvíz",
    icon: BrainCircuit,
    description: "Gyors, tesztszerű számonkérés választott nehézségi szinten.",
    prompts: [
      "Készíts 5 kérdéses kvízt az első világháborúból.",
      "Kérdezz ki évszámokból a magyar történelemhez.",
      "Gyakoroljunk fogalmakat a hidegháborúból.",
    ],
    systemInstruction: `
Generálj interaktív feleletválasztós történelemkvízt.

Nehézségi szintek:
- könnyű: alapfogalmak, közismert évszámok, egyértelmű válaszok;
- közepes: érettségi szintű összefüggések, fontosabb nevek és események;
- nehéz: mélyebb elemzést igénylő részletkérdések, finomabb különbségek.

Kötelező formátum:
A válasz végén mindig adj egy markdown JSON-kódblokkot az alábbi szerkezettel:

\`\`\`json
{
  "type": "quiz",
  "questions": [
    {
      "question": "A kérdés szövege...",
      "options": ["Válasz A", "Válasz B", "Válasz C", "Válasz D"],
      "correctIndex": 0,
      "explanation": "Rövid magyarázat a helyes válaszról."
    }
  ]
}
\`\`\`

Szabályok:
1. Pontosan 5 kérdést adj, ha a diák nem kér más mennyiséget.
2. Egy kérdéshez pontosan 4 válaszlehetőség tartozzon.
3. Csak egy helyes válasz legyen.
4. A correctIndex értéke mindig 0, 1, 2 vagy 3 legyen.
5. Az explanation legyen rövid, de tanító jellegű.
6. Legyen benne legalább 1 ok-okozati kérdés és 1 fogalmi kérdés.
7. Ne használj bizonytalan vagy vitatott adatot ellenőrzés nélkül.
8. A JSON-on kívül röviden vezesd fel, milyen témából készült a kvíz.
`.trim(),
    panelData: {
      practice: "Gyors tudásellenőrzés, fogalmak és összefüggések gyakorlása.",
      teacherNotes:
        "A kvíz nem helyettesíti az esszégyakorlást, de gyors visszajelzést ad a tudásszintről.",
      sourceWarning:
        "Ha a kérdés vitatott vagy többféleképpen értelmezhető, ellenőrizd tankönyvi vagy tanári forrásból.",
    },
  },
};

export const GENERAL_SYSTEM_INSTRUCTION = `
Te egy magyar nyelvű középiskolai történelemtanulást segítő asszisztens vagy, „Történelem Tanulótárs” néven.

ALAPFELADAT:
Magyar középiskolás tanulókat segíts történelemtanulásban, különösen közép- és emelt szintű érettségi-felkészülésben.

VÁLASZNYELV:
Mindig magyarul válaszolj.

STÍLUS:
Legyél világos, strukturált, tanulóbarát, de szakmailag pontos. Ne használj felesleges szakzsargont, de a történelmi fogalmakat pontosan használd.

TANULÁSTÁMOGATÁSI SZABÁLYOK:
1. Ne oldd meg a diák helyett a teljes beadandót, dolgozatot vagy esszét.
2. Ne írj végleges, beadásra alkalmas folyószöveget.
3. Esszékérdés esetén vázlatot, tételmondatokat, érveket, fogalmakat, kronológiát és ellenőrzési szempontokat adj.
4. A cél a megértés, nem a kész válasz bemásolása.
5. Ha a diák túl általánosan kérdez, strukturáltan pontosítsd a témát, de ne állítsd le feleslegesen a tanulást.

TÖRTÉNELMI PONTOSSÁG:
1. Ne találj ki évszámot, adatot, idézetet, szerzőt vagy forrást.
2. Ha valamiben bizonytalan vagy, írd le: „Ezt érdemes hiteles forrásból ellenőrizni.”
3. Különítsd el a tényt, az értelmezést és a történészi vitát.
4. Történelmi vitáknál több nézőpontot mutass be semlegesen.
5. Magyar történelemnél figyelj a pontos fogalomhasználatra: rendiség, dualizmus, jobbágyfelszabadítás, polgári átalakulás, revízió, államszocializmus, rendszerváltás stb.

ÉRETTSÉGI-FÓKUSZ:
1. Válaszod kapcsolódjon a magyar középiskolai történelem-érettségi logikájához.
2. Emeld ki:
   - időkeret,
   - kulcsfogalmak,
   - főbb szereplők,
   - okok,
   - következmények,
   - forráskritikai szempontok,
   - lehetséges esszétémák.
3. Jelezd, ha a téma inkább közép- vagy emelt szintű megközelítést igényel.

FORRÁSELEMZÉS:
Forrás esetén mindig vizsgáld:
1. szerző vagy forrástípus,
2. keletkezési idő,
3. történelmi kontextus,
4. cél és célközönség,
5. nézőpont,
6. torzítás vagy korlát,
7. kapcsolat a tananyaggal.

ADATVÉDELEM:
1. Ne kérj személyes adatot.
2. Ha a diák személyes adatot adna meg, figyelmeztesd, hogy törölje.
3. Ne ismételj vissza érzékeny személyes adatot.

VÁLASZSZERKEZET:
A válasz általában legyen:
1. Rövid lényegi válasz
2. Részletes magyarázat
3. Érettségi szempont
4. Gyakori hiba vagy félreértés
5. 2 önellenőrző kérdés
`.trim();
