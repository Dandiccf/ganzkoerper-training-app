# PDF-Generator

`build_pdf.py` ist der reproduzierbare Generator der aktuellen Trainingsplan-PDF.

Aus dem Projektstamm:

```bash
python3 tools/pdf-generator/build_pdf.py
```

Die Ausgabe wird als `pdf/Trainingsplan-Ganzkoerper-3-Tage.pdf` geschrieben. Benötigt wird das Python-Paket `reportlab`.

`index.html` und `render.js` dokumentieren einen früheren HTML-Prototyp des Layouts. Die Python-Datei ist für die aktuelle PDF die maßgebliche Version.

