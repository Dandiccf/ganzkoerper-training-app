from pathlib import Path

from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = ROOT.parent.parent
OUT = PROJECT_ROOT / "pdf" / "Trainingsplan-Ganzkoerper-3-Tage.pdf"
ASSETS = PROJECT_ROOT / "design-assets"
W, H = A4

INK = HexColor("#141414")
MUTED = HexColor("#686868")
LINE = HexColor("#d9d9d4")
PAPER = HexColor("#fbfaf7")
SOFT = HexColor("#f1f0eb")
A = HexColor("#f3b515")
A_SOFT = HexColor("#fff6d8")
B = HexColor("#2775e8")
B_SOFT = HexColor("#eaf2ff")
C = HexColor("#3b9b45")
C_SOFT = HexColor("#eaf6e9")


DAYS = [
    {
        "id": "a", "letter": "A", "title": "DRUCK-FOKUS", "accent": A, "soft": A_SOFT,
        "focus": "Oberkörper schwer · Unterkörper leicht",
        "exercises": [
            ("Weighted Dips", "2 × 6–10", "Brust", "Trizeps · vordere Schulter", "Brust hoch, Schulterblätter stabil; nur schmerzfreier Bewegungsweg."),
            ("Klimmzüge Obergriff", "2 × 6–10", "Rücken", "Bizeps · hintere Schulter", "Aus dem aktiven Hang ziehen; kein Schwung aus der Hüfte."),
            ("Pike Push-ups", "2 × 6–10", "Schulter", "Trizeps · obere Brust", "Hüfte hoch; Kopf kontrolliert vor den Händen absenken."),
            ("Seal Rows", "2 × 6–10", "Mittlerer Rücken", "Bizeps · hintere Schulter", "Brust bleibt auf der Bank; am oberen Punkt kurz halten."),
            ("Goblet Squats", "2 × 15–25", "Quadrizeps", "Gesäß · Waden", "Knie folgen den Fußspitzen; Rumpf aufrecht halten."),
            ("Hyperextensions", "2 × 15–25", "Unterer Rücken", "Gesäß · Beinbeuger", "Aus der Hüfte strecken; oben nicht ins Hohlkreuz drücken."),
            ("SZ-Curls", "2 × 8–12", "Bizeps", "Unterarm", "Ellbogen ruhig halten; Gewicht kontrolliert absenken."),
            ("Ring Triceps Extensions", "2 × 8–12", "Trizeps", "Hintere Schulter", "Körper als Linie; Schwierigkeit über die Fußposition skalieren."),
            ("Hanging Knee Raises", "2 × 8–12", "Core", "Hüftbeuger", "Becken aktiv einrollen; Pendeln konsequent vermeiden."),
        ],
    },
    {
        "id": "b", "letter": "B", "title": "BEINE-FOKUS", "accent": B, "soft": B_SOFT,
        "focus": "Unterkörper schwer · Oberkörper leicht",
        "exercises": [
            ("Front Squats", "2 × 6–10", "Quadrizeps", "Gesäß · Core", "Ellbogen hoch, Rumpf fest; kontrolliert in die Tiefe."),
            ("RDLs", "2 × 6–10", "Beinbeuger", "Gesäß · unterer Rücken", "Hüfte weit nach hinten; Stange dicht am Körper führen."),
            ("KH-Schulterdrücken", "2 × 15–25", "Schulter", "Trizeps", "Rippen unten halten; Hanteln kontrolliert über Kopf bringen."),
            ("Chin-ups", "2 × 15–25", "Latissimus", "Bizeps", "Mit Band oder Latzug skalieren, damit der Bereich erreichbar bleibt."),
            ("Inverted Rows", "2 × 15–25", "Mittlerer Rücken", "Bizeps", "Körper bleibt als Linie; Brust zur Stange ziehen."),
            ("Ring Push-ups", "2 × 15–25", "Brust", "Vordere Schulter · Trizeps", "Ringe stabil halten; Schulterblätter kontrolliert bewegen."),
            ("Seitheben", "2 × 8–12", "Seitliche Schulter", "Trapez", "Leichtes Gewicht, kein Schwung; Arme in Schulterebene."),
            ("Wadenheben stehend", "2 × 8–12", "Waden", "Gastrocnemius · Soleus", "Unten voll dehnen; oben eine Sekunde deutlich anspannen."),
            ("Ab-Wheel Rollouts", "2 × 8–12", "Core", "Unterer Rücken", "Gesäß anspannen; Bewegungsweg vor dem Hohlkreuz stoppen."),
        ],
    },
    {
        "id": "c", "letter": "C", "title": "RÜCKEN-FOKUS", "accent": C, "soft": C_SOFT,
        "focus": "Oberkörper schwer · Unterkörper leicht",
        "exercises": [
            ("Neutral-Grip Pull-ups", "2 × 6–10", "Rücken", "Bizeps · hintere Schulter", "Schulterblätter zuerst setzen; Ellbogen nach unten ziehen."),
            ("KH-Schrägbankdrücken", "2 × 6–10", "Brust", "Vordere Schulter · Trizeps", "Schulterblätter stabil; Hanteln kontrolliert absenken."),
            ("Chest Supported Rows", "2 × 6–10", "Mittlerer Rücken", "Bizeps · hintere Schulter", "Ohne Schwung zur unteren Brust ziehen; oben kurz halten."),
            ("LH-Schulterdrücken", "2 × 6–10", "Vordere Schulter", "Trizeps · obere Brust", "Rumpf fest; Stange eng am Gesicht vorbei führen."),
            ("ATG Split Squats", "2 × 15–25 / Bein", "Quadrizeps", "Gesäß · Waden", "Vorderes Knie kontrolliert vor; Balance vor Zusatzgewicht."),
            ("Good Mornings", "2 × 15–25", "Beinbeuger", "Gesäß · unterer Rücken", "Leicht trainieren; Hüfte zurück und Wirbelsäule neutral."),
            ("Trizepsstrecken Kabel", "2 × 8–12", "Trizeps", "Hintere Schulter", "Ellbogen fixieren; am Ende vollständig und kontrolliert strecken."),
            ("Hammer-Curls", "2 × 8–12", "Bizeps", "Unterarm", "Neutraler Griff; Oberarme bleiben ruhig am Körper."),
            ("Hanging Leg Raises", "2 × 8–12", "Core", "Hüftbeuger", "Becken am oberen Punkt einrollen; ohne Schwung absenken."),
        ],
    },
]


def set_font(c, bold=False, size=10, color=INK):
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.setFillColor(color)


def wrap_lines(text, font, size, max_width, max_lines=None):
    words = text.split()
    lines, current = [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if stringWidth(trial, font, size) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
            if max_lines and len(lines) == max_lines - 1:
                break
    if current and (not max_lines or len(lines) < max_lines):
        lines.append(current)
    if max_lines and len(lines) == max_lines and words:
        joined = " ".join(lines)
        if len(joined) < len(text) and not lines[-1].endswith("…"):
            while stringWidth(lines[-1] + "…", font, size) > max_width and len(lines[-1]) > 3:
                lines[-1] = lines[-1][:-1]
            lines[-1] += "…"
    return lines


def draw_wrapped(c, text, x, y, max_width, size=9, leading=None, bold=False, color=INK, max_lines=None):
    font = "Helvetica-Bold" if bold else "Helvetica"
    leading = leading or size * 1.25
    set_font(c, bold, size, color)
    lines = wrap_lines(text, font, size, max_width, max_lines)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def rect(c, x, y, w, h, fill, stroke=None, radius=0):
    c.setFillColor(fill)
    c.setStrokeColor(stroke or fill)
    if radius:
        c.roundRect(x, y, w, h, radius, fill=1, stroke=1 if stroke else 0)
    else:
        c.rect(x, y, w, h, fill=1, stroke=1 if stroke else 0)


def page_base(c, number):
    rect(c, 0, 0, W, H, PAPER)
    set_font(c, True, 7, HexColor("#92928d"))
    c.drawRightString(W - 36, 18, f"{number:02d}")


def heading(c, eyebrow, title, note=None):
    set_font(c, True, 7.5, MUTED)
    c.drawString(36, H - 40, eyebrow.upper())
    set_font(c, True, 24, INK)
    c.drawString(36, H - 67, title.upper())
    if note:
        draw_wrapped(c, note, W - 240, H - 43, 204, 7.4, 9.2, False, MUTED, 3)
    c.setStrokeColor(INK)
    c.setLineWidth(1.1)
    c.line(36, H - 79, W - 36, H - 79)


def draw_cover(c):
    page_base(c, 1)
    rect(c, 36, H - 43, 54, 7, A)
    rect(c, 90, H - 43, 54, 7, B)
    rect(c, 144, H - 43, 54, 7, C)
    set_font(c, True, 8, INK)
    c.drawString(208, H - 42, "TRAININGSHANDBUCH · VERSION 1.0")
    set_font(c, True, 8, MUTED)
    c.drawString(36, H - 88, "KRAFT · MUSKELAUFBAU · KLARE PROGRESSION")
    set_font(c, True, 37, INK)
    c.drawString(36, H - 132, "GANZKÖRPER")
    c.drawString(36, H - 171, "3-TAGE-ROTATION")
    draw_wrapped(c, "Ein fokussierter A/B/C-Plan mit zwei hochwertigen Arbeitssätzen pro Übung: Druck, Beine und Rücken im Wechsel.", 36, H - 198, 455, 10.5, 14, False, HexColor("#333333"), 3)
    image = ImageReader(str(ASSETS / "cover.png"))
    c.drawImage(image, 0, 250, width=W, height=337, preserveAspectRatio=True, anchor="c", mask="auto")
    stats = [("3×", "Training pro Woche"), ("2", "Arbeitssätze pro Übung"), ("50–65", "Minuten pro Einheit")]
    col_w = (W - 72 - 24) / 3
    for i, (big, label) in enumerate(stats):
        x = 36 + i * (col_w + 12)
        c.setStrokeColor(INK)
        c.setLineWidth(1.4)
        c.line(x, 212, x + col_w, 212)
        set_font(c, True, 18, INK)
        c.drawString(x, 188, big)
        set_font(c, False, 7.5, MUTED)
        c.drawString(x, 175, label)
    draw_wrapped(c, "Hinweis: Allgemeine Trainingsvorlage, keine medizinische oder physiotherapeutische Beratung. Schmerzen sind ein Stoppsignal; Technik und individuelle Belastbarkeit haben Vorrang.", 36, 48, 500, 6.5, 8.4, False, MUTED, 3)
    c.showPage()


def draw_week(c):
    page_base(c, 2)
    heading(c, "Deine Trainingswoche", "Wochenplan", "Zwischen den Einheiten liegt mindestens ein Ruhetag. Die Reihenfolge A → B → C bleibt erhalten, auch wenn sich die Wochentage verschieben.")
    y, box_h = H - 285, 185
    gap, rest_w = 10, 34
    box_w = (W - 72 - 2 * rest_w - 4 * gap) / 3
    x = 36
    labels = [("MONTAG", "DRUCK", DAYS[0]), ("MITTWOCH", "BEINE", DAYS[1]), ("FREITAG", "RÜCKEN", DAYS[2])]
    for i, (weekday, title, day) in enumerate(labels):
        rect(c, x, y, box_w, box_h, day["soft"])
        rect(c, x, y + box_h - 19, box_w, 19, day["accent"])
        set_font(c, True, 31, day["accent"])
        c.drawString(x + 14, y + box_h - 60, day["letter"])
        set_font(c, True, 7, INK)
        c.drawString(x + 14, y + box_h - 82, weekday)
        set_font(c, True, 15, INK)
        c.drawString(x + 14, y + box_h - 103, title)
        draw_wrapped(c, day["focus"].replace(" · ", "\n"), x + 14, y + box_h - 125, box_w - 28, 8, 11, False, HexColor("#444444"), 4)
        set_font(c, True, 8, day["accent"])
        c.drawString(x + 14, y + 18, "6–10 / 15–25 WDH.")
        x += box_w
        if i < 2:
            x += gap
            set_font(c, True, 7, MUTED)
            c.saveState()
            c.translate(x + rest_w / 2, y + box_h / 2)
            c.rotate(90)
            c.drawCentredString(0, -2, "RUHETAG")
            c.restoreState()
            x += rest_w + gap

    cards = [
        ("1–2", "Wiederholungen im Tank", "Die meisten Arbeitssätze enden bei RIR 1–2."),
        ("2–3′", "Pause bei schweren Sätzen", "Leicht: 90–120 s. Isolation/Core: 60–90 s."),
        ("2", "Arbeitssätze", "Aufwärmsätze zählen nicht als Arbeitssätze."),
        ("+1", "Letztes Training schlagen", "Mehr Wiederholungen, Last oder bessere Technik."),
    ]
    y2, ch, cg = 340, 118, 9
    cw = (W - 72 - 3 * cg) / 4
    for i, (big, title, body) in enumerate(cards):
        xx = 36 + i * (cw + cg)
        rect(c, xx, y2, cw, ch, white, LINE)
        set_font(c, True, 18, INK)
        c.drawString(xx + 12, y2 + ch - 28, big)
        draw_wrapped(c, title, xx + 12, y2 + ch - 50, cw - 24, 7.6, 9.2, True, INK, 2)
        draw_wrapped(c, body, xx + 12, y2 + 39, cw - 24, 6.8, 8.4, False, MUTED, 4)

    bands = [
        (A, "FESTE WOCHE", "Montag A · Mittwoch B · Freitag C. Leicht planbar und stets mindestens 48 Stunden Erholung."),
        (B, "FLEXIBLE ROTATION", "A → 1–2 Tage Pause → B → 1–2 Tage Pause → C. Danach wieder bei A beginnen."),
    ]
    for i, (accent, title, body) in enumerate(bands):
        xx = 36 + i * ((W - 72 - 12) / 2 + 12)
        ww = (W - 72 - 12) / 2
        rect(c, xx, 224, ww, 85, SOFT)
        rect(c, xx, 224, 11, 85, accent)
        set_font(c, True, 8.5, INK)
        c.drawString(xx + 22, 288, title)
        draw_wrapped(c, body, xx + 22, 271, ww - 34, 7.4, 9.5, False, HexColor("#444444"), 5)

    rect(c, 36, 104, W - 72, 85, A_SOFT)
    rect(c, 36, 104, 11, 85, A)
    set_font(c, True, 9, INK)
    c.drawString(58, 164, "STARTGEWICHT WÄHLEN")
    draw_wrapped(c, "In Woche 1 bewusst konservativ beginnen. Im ersten Satz sollten mindestens zwei technisch saubere Wiederholungen möglich bleiben. Erst wenn Bewegungsweg, Tempo und Körperspannung stimmen, wird gesteigert.", 58, 145, W - 118, 8, 10.6, False, HexColor("#444444"), 5)
    c.showPage()


def draw_exercise_card(c, day, ex, idx, x, y, w, h):
    accent, soft = day["accent"], day["soft"]
    rect(c, x, y, w, h, white, LINE)
    rect(c, x, y + h - 6, w, 6, accent)
    set_font(c, True, 13, accent)
    c.drawString(x + 9, y + h - 27, f"{idx:02d}")
    draw_wrapped(c, ex[0].upper(), x + 39, y + h - 22, w - 49, 8.5, 9.6, True, INK, 2)
    img_path = ASSETS / "muscle-groups" / f"{day['id']}-{idx}.png"
    c.drawImage(ImageReader(str(img_path)), x + 7, y + h - 116, width=69, height=68, preserveAspectRatio=True, anchor="c", mask="auto")
    rect(c, x + 82, y + h - 72, w - 91, 25, soft)
    set_font(c, True, 9, accent)
    c.drawCentredString(x + 82 + (w - 91) / 2, y + h - 63, ex[1])
    set_font(c, True, 7.1, accent)
    c.drawString(x + 82, y + h - 87, ex[2].upper())
    draw_wrapped(c, ex[3], x + 82, y + h - 99, w - 91, 6.1, 7.5, False, MUTED, 2)
    c.setStrokeColor(HexColor("#e6e6e2"))
    c.line(x + 9, y + 68, x + w - 9, y + 68)
    draw_wrapped(c, ex[4], x + 9, y + 57, w - 18, 6.4, 8.0, False, HexColor("#454545"), 4)
    set_font(c, False, 6.1, MUTED)
    c.drawString(x + 9, y + 14, "SATZ 1")
    c.drawString(x + w / 2 + 2, y + 14, "SATZ 2")
    c.setStrokeColor(HexColor("#aaaaa6"))
    c.line(x + 9, y + 9, x + w / 2 - 6, y + 9)
    c.line(x + w / 2 + 2, y + 9, x + w - 9, y + 9)


def draw_day(c, day, number):
    page_base(c, number)
    accent = day["accent"]
    set_font(c, True, 40, accent)
    c.drawString(36, H - 63, day["letter"])
    set_font(c, True, 7.5, MUTED)
    c.drawString(84, H - 41, f"TRAININGSTAG {day['letter']}")
    set_font(c, True, 21, INK)
    c.drawString(84, H - 66, day["title"])
    set_font(c, False, 7.5, MUTED)
    c.drawString(84, H - 79, day["focus"])
    rect(c, W - 153, H - 72, 117, 24, day["soft"], accent)
    set_font(c, True, 7, accent)
    c.drawCentredString(W - 94.5, H - 63.5, "2 SÄTZE · RIR 1–2")
    c.setStrokeColor(accent)
    c.setLineWidth(1.5)
    c.line(36, H - 91, W - 36, H - 91)

    gap = 10
    grid_top, grid_bottom = H - 104, 39
    card_w = (W - 72 - 2 * gap) / 3
    card_h = (grid_top - grid_bottom - 2 * gap) / 3
    for i, ex in enumerate(day["exercises"]):
        row, col = divmod(i, 3)
        x = 36 + col * (card_w + gap)
        y = grid_top - (row + 1) * card_h - row * gap
        draw_exercise_card(c, day, ex, i + 1, x, y, card_w, card_h)
    c.showPage()


def draw_progression(c):
    page_base(c, 6)
    heading(c, "Einfach und messbar", "Progression", "Das Ziel ist nicht, jeden Satz bis zum Versagen zu treiben. Das Ziel ist, über Wochen mehr saubere Arbeit zu leisten.")
    left_x, right_x, top = 36, W / 2 + 6, H - 100
    col_w = W / 2 - 48

    def card(x, y_top, h, title, body_lines, accent=None, soft=white):
        rect(c, x, y_top - h, col_w, h, soft, LINE)
        if accent:
            rect(c, x, y_top - h, 12, h, accent)
        tx = x + (23 if accent else 12)
        set_font(c, True, 10, INK)
        c.drawString(tx, y_top - 22, title)
        yy = y_top - 41
        for line in body_lines:
            set_font(c, True, 7, accent or INK)
            c.drawString(tx, yy, "•")
            yy = draw_wrapped(c, line, tx + 11, yy, col_w - (tx - x) - 22, 7.3, 9.3, False, HexColor("#3f3f3f"), 3) - 5
        return y_top - h - 12

    y = card(left_x, top, 233, "DOPPELTE PROGRESSION", [
        "Beginne im unteren Bereich der Zielwiederholungen.",
        "Steigere zuerst die Wiederholungen bei gleichem Gewicht.",
        "Obere Grenze in beiden Sätzen bei RIR 1–2 erreicht: Gewicht erhöhen.",
        "Nach der Steigerung wieder näher am unteren Ende beginnen.",
    ], B, B_SOFT)
    rect(c, left_x + 22, y + 28, col_w - 44, 46, white, HexColor("#aabede"))
    set_font(c, True, 8.2, INK)
    c.drawCentredString(left_x + col_w / 2, y + 54, "70 kg: 9/8  →  70 kg: 10/10  →  72,5 kg: 7/6")
    y -= 11
    y = card(left_x, y, 135, "EMPFOHLENE STEIGERUNGEN", [
        "Oberkörper-Grundübungen: +1 bis +2,5 kg",
        "Unterkörper-Grundübungen: +2,5 bis +5 kg",
        "Kabel, Kurzhantel, Isolation: kleinste sinnvolle Stufe",
    ])
    card(left_x, y, 113, "LEICHTERE WOCHE", [
        "Nach 6–8 harten Wochen oder bei zwei Wochen Leistungsabfall: Last um 10–15 % oder Satzanzahl um 30–50 % reduzieren.",
    ])

    y = card(right_x, top, 164, "AUFWÄRMEN IN 8 MINUTEN", [
        "3–5 Minuten lockere Bewegung.",
        "Erste Hauptübung: 3–4 Steigerungssätze.",
        "Zweite Hauptübung: 1–3 Steigerungssätze.",
        "Leichte Übungen meist ohne separaten Aufwärmsatz.",
    ])
    rect(c, right_x, y - 307, col_w, 307, white, LINE)
    set_font(c, True, 10, INK)
    c.drawString(right_x + 12, y - 22, "ERSATZÜBUNGEN")
    rows = [
        ("Dips", "KH-Bankdrücken · Liegestütz"),
        ("Klimmzug", "Latzug · Band-Klimmzug"),
        ("Rudern", "Kabelrudern · KH-Rudern"),
        ("Front Squat", "Hack Squat · Beinpresse"),
        ("RDL / Good Morning", "Hip Thrust · Hyperextension"),
        ("Schulterdrücken", "Landmine Press · Maschine"),
        ("Core hängend", "Reverse Crunch · Dead Bug"),
    ]
    yy = y - 48
    for movement, alternative in rows:
        c.setStrokeColor(LINE)
        c.line(right_x + 12, yy - 19, right_x + col_w - 12, yy - 19)
        set_font(c, True, 7.1, INK)
        c.drawString(right_x + 12, yy, movement)
        draw_wrapped(c, alternative, right_x + 104, yy, col_w - 120, 6.8, 8.4, False, MUTED, 2)
        yy -= 35
    y = y - 319
    card(right_x, y, 121, "STOPPSIGNALE", [
        "Stechender Schmerz, instabile Gelenkposition oder deutlicher Technikverlust: Satz beenden. Übung schmerzfrei skalieren oder ersetzen; wiederkehrende Beschwerden fachlich abklären.",
    ], C, C_SOFT)
    c.showPage()


def draw_log(c):
    page_base(c, 7)
    heading(c, "Zum Kopieren und Wiederverwenden", "Wochenprotokoll", "Gewicht und Wiederholungen pro Satz eintragen. RIR bezeichnet die noch möglichen technisch sauberen Wiederholungen.")
    fields = [(36, 255, "NAME"), (305, 116, "WOCHE"), (435, 124, "DATUM")]
    for x, w, label in fields:
        set_font(c, True, 6.5, MUTED)
        c.drawString(x, H - 103, label)
        c.setStrokeColor(HexColor("#777777"))
        c.line(x, H - 118, x + w, H - 118)
    top = H - 137
    block_h = 205
    for day in DAYS:
        rect(c, 36, top - 23, W - 72, 23, day["soft"])
        rect(c, 36, top - 23, 10, 23, day["accent"])
        set_font(c, True, 8, day["accent"])
        c.drawString(56, top - 15, f"TAG {day['letter']} · {day['title']}")
        set_font(c, True, 6.5, MUTED)
        c.drawRightString(W - 45, top - 15, "DATUM: __________________")
        cols = [16, 164, 57, 43, 43, 36, 92]
        headers = ["#", "ÜBUNG", "GEWICHT", "SATZ 1", "SATZ 2", "RIR", "NOTIZ"]
        x = 36
        header_y = top - 43
        for w, label in zip(cols, headers):
            rect(c, x, header_y, w, 20, SOFT, LINE)
            set_font(c, True, 5.7, MUTED)
            c.drawCentredString(x + w / 2, header_y + 7, label)
            x += w
        row_y = header_y - 15
        for idx, ex in enumerate(day["exercises"], 1):
            x = 36
            for ci, w in enumerate(cols):
                rect(c, x, row_y, w, 15, white, LINE)
                if ci == 0:
                    set_font(c, False, 6, MUTED)
                    c.drawCentredString(x + w / 2, row_y + 5, str(idx))
                elif ci == 1:
                    set_font(c, False, 6.2, INK)
                    c.drawString(x + 4, row_y + 5, ex[0])
                x += w
            row_y -= 15
        top -= block_h
    c.showPage()


def draw_checkin(c):
    page_base(c, 8)
    heading(c, "Regeneration sichtbar machen", "Wochen-Check-in", "Ein kurzer Check-in hilft, Leistungsschwankungen einzuordnen und unnötige Planwechsel zu vermeiden.")
    fields = [(36, 240, "WOCHE / ZEITRAUM"), (300, 125, "KÖRPERGEWICHT"), (449, 110, "EINHEITEN")]
    for x, w, label in fields:
        set_font(c, True, 6.5, MUTED)
        c.drawString(x, H - 103, label)
        c.setStrokeColor(HexColor("#777777"))
        c.line(x, H - 118, x + w, H - 118)

    box_w = (W - 72 - 12) / 2
    boxes = [
        (36, 475, "BELASTUNG & ERHOLUNG"),
        (36 + box_w + 12, 475, "ERFOLG DER WOCHE"),
        (36, 224, "WAS WAR SCHWIERIG?"),
        (36 + box_w + 12, 224, "FOKUS FÜR NÄCHSTE WOCHE"),
    ]
    for x, y, title in boxes:
        rect(c, x, y, box_w, 225, white, LINE)
        set_font(c, True, 9, INK)
        c.drawString(x + 14, y + 199, title)
        if title == "BELASTUNG & ERHOLUNG":
            metrics = ["Schlafqualität", "Energie", "Muskelkater", "Motivation", "Gelenke"]
            yy = y + 164
            for metric in metrics:
                set_font(c, False, 7.4, INK)
                c.drawString(x + 14, yy + 3, metric)
                for score in range(1, 6):
                    cx = x + 118 + (score - 1) * 25
                    c.setStrokeColor(HexColor("#999999"))
                    c.circle(cx, yy + 5, 7, fill=0, stroke=1)
                    set_font(c, False, 5.8, MUTED)
                    c.drawCentredString(cx, yy + 3, str(score))
                yy -= 30
        else:
            c.setStrokeColor(HexColor("#cececa"))
            for i in range(6):
                ly = y + 165 - i * 25
                c.line(x + 14, ly, x + box_w - 14, ly)

    rect(c, 36, 75, W - 72, 104, C_SOFT)
    rect(c, 36, 75, 12, 104, C)
    set_font(c, True, 9, INK)
    c.drawString(60, 153, "ENTSCHEIDUNGSREGEL")
    draw_wrapped(c, "Gute Erholung und stabile Technik: normal weitertrainieren. Mehrere schlechte Marker plus Leistungsabfall: Last halten oder eine leichtere Woche einlegen. Einzelne schlechte Tage sind noch kein Grund, den Plan zu wechseln.", 60, 133, W - 118, 8, 10.6, False, HexColor("#444444"), 5)
    c.showPage()


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
    c.setTitle("Ganzkörper 3-Tage-Rotation")
    c.setAuthor("Trainingsplan")
    draw_cover(c)
    draw_week(c)
    for number, day in enumerate(DAYS, 3):
        draw_day(c, day, number)
    draw_progression(c)
    draw_log(c)
    draw_checkin(c)
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
