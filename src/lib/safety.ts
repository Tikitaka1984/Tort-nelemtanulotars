export type GuardResult = {
  allowed: boolean;
  warning?: string;
};

const PERSONAL_DATA_PATTERNS = [
  {
    name: "email-cím",
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  },
  {
    name: "telefonszám",
    pattern: /(\+36|06)[\s-]?\d{1,2}[\s-]?\d{3}[\s-]?\d{3,4}/i,
  },
  {
    name: "TAJ-szám",
    pattern: /\b\d{3}[\s-]?\d{3}[\s-]?\d{3}\b/,
  },
  {
    name: "lakcímgyanús adat",
    pattern:
      /\b\d{4}\s+[A-ZÁÉÍÓÖŐÚÜŰa-záéíóöőúüű .-]+,\s*[A-ZÁÉÍÓÖŐÚÜŰa-záéíóöőúüű .-]+\s+(utca|út|tér|körút|krt\.|u\.)\s+\d+/i,
  },
];

const ACADEMIC_MISUSE_PATTERNS = [
  /írd meg helyettem/i,
  /kész beadandó/i,
  /add beadható formában/i,
  /tanár ne vegye észre/i,
  /úgy írd meg mintha én írtam volna/i,
  /másolható kész esszé/i,
  /kész dolgozatot kérek/i,
];

export function checkUserInputSafety(input: string): GuardResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      allowed: false,
      warning: "Írj be egy kérdést vagy feladatot.",
    };
  }

  if (trimmed.length > 8000) {
    return {
      allowed: false,
      warning:
        "A kérés túl hosszú. Rövidítsd le, vagy bontsd több részre. Tanulási célra egy kérdés legyen világosan megfogalmazva.",
    };
  }

  for (const item of PERSONAL_DATA_PATTERNS) {
    if (item.pattern.test(trimmed)) {
      return {
        allowed: false,
        warning:
          `A szöveg ${item.name} jellegű személyes adatot tartalmazhat. ` +
          "Ne adj meg személyes adatot. Töröld az adatot, és csak a tanulási feladatot írd be.",
      };
    }
  }

  for (const pattern of ACADEMIC_MISUSE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        allowed: false,
        warning:
          "Az alkalmazás nem kész beadandót ír meg helyetted. Kérhetsz vázlatot, érveket, fogalomlistát, kronológiát, forráselemzési szempontokat vagy ellenőrző kérdéseket.",
      };
    }
  }

  return {
    allowed: true,
  };
}

export function buildPedagogicalSystemInstruction(params: {
  generalInstruction: string;
  modeTitle: string;
  modeInstruction: string;
}): string {
  return `
${params.generalInstruction}

AKTÍV TANULÁSI MÓD:
${params.modeTitle}

MÓDSPECIFIKUS UTASÍTÁS:
${params.modeInstruction}

KÖTELEZŐ PEDAGÓGIAI SZABÁLYOK:
1. Ne készíts végleges, beadásra alkalmas dolgozatot vagy esszét.
2. Esszékérdés esetén csak vázlatot, érvrendszert, fogalomlistát, kronológiát és önellenőrzési szempontokat adj.
3. Minden történelmi állításnál törekedj időbeli, fogalmi és ok-okozati pontosságra.
4. Ha bizonytalan vagy egy évszámban, idézetben, szerzőben vagy forrásban, jelezd: „Ezt érdemes hiteles forrásból ellenőrizni.”
5. Történelmi viták esetén különítsd el:
   - tény,
   - értelmezés,
   - vita vagy többfle történészi nézőpont.
6. Magyar érettségi-felkészítő szinten válaszolj.
7. A válasz végén adj 2 rövid önellenőrző kérdést, kivéve ha a tanulási mód kifejezetten interaktív vizsgáztatás vagy kvíz.
8. Ne kérj, ne tárolj és ne ismételj meg személyes adatot.
`.trim();
}
