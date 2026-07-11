# Anleitung: Ihre neue Website online bringen (GitHub Pages)

Diese Website ist fertig und braucht **kein Programmier-Tool** – es sind reine
HTML-Dateien. Sie können alles per Doppelklick im Browser ansehen und mit einem
einfachen Texteditor bearbeiten.

## Inhalt dieses Ordners

| Datei | Bedeutung |
|-------|-----------|
| `index.html` | Startseite |
| `blog.html` | Blog-Übersicht |
| `blog-beispiel.html` | Vorlage für einen einzelnen Blog-Beitrag (kopieren!) |
| `galerie.html` | Fotogalerie |
| `ueber-uns.html` | Über-uns-Seite |
| `kontakt.html` | Kontakt + Formular |
| `impressum.html` / `datenschutz.html` | Pflichtseiten (ausfüllen!) |
| `404.html` | Fehlerseite |
| `css/style.css` | Das Design (Farben, Schrift, Layout) |
| `js/main.js` | Kleines Skript fürs Menü |
| `img/` | Ordner für Ihre Fotos |
| `robots.txt`, `sitemap.xml` | Für Google (SEO) |
| `CNAME` | Ihre Domain (für GitHub Pages) |

---

## Schritt 1 – Alte Seite von IONOS sichern (ZUERST!)

**Wichtig: Kündigen Sie bei IONOS noch nichts.** Erst sichern.

1. Programm **FileZilla** installieren (kostenlos, filezilla-project.org).
2. Im IONOS-Kundenkonto die **FTP-/SFTP-Zugangsdaten** finden
   (Menü „Hosting" → „SFTP & SSH"): Server, Benutzername, Passwort.
3. In FileZilla verbinden und den **kompletten Inhalt** des Webordners
   (meist `/`, `/htdocs` oder `/html`) auf Ihren PC herunterladen.
4. Besonders wichtig: alle **Fotos** und **Blog-Texte** sichern – die brauchen
   Sie gleich für die neue Seite.

> Läuft Ihre alte Seite auf WordPress? Dann exportieren Sie zusätzlich unter
> „Werkzeuge → Daten exportieren" eine XML-Datei mit allen Texten.

---

## Schritt 2 – Inhalte einsetzen (optional, geht auch später)

- **Fotos:** in den Ordner `img/` legen. Dann in `galerie.html` bzw. in den
  Blog-Beiträgen den Platzhalter durch
  `<img src="img/mein-foto.jpg" alt="Beschreibung">` ersetzen.
- **Blog-Beitrag anlegen:** `blog-beispiel.html` kopieren, umbenennen
  (z. B. `blog-sommerurlaub.html`), Text/Foto anpassen, in `blog.html` eine Karte
  mit Link darauf einfügen.
- **Impressum & Datenschutz** ausfüllen (rechtlich verpflichtend).
- **Texte** überall dort ändern, wo es passt (Startseite, Über uns).

Tipp: Zum Ansehen einfach `index.html` doppelklicken – die Seite öffnet sich im Browser.

---

## Schritt 3 – GitHub-Account & Repository anlegen

1. Auf **github.com** kostenlos registrieren.
2. Oben rechts **„+" → „New repository"**.
3. Name z. B. `familie-tischenreut`, Sichtbarkeit **Public**, dann
   **„Create repository"**.

---

## Schritt 4 – Dateien hochladen

Der einfachste Weg (ohne Programme):

1. Im neuen Repository auf **„Add file" → „Upload files"** klicken.
2. **Alle Dateien und Ordner** aus diesem Website-Ordner per Drag & Drop
   ins Browserfenster ziehen (inkl. `css`, `js`, `img`).
3. Unten auf **„Commit changes"** klicken.

---

## Schritt 5 – GitHub Pages aktivieren

1. Im Repository auf **„Settings" → „Pages"**.
2. Unter **„Source"**: „Deploy from a branch" wählen.
3. Branch **`main`**, Ordner **`/ (root)`**, **Save**.
4. Nach 1–2 Minuten ist die Seite unter
   `https://IHR-BENUTZERNAME.github.io/familie-tischenreut/` erreichbar.
   **Prüfen Sie hier, ob alles gut aussieht.**

---

## Schritt 6 – Eigene Domain verbinden (Domain bleibt bei IONOS)

**In GitHub:**
- „Settings" → „Pages" → **„Custom domain"** = `www.familie-tischenreut.de` → Save.
  (Die beiliegende `CNAME`-Datei sorgt dafür, dass das erhalten bleibt.)

**Bei IONOS (Kundenkonto → Domains → familie-tischenreut.de → DNS):**

| Typ | Host/Name | Wert/Ziel |
|-----|-----------|-----------|
| CNAME | `www` | `IHR-BENUTZERNAME.github.io` |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

- Alte A-Einträge / Weiterleitungen, die auf den IONOS-Server zeigen, **entfernen**.
- Die Umstellung kann einige Stunden dauern (bis zu 48 h).
- Danach in GitHub „Pages" → **„Enforce HTTPS"** aktivieren (kostenloses Schloss-Symbol 🔒).

> **Neuer Domainname gewünscht?** Dann diesen Schritt mit der neuen Domain machen
> und in `CNAME` sowie in allen `<link rel="canonical">`-Zeilen und in `sitemap.xml`/
> `robots.txt` den Domainnamen austauschen. Sagen Sie mir Bescheid – ich passe das für Sie an.

---

## Schritt 7 – Bei Google anmelden (mehr Aufrufe)

1. **Google Search Console** öffnen (search.google.com/search-console).
2. Domain hinzufügen und bestätigen.
3. Unter „Sitemaps" die Adresse `sitemap.xml` einreichen.
   → So findet Google Ihre Seiten schneller.

---

## Schritt 8 – Erst jetzt IONOS-Hosting kündigen

Wenn die neue Seite unter Ihrer Domain läuft und geprüft ist:
- **Webhosting-Paket** bei IONOS kündigen.
- **Die Domain selbst NICHT kündigen** – die behalten Sie, sonst ist sie weg!

---

## Fragen?

Sagen Sie mir einfach, an welchem Schritt Sie gerade sind, oder welche Inhalte
(Texte/Fotos) eingebaut werden sollen – ich helfe weiter und passe die Seite an.
