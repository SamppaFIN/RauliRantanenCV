# Rauli Rantanen – meri-CV

Staattinen verkko-CV kolmella kielellä, julkaistaan GitHub Pagesiin (`.github/workflows/pages.yml`) jokaisesta `main`-haaran pushista.

- `index.html` – suomi (lähdeversio, tätä muokataan)
- `en.html`, `sv.html` – englanti ja ruotsi, generoidaan suomenkielisestä sivusta
- `assets/` – kuvat
- `liitteet/` – ladattavat CV:t (PDF ja Word) kaikilla kolmella kielellä
- `tools/` – käännökset ja generointiskriptit

Todistusten kopioita ei julkaista; ne pyydetään sähköpostilla.

## Muutosten tekeminen

1. Muokkaa `index.html` (suomi).
2. Lisää uudet tai muuttuneet tekstit käännöksineen tiedostoon `tools/i18n.json` (`site.en` ja `site.sv`).
3. Generoi kieliversiot: `python3 tools/build_i18n.py`. Skripti listaa kaikki tekstit, joilta puuttuu käännös.

CV-tiedostot (Word; PDF tehdään Wordista esim. LibreOfficella):

```
node tools/cv.js liitteet/Rauli_Rantanen_CV.docx fi
node tools/cv.js liitteet/Rauli_Rantanen_CV_EN.docx en
node tools/cv.js liitteet/Rauli_Rantanen_CV_SV.docx sv
```

`tools/cv.js` tarvitsee npm-paketin `docx`.
