// Builds the CV as a Word file. Usage: node tools/cv.js <output.docx> [fi|en|sv]
// Finnish text is the source; English and Swedish come from tools/i18n.json ("cv").
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, TabStopType, BorderStyle, ExternalHyperlink } = require('docx');


const LANG = process.argv[3] || 'fi';
const I18N = require('./i18n.json');
// CV-specific wording first, then the same text on the web page.
const DICT = LANG === 'fi' ? null : Object.assign({}, I18N.site[LANG], I18N.cv[LANG]);
const T = (s) => {
  if (!DICT) return s;
  if (!(s in DICT)) throw new Error('Missing ' + LANG + ' translation: ' + s);
  return DICT[s];
};
const SITE = {
  fi: 'https://samppafin.github.io/RauliRantanenCV/',
  en: 'https://samppafin.github.io/RauliRantanenCV/en.html',
  sv: 'https://samppafin.github.io/RauliRantanenCV/sv.html',
};

const NAVY = '0B2545', BLUE = '1D5FA8', GREY = '47607A', RED = 'C8321F';
const F = 'Arial';
const TAB = 2400;

const h = (t) => new Paragraph({
  spacing: { before: 150, after: 80 }, keepNext: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: BLUE, space: 3 } },
  children: [new TextRun({ text: t.toUpperCase(), bold: true, size: 22, color: NAVY, font: F })],
});
const p = (t, o = {}) => new Paragraph({ spacing: { after: o.after ?? 80 }, children: [new TextRun({ text: t, size: 21, font: F, color: o.color ?? '000000', bold: o.bold })] });
const line = (left, title, rest) => new Paragraph({
  spacing: { after: 50 }, indent: { left: TAB, hanging: TAB }, tabStops: [{ type: TabStopType.LEFT, position: TAB }],
  children: [
    new TextRun({ text: left, size: 21, font: F, color: BLUE, bold: true }),
    new TextRun({ text: '\t' + title, size: 21, font: F, bold: true }),
    ...(rest ? [new TextRun({ text: '  ' + rest, size: 21, font: F, color: GREY })] : []),
  ],
});
const sub = (t) => new Paragraph({ spacing: { after: 70 }, indent: { left: TAB }, children: [new TextRun({ text: t, size: 20, font: F })] });

const doc = new Document({
  creator: 'Rauli Rantanen', title: T('Rauli Rantanen – ansioluettelo'),
  sections: [{
    properties: { page: { margin: { top: 620, bottom: 520, left: 1080, right: 1080 } } },
    children: [
      new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'Rauli Rantanen', bold: true, size: 52, color: NAVY, font: F })] }),
      new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: T('PUOLIMATRUUSI · TAMPERE'), bold: true, size: 22, color: RED, font: F })] }),
      new Paragraph({ spacing: { after: 40 }, children: [
        new TextRun({ text: '+358 40 488 8992   ·   rauli.rantanen@gmail.com   ·   ', size: 21, font: F }),
        new ExternalHyperlink({ link: SITE[LANG], children: [new TextRun({ text: SITE[LANG].replace('https://', ''), size: 21, font: F, color: BLUE, underline: {} })] }),
      ] }),
      p(T('Käytettävissä heti'), { bold: true, after: 60 }),

      h(T('Profiili')),
      p(T('Kansimies, jolla on noin 26 vuotta kokemusta merillä ja yli 30 alusta takana, Jäämeren troolareista ropax-laivoihin ja höyrylaivaan. Kannan vastuuni työstä, turvatoimitehtävästäni ja koko laivaporukan hyvinvoinnista. Jos eteen tulee työ, jota en osaa, opettelen. Etsin ensisijaisesti laivatyötä, ja tavoitteenani on matruusin pätevyys.')),

      h(T('Pätevyydet ja todistukset')),
      line(T('Pätevyyskirja'), T('Vahtimies, kansi (Watchkeeping Rating, Deck)'), T('voimassa toistaiseksi')),
      line('STCW', 'Basic Training (VI/1)', T('voimassa')),
      line('', 'Security Awareness (VI/6.1), Designated Security Duties (VI/6.2)', T('voimassa')),
      line('', T('Crowd Management (matkustaja-aluskoulutus)')),
      line(T('Terveys'), T('Merimieslääkärintodistus'), T('kotimaanliikenne, voimassa 4/2028 asti')),
      line(T('Asiakirjat'), T('Passi'), T('voimassa 8/2027 asti · todistusten kopiot pyynnöstä')),
      line(T('Muut'), T('Työturvallisuuskortti, ajokortti B ja C')),

      h(T('Työkokemus ja meripalvelu')),
      line('5–9/2026', T('Matruusi ja tarjoilija'), 'Hopealinjat, s/s Tarjanne'),
      sub(T('Ruorivahti eli laivan ohjaaminen, kiinnitys ja irrotus, kansi- ja huoltotyöt, tarjoilu sekä matkustajien opastus. Ensimmäinen kausi sisävesiliikenteessä.')),
      line(T('2024 (2 kk)'), T('Puolimatruusi'), 'Bore, m/s Bore Bay'),
      sub(T('Kansityöt, vahdinpito, kiinnitys ja irrotus sekä lastaus ja lossaus.')),
      line('2022–2024', T('Puolimatruusi'), 'Eckerö Line, m/s Finlandia'),
      sub(T('Kansityöt, vahdinpito, kiinnitys ja irrotus, lastaus ja lossaus sekä matkustajien opastus.')),
      line('2009–2022', T('Talousapulainen, sittemmin puolimatruusi'), T('Suomen kauppalaivasto')),
      sub(T('Aloitin talousapulaisena, suoritin puolimatruusin koulutuksen ja pätevöidyin kansimieheksi. Matkustajalaivat, saariston yhteysalukset, Finnlinesin ropax-alukset, ESL:n kuivarahtialus ja erikoisrahtilaiva kansainvälisillä vesillä.')),
      line('2000–2009', T('Kansimies, syvänmeren kalastusalukset'), T('Norja ja Islanti, noin 9 vuotta')),
      sub(T('Jäämeren troolarit, kääntönuottalaiva ja autolinjalaiva. Kalastuskausi kestää syksystä kevääseen ja olosuhteet ovat aina vaativat, joten työ edellyttää koko miehistöltä merimiestaitoa ja tietoa.')),
      line(T('1990-luku'), T('Puuseppä ja muusikko')),

      h(T('Koulutus')),
      line('11/2026', T('Laivalle töihin -valmennus (5 pv)'), T('Merivälitys ja Spring House')),
      line('2012', T('Puolimatruusikurssi'), 'WinNova'),
      line('1994', T('Puuseppä'), T('Ikaalisten käsi- ja taideteollisuusoppilaitos')),

      h(T('Kielitaito')),
      p(T('Suomi: äidinkieli  ·  Englanti: erinomainen  ·  Espanja ja norja: keskustelen ja kirjoitan  ·  Ruotsi: keskustelen')),

      h(T('Muu osaaminen')),
      line(T('Turvatoimitehtävä'), T('Savusukeltaja')),
      line(T('Taidot'), T('Puusepän ammattitaito, köysityöt, maalaus ja kunnossapito, trukki, asiakaspalvelu')),
      line(T('Muu työkokemus'), T('Näyttelymestari, Ateneumin taidemuseo (7 kk) · vastaava puuseppä, Aleksanterin teatteri (7 kk) · puusepän, rakennusmiehen ja baarityöntekijän töitä')),
      line(T('Vapaa-ajalla'), T('Soitan kolmessa bändissä ja pelaan biljardia')),
    ],
  }],
});
Packer.toBuffer(doc).then((b) => fs.writeFileSync(process.argv[2], b));
