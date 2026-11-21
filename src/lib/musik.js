/*
  Musik, Plattenteller und fliegende Platte für johannesbrix.com
  Getestet in den Referenzseiten (docs/referenz/) und in Astro mit ClientRouter.

  Einbinden in Astro: im Basis-Layout  <script>import '../lib/musik.js';</script>
  Das Skript läuft einmal und findet nach jedem Seitenwechsel (astro:page-load)
  die neue Footer-Platte selbst.

  Erwartetes HTML (Klassen siehe docs/design.md):

    <div transition:persist="musik">                       (nur in Astro)
      <audio data-song src="/musik/gypsy-jazz.mp3" data-titel="Gypsy Jazz"
             data-interpret="Aurec" loop preload="none"></audio>
      <button data-flieger class="flieger" type="button" aria-label="Platte und Musik anhalten">
        <span class="scheibe">…Etikett, Spindel…</span><span class="glanz"></span>
      </button>
      <button data-flieger-weg class="flieger-weg" type="button" hidden>Ausblenden</button>
    </div>

    Im Footer:
    <button data-platte class="platte" type="button" aria-label="Song abspielen">…</button>
    <p data-platte-text>Zum Abspielen tippen</p>
    <button data-flieger-schalter type="button" hidden>Fliegende Platte ausblenden</button>

    Seiten, auf denen die Platte nicht fliegen soll (z. B. die Brixmap): <body data-platte-parken>

  Verhalten:
  - Beim Laden wird versucht, die Musik abzuspielen. Browser erlauben Ton meist erst nach
    der ersten Berührung. Dann startet sie beim ersten Tippen, Klicken oder Tastendruck
    irgendwo auf der Seite (außer auf einer der beiden Platten).
  - Die fliegende Platte prallt an den Bildschirmrändern ab. Ein Tippen darauf schaltet um
    wie die Footer-Platte: Läuft Musik, halten Musik und Platte an, und sie bleibt an ihrer
    Stelle stehen. Läuft keine Musik, startet der Tipp sie.
  - Steht die Platte, erscheint daneben „Ausblenden“. Ausgeblendet bleibt sie auch beim
    nächsten Besuch weg, bis man im Footer „Fliegende Platte zeigen“ wählt. Ohne sichtbare
    Platte gibt es kein Autoplay; die Musik startet dann nur über die Footer-Platte.
  - Die Footer-Platte schaltet dieselbe Musik an und aus.
  - Beide Platten drehen sich genau dann, wenn Musik läuft. Pausieren hält Drehwinkel und
    Song-Position fest, weiterspielen macht dort weiter.
  - „Angehalten“, „ausgeblendet“ und die Position der fliegenden Platte merkt sich der Browser
    (localStorage), Song-Position und Drehwinkel für die Sitzung (sessionStorage).
  - prefers-reduced-motion: keine Bewegung, keine Drehung. Die fliegende Platte parkt unten
    rechts und bleibt der Ein- und Ausschalter. Auf Seiten mit data-platte-parken parkt sie
    ebenfalls, dreht sich aber weiter.
  - Ohne Song (kein data-song oder leere src): keine fliegende Platte, die Footer-Platte
    dreht sich beim Tippen nur.
  - Ohne fliegende Platte (plattenteller.fliegende_platte: false): kein Autoplay, die Musik
    startet nur über die Footer-Platte.
*/
(() => {
  if (window.__jbMusik) return;
  window.__jbMusik = true;

  const GRAD_PRO_SEKUNDE = 200; // eine Umdrehung in 1,8 Sekunden
  const LAUTSTAERKE = 0.6; // iOS ignoriert das und nutzt die Systemlautstärke
  const EINBLENDEN_MS = 800;
  const RAND = 16; // Abstand der geparkten Platte zum Rand
  const SCHLUESSEL = 'jb-platte';
  const STARTER = ['pointerdown', 'pointerup', 'keydown', 'click'];
  const STEUERUNG = '[data-flieger],[data-platte],[data-flieger-weg],[data-flieger-schalter]';

  const lesen = (art) => {
    try {
      return JSON.parse(window[art].getItem(SCHLUESSEL)) || {};
    } catch {
      return {};
    }
  };
  const schreiben = (art, wert) => {
    try {
      window[art].setItem(SCHLUESSEL, JSON.stringify(wert));
    } catch {}
  };

  const dauerhaft = lesen('localStorage'); // { an, versteckt, fx, fy }
  const sitzung = lesen('sessionStorage'); // { zeit, winkel, vx, vy }
  const reduziert = window.matchMedia('(prefers-reduced-motion: reduce)');

  let an = dauerhaft.an !== false; // Wunsch des Besuchers: Musik und Platte laufen
  let versteckt = dauerhaft.versteckt === true; // fliegende Platte ausgeblendet
  let ruhig = false; // die aktuelle Seite will die Platte geparkt haben
  let winkel = Number(sitzung.winkel) || 0;
  let x = 0, y = 0, vx = 0, vy = 0;
  let masse = { g: 56, bx: 0, by: 0 };
  let audio = null, flieger = null, wegKnopf = null, platten = [], texte = [], schalter = [], scheiben = [];
  let ohneSong = true, eingerichtet = false, positioniert = false, titel = '';
  let raf = 0, letzt = 0;

  const laeuft = () => !ohneSong && !audio.paused;
  const dreht = () => (ohneSong ? an : laeuft());
  const geparkt = () => reduziert.matches || ruhig;
  const sichtbar = () => Boolean(flieger) && !ohneSong && !versteckt;

  function elementeSuchen() {
    audio = document.querySelector('audio[data-song]');
    flieger = document.querySelector('[data-flieger]');
    wegKnopf = document.querySelector('[data-flieger-weg]');
    platten = [...document.querySelectorAll('[data-platte]')];
    texte = [...document.querySelectorAll('[data-platte-text]')];
    schalter = [...document.querySelectorAll('[data-flieger-schalter]')];
    texte.forEach((t) => {
      if (t.dataset.aus === undefined) t.dataset.aus = t.textContent;
    });
    scheiben = [...platten, flieger].filter(Boolean).map((b) => b.querySelector('.scheibe')).filter(Boolean);
    ruhig = document.body.hasAttribute('data-platte-parken');
  }

  function einrichten() {
    if (eingerichtet) return;
    eingerichtet = true;
    ohneSong = !audio || !audio.getAttribute('src');
    // Ohne Song nichts abspielen. Ohne (sichtbare) fliegende Platte kein Autoplay: dann startet
    // die Musik nur über die Footer-Platte.
    if (ohneSong || !flieger || versteckt) an = false;
    if (ohneSong) return;
    const t = audio.dataset.titel || '';
    const i = audio.dataset.interpret || '';
    titel = i ? `${t} – ${i}` : t;
    audio.volume = LAUTSTAERKE;
    if (sitzung.zeit) {
      try {
        audio.currentTime = sitzung.zeit;
      } catch {}
    }
    audio.addEventListener('play', () => {
      an = true;
      aktualisieren();
    });
    audio.addEventListener('pause', () => {
      an = false; // auch bei Pause von außen, z. B. Anruf, Sperrbildschirm oder ein Video
      speichern();
      aktualisieren();
    });
    audio.addEventListener('error', () => {
      ohneSong = true;
      an = false;
      aktualisieren();
    });
    if ('mediaSession' in navigator && 'MediaMetadata' in window) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: t, artist: i });
    }
  }

  function einblenden() {
    const start = performance.now();
    audio.volume = 0;
    const schritt = (jetzt) => {
      // Der Zeitstempel des ersten Frames kann knapp vor `start` liegen: nie unter 0
      const anteil = Math.max(0, Math.min(1, (jetzt - start) / EINBLENDEN_MS));
      audio.volume = LAUTSTAERKE * anteil;
      if (anteil < 1 && !audio.paused) requestAnimationFrame(schritt);
      else if (audio.paused) audio.volume = LAUTSTAERKE;
    };
    requestAnimationFrame(schritt);
  }

  function spielen() {
    const vorher = audio.volume;
    audio.volume = 0;
    return audio
      .play()
      .then(() => {
        einblenden();
        weg();
        return true;
      })
      .catch(() => {
        audio.volume = vorher || LAUTSTAERKE;
        return false;
      });
  }

  function abspielen() {
    an = true;
    if (!ohneSong) spielen();
    speichern();
    aktualisieren();
  }

  function anhalten() {
    an = false;
    if (!ohneSong) audio.pause(); // currentTime bleibt stehen
    speichern();
    aktualisieren();
  }

  // Fliegende Platte aus- oder wieder einblenden. Die Musik läuft dabei unverändert weiter.
  function verstecken(neu) {
    versteckt = neu;
    if (versteckt) {
      an = laeuft();
      weg();
    }
    if (flieger) flieger.hidden = !sichtbar(); // vor dem Messen sichtbar machen
    if (flieger && sichtbar() && !positioniert) {
      messen();
      startposition();
      positioniert = true;
      flieger.classList.add('bereit');
    }
    speichern();
    aktualisieren();
  }

  // Erste Berührung irgendwo startet die Musik, falls der Browser Autoplay blockiert hat
  function ersteBeruehrung(e) {
    if (!an || ohneSong || versteckt || !audio.paused) return weg();
    if (e.target.closest && e.target.closest(STEUERUNG)) return;
    spielen();
  }
  const lauschen = () => STARTER.forEach((t) => window.addEventListener(t, ersteBeruehrung, true));
  const weg = () => STARTER.forEach((t) => window.removeEventListener(t, ersteBeruehrung, true));

  document.addEventListener('click', (e) => {
    const ziel = e.target.closest ? e.target : null;
    if (!ziel) return;
    if (ziel.closest('[data-flieger-weg]')) return verstecken(true);
    if (ziel.closest('[data-flieger-schalter]')) return verstecken(!versteckt);
    // Beide Platten schalten um: Läuft Musik, hält ein Tipp alles an, sonst startet er sie.
    if (ziel.closest('[data-flieger],[data-platte]')) {
      dreht() ? anhalten() : abspielen();
    }
  });

  function messen() {
    if (!flieger) return;
    const g = flieger.offsetWidth || 56;
    masse = {
      g,
      bx: Math.max(0, document.documentElement.clientWidth - g),
      by: Math.max(0, window.innerHeight - g),
    };
  }

  function parken() {
    x = Math.max(0, masse.bx - RAND);
    y = Math.max(0, masse.by - RAND);
  }

  function startposition() {
    if (typeof dauerhaft.fx === 'number' && typeof dauerhaft.fy === 'number') {
      x = dauerhaft.fx * masse.bx;
      y = dauerhaft.fy * masse.by;
    } else {
      x = Math.random() * masse.bx;
      y = Math.random() * masse.by * 0.4;
    }
    if (sitzung.vx && sitzung.vy) {
      vx = sitzung.vx;
      vy = sitzung.vy;
    } else {
      const tempo = Math.min(140, Math.max(70, document.documentElement.clientWidth * 0.1));
      const richtung = ((25 + Math.random() * 40) * Math.PI) / 180;
      vx = tempo * Math.cos(richtung) * (Math.random() < 0.5 ? -1 : 1);
      vy = tempo * Math.sin(richtung);
    }
    if (geparkt()) parken();
  }

  function bewegen(dt) {
    x += vx * dt;
    y += vy * dt;
    if (x <= 0) { x = 0; vx = Math.abs(vx); } else if (x >= masse.bx) { x = masse.bx; vx = -Math.abs(vx); }
    if (y <= 0) { y = 0; vy = Math.abs(vy); } else if (y >= masse.by) { y = masse.by; vy = -Math.abs(vy); }
  }

  function zeichnen() {
    if (flieger && !flieger.hidden) {
      x = Math.min(Math.max(0, x), masse.bx);
      y = Math.min(Math.max(0, y), masse.by);
      flieger.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    }
    // „Ausblenden“ links neben der stehenden Platte, ohne Platz dort rechts davon
    if (wegKnopf && !wegKnopf.hidden) {
      const b = wegKnopf.offsetWidth;
      const h = wegKnopf.offsetHeight;
      const breite = document.documentElement.clientWidth;
      const px = x - b - 10 >= 8 ? x - b - 10 : Math.min(x + masse.g + 10, breite - b - 8);
      const py = Math.min(Math.max(8, y + (masse.g - h) / 2), window.innerHeight - h - 8);
      wegKnopf.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`;
    }
    const r = `rotate(${winkel.toFixed(2)}deg)`;
    scheiben.forEach((s) => (s.style.transform = r));
  }

  function schritt(jetzt) {
    const dt = Math.min(0.05, Math.max(0, (jetzt - letzt) / 1000));
    letzt = jetzt;
    const drehen = !reduziert.matches && dreht();
    const fliegen = !geparkt() && an && sichtbar();
    if (drehen) winkel = (winkel + GRAD_PRO_SEKUNDE * dt) % 360;
    if (fliegen) bewegen(dt);
    zeichnen();
    raf = drehen || fliegen ? requestAnimationFrame(schritt) : 0;
  }

  function wecken() {
    if (raf) return;
    letzt = performance.now();
    raf = requestAnimationFrame(schritt);
  }

  function aktualisieren() {
    const d = dreht();
    platten.forEach((b) => b.setAttribute('aria-label', d ? 'Song anhalten' : 'Song abspielen'));
    texte.forEach((t) => (t.textContent = !ohneSong && d ? `Läuft: ${titel}` : t.dataset.aus));
    if (flieger) {
      flieger.hidden = !sichtbar();
      flieger.setAttribute('aria-label', an ? 'Platte und Musik anhalten' : 'Platte und Musik starten');
      flieger.classList.toggle('steht', !an);
    }
    if (wegKnopf) wegKnopf.hidden = !(sichtbar() && positioniert && !an);
    schalter.forEach((s) => {
      s.hidden = ohneSong || !flieger;
      s.textContent = versteckt ? 'Fliegende Platte zeigen' : 'Fliegende Platte ausblenden';
    });
    zeichnen();
    wecken();
  }

  function speichern() {
    if (ohneSong) return;
    const pos = flieger && positioniert && !geparkt()
      ? { fx: masse.bx ? x / masse.bx : 0, fy: masse.by ? y / masse.by : 0 }
      : { fx: dauerhaft.fx, fy: dauerhaft.fy };
    Object.assign(dauerhaft, { an, versteckt }, pos);
    schreiben('localStorage', dauerhaft);
    schreiben('sessionStorage', { zeit: audio.currentTime, winkel, vx, vy });
  }

  function seiteGewechselt() {
    elementeSuchen();
    einrichten();
    if (flieger) flieger.hidden = !sichtbar();
    if (flieger && sichtbar() && !positioniert) {
      messen();
      startposition();
      positioniert = true;
      flieger.classList.add('bereit');
    }
    if (geparkt()) parken();
    aktualisieren();
  }

  function versuchen() {
    if (ohneSong || !an || !flieger || versteckt) return;
    lauschen();
    spielen();
  }

  window.addEventListener('resize', () => {
    const alt = { ...masse };
    messen();
    if (geparkt()) parken();
    else if (alt.bx && alt.by) {
      x = (x / alt.bx) * masse.bx;
      y = (y / alt.by) * masse.by;
    }
    zeichnen();
  });
  reduziert.addEventListener('change', () => {
    if (geparkt()) parken();
    aktualisieren();
  });
  window.addEventListener('pagehide', speichern);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') speichern();
  });
  document.addEventListener('astro:page-load', seiteGewechselt);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', seiteGewechselt, { once: true });
  } else {
    seiteGewechselt();
  }
  if (document.readyState === 'complete') versuchen();
  else window.addEventListener('load', versuchen, { once: true });
})();
