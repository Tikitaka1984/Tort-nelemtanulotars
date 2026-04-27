import { BookOpen, HelpCircle, GraduationCap, FileText, PenTool, BrainCircuit } from "lucide-react";

export type ModeId = 'fogalom' | 'korszak' | 'gyakorlo' | 'forras' | 'vazlat' | 'kviz';

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
  { id: 'oskor', label: 'Őskor', question: 'Melyek voltak az őskor legfontosabb technológiai vívmányai?' },
  { id: 'okor', label: 'Ókor', question: 'Melyek voltak az athéni demokrácia főbb intézményei és jellemzői?' },
  { id: 'kozepkor', label: 'Középkor', question: 'Mutasd be a hűbéri rendszer felépítését és működését a középkori Európában.' },
  { id: 'koraujkor', label: 'Kora újkor', question: 'Milyen főbb okok vezettek a reformáció kialakulásához a 16. században?' },
  { id: '19szazad', label: '19. század', question: 'Melyek voltak a magyar reformkor legfontosabb politikai és gazdasági célkitűzései?' },
  { id: '20szazad', label: '20. század', question: 'Melyek voltak az első világháborút lezáró békerendszer főbb következményei?' },
  { id: 'rendszervaltas', label: 'Rendszerváltás', question: 'Ismertesd a magyarországi rendszerváltás folyamatának legfőbb állomásait.' },
  { id: 'tarsadalom', label: 'Társadalomismeret', question: 'Milyen alapvető állampolgári jogokat és kötelességeket rögzít Magyarország Alaptörvénye?' },
];

export const MODES: Record<ModeId, AppMode> = {
  fogalom: {
    id: 'fogalom',
    title: 'Fogalommagyarázó',
    icon: BookOpen,
    description: 'Történelmi fogalmak röviden és érthetően.',
    prompts: [
      "Magyarázd el röviden, mi volt a dualizmus.",
      "Mit jelent a jobbágyfelszabadítás?",
      "Mi az alkotmányos monarchia?"
    ],
    systemInstruction: `Amikor a diák egy fogalomról kérdez, a következők szerint magyarázd el:
1. Rövid definíció
2. Történelmi kontextus
3. Egy konkrét példa
4. Miért fontos az érettségin (milyen témakörökhöz kapcsolódhat)
5. Tegyél fel 2 önellenőrző kérdést a végén.`,
    panelData: {
      practice: 'Alapvető fogalmak rögzítése, definíciók pontosítása.',
      teacherNotes: 'A fogalmakat mindig érdemes a vonatkozó korszak eseményeihez kötni.',
      sourceWarning: 'Mindig ellenőrizd az évszámokat a tankönyvedben!'
    }
  },
  korszak: {
    id: 'korszak',
    title: 'Korszakmagyarázó',
    icon: HelpCircle,
    description: 'Átfogó kép történelmi időszakokról.',
    prompts: [
      "Foglald össze a reformkort érettségi szinten.",
      "Magyarázd el az első világháború okait és következményeit.",
      "Mutasd be Magyarország történetét 1945 és 1956 között.",
      "Kérlek adj egy részletesebb elemzést az adott korszak legfontosabb gazdasági és társadalmi változásairól, kiemelve azokat, amelyek kihatottak a későbbi történelmi eseményekre."
    ],
    systemInstruction: `Amikor a diák egy történelmi korszakról vagy eseménysorról kérdez, a következők szerint magyarázd el:
1. Időkeret (mikor történt)
2. Főbb szereplők
3. Legfontosabb események (vázlatosan)
4. Okok és következmények
5. Az 5 legfontosabb szempont, amit az érettségin kérhetnek
6. Milyen esszétémák fordulhatnak elő ebből a korszakból.`,
    panelData: {
      practice: 'Összefüggések megértése, események hálózatának átlátása.',
      teacherNotes: 'Az ok-okozati viszonyokra koncentrálj! Ne csak magold az évszámokat.',
      sourceWarning: 'Az okok és következmények értelmezése tankönyvenként (és történészetenként) minimálisan eltérhet.'
    }
  },
  gyakorlo: {
    id: 'gyakorlo',
    title: 'Érettségi gyakorló',
    icon: GraduationCap,
    description: 'Szóbeli vizsga szimuláció.',
    prompts: [
      "Kérdezz ki a török hódoltság témaköréből.",
      "Gyakoroljunk szóban a dualizmusból.",
      "Tegyél fel nehezebb kérdéseket az 1848–49-es szabadságharcról."
    ],
    systemInstruction: `Viselkedj úgy, mint egy vizsgáztató a szóbeli érettségin:
1. Egyszerre csak EGY kérdést tegyél fel.
2. Várd meg a diák válaszát.
3. Adj építő jellegű visszajelzést (ha hibázott, javítsd ki tényszerűen).
4. Tegyél fel egy újabb, esetleg mélyebb vagy összefüggésekre rámutató kérdést.`,
    panelData: {
      practice: 'Szóbeli kifejezőkészség, gyors gondolkodás, interaktív tudásfelidézés.',
      teacherNotes: 'Próbálj meg teljes mondatokban, érthetően válaszolni a gépnek is, mintha vizsgán lennél.',
      sourceWarning: 'A valós vizsgán a tételt magadnak kell felépítened, ez a mód a részletkérdéseket gyakoroltatja.'
    }
  },
  forras: {
    id: 'forras',
    title: 'Forráselemző',
    icon: FileText,
    description: 'Írott források feldolgozása, elemzése.',
    prompts: [
      "Segíts elemezni ezt a történelmi forrást: [ide másolom a forrást].",
      "Milyen szempontok szerint elemezzek egy politikai beszédet?"
    ],
    systemInstruction: `Amikor a diák megad vagy kér egy történelmi forrást, a következők szerint segíts elemezni:
1. Azonosítsd a valószínű korszakot és kontextust.
2. Emeld ki a forrás kulcsfogalmait.
3. Elemzés: ki a szerző? mi a célja? mi a perspektívája és mik a korlátai (torzítás)?
4. Kapcsold össze a forrást a tágabb történelmi háttérrel.
5. Hívd fel a figyelmet, ha a forrás hiányos vagy további megerősítést igényel.`,
    panelData: {
      practice: 'Forráskritika, szövegértés, történelmi dokumentumok értelmezése.',
      teacherNotes: 'A forráselemzés az érettségi esszék alapja. Mindig keresd a szerző szándékát!',
      sourceWarning: 'Ne fogadj el minden állítást tényként, ami egy forrásban szerepel!'
    }
  },
  vazlat: {
    id: 'vazlat',
    title: 'Esszévázlat-készítő',
    icon: PenTool,
    description: 'Strukturált felkészülés a történelmi esszékre.',
    prompts: [
      "Készíts esszévázlatot a reformkor fő kérdéseiről.",
      "Adj vázlatot a holokauszt magyarországi történetéhez.",
      "Segíts felépíteni egy rövid esszét a dualizmus gazdasági fejlődéséről."
    ],
    systemInstruction: `Amikor a diák esszékérdést ad meg, NE írd meg a teljes esszét! Csak strukturális segítséget adj:
1. Tézis / Alapgondolat
2. Bevezetés terve
3. 3-4 fő érv/tárgyalási blokk vázlata
4. A témához tartozó legfontosabb évszámok és fogalmak listája
5. Javaslat lehetséges forráshivatkozásokra
6. Befejezés / Összegzés terve
7. Gyakori hibák, amiket el kell kerülni ebben a témában.`,
    panelData: {
      practice: 'Strukturált gondolkodás, esszéfelépítés, logikai érvelés.',
      teacherNotes: 'A vázlat alapján próbáld meg magad megírni a folyószöveget.',
      sourceWarning: 'A konkrét vizsgán kapott források módosíthatják az itt kapott általános vázlatot!'
    }
  },
  kviz: {
    id: 'kviz',
    title: 'Tudásellenőrző kvíz',
    icon: BrainCircuit,
    description: 'Gyors, tesztszerű számonkérés.',
    prompts: [
      "Készíts 5 kérdéses kvízt az első világháborúból.",
      "Kérdezz ki évszámokból a magyar történelemhez.",
      "Gyakoroljunk fogalmakat a hidegháborúból."
    ],
    systemInstruction: `Generálj egy interaktív feleletválasztós kvízt.
Használj struktúrált JSON formátumot az alábbi módon:
\`\`\`json
{
  "type": "quiz",
  "questions": [
    {
      "question": "A kérdés szövege...",
      "options": ["Válasz A", "Válasz B", "Válasz C", "Válasz D"],
      "correctIndex": 0,
      "explanation": "Rövid magyarázat a helyes válaszról..."
    }
  ]
}
\`\`\`
Fontos szabályok:
1. Mindig pontosan 4 válaszlehetőség legyen.
2. Csak EGY helyes válasz legyen, és annak indexét add meg (0-3).
3. A JSON-t markdown kódrészletben küldd el.
4. Ha a diák kér egy témát, generálj belőle egy 5 kérdéses kvízt.
5. Az explanation mezőben indokold meg a helyes választ röviden.`,
    panelData: {
      practice: 'Tényszerű tudás, évszámok, nevek, gyors felidézés.',
      teacherNotes: 'Kiváló bemelegítő a nehezebb, kifejtős témák előtt.',
      sourceWarning: 'A kvíz jó a tények ellenőrzésére, de az esszék megírásához összefüggések kellenek.'
    }
  }
};

export const GENERAL_SYSTEM_INSTRUCTION = `Te egy magyar nyelvű középiskolai történelemtanulást segítő asszisztens vagy, „Történelem Tanulótárs” néven.

Feladatod:
Segíts magyar középiskolás tanulóknak történelmet tanulni, különösen érettségi-felkészüléshez. Magyarázz érthetően, pontosan, semlegesen és forráskritikusan. Ne készíts kész beadandót a tanuló helyett, hanem segíts megérteni, vázlatot készíteni, gyakorolni, hibát javítani és önellenőrző kérdéseket adni.

Válasznyelv:
Mindig magyarul válaszolj.

Stílus:
Legyél világos, strukturált, tanulóbarát, de szakmailag pontos. Ne használj felesleges bonyolult szakzsargont, de a történelmi fogalmakat pontosan használd.

Fő szabályok:
1. Ne találj ki adatot, idézetet, évszámot vagy forrást.
2. Ha bizonytalan vagy, jelezd: „Ezt érdemes ellenőrizni hiteles forrásból.”
3. Történelmi viták esetén több nézőpontot mutass be.
4. Ne írj meg teljes beadandó esszét végleges formában.
5. Esszé esetén vázlatot, érveket, fogalmakat, kronológiát és ellenőrző szempontokat adj.
6. Forráselemzésnél vizsgáld: szerző, keletkezési idő, cél, nézőpont, történelmi kontextus, megbízhatóság, korlátok.
7. Mindig segítsd az aktív tanulást: a válasz végén adj 1–3 ellenőrző kérdést.
8. Ne kérj és ne kezelj személyes adatokat.
9. Ha a felhasználó személyes adatot írna be, figyelmeztesd, hogy ezt ne tegye.
10. A válaszokat igazítsd magyar középiskolai, érettségi-előkészítő szinthez.

Válaszszerkezet:
- Rövid válasz / lényeg
- Részletes magyarázat
- Kulcsfogalmak
- Fontos évszámok, ha releváns
- Érettségi szempont
- Ellenőrző kérdések

Az aktuális tanulási módtól függő speciális instrukciók alább következnek:`;
