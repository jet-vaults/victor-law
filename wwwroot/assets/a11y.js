/* JetVaults accessibility widget for victor-law.co.il
   Self-contained: injects its own CSS + markup. Buttons match the site's
   accessibility statement (/accessibility/). State persists in localStorage. */
(function () {
  'use strict';

  var KEY = 'victor-law-a11y';
  var GOLD = '#E8C284';
  var NAVY = '#29303D';

  var css = [
    '#jv-a11y{position:fixed;bottom:18px;right:18px;z-index:99999;font-family:"Heebo",Arial,sans-serif;direction:rtl}',
    '#jv-a11y-toggle{display:grid;place-items:center;width:52px;height:52px;border:none;border-radius:50%;background:' + GOLD + ';color:' + NAVY + ';cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35);transition:filter .2s ease,box-shadow .2s ease}',
    '#jv-a11y-toggle:hover{filter:brightness(1.08);box-shadow:0 12px 30px rgba(0,0,0,.45)}',
    '#jv-a11y-toggle svg{width:30px;height:30px}',
    '#jv-a11y-panel{position:absolute;bottom:64px;right:0;width:304px;max-width:calc(100vw - 36px);background:#fff;border:1px solid rgba(41,48,61,.15);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.35);padding:18px;box-sizing:border-box}',
    '#jv-a11y-panel *{box-sizing:border-box}',
    '#jv-a11y-panel .jv-a11y-title{font-weight:700;color:' + NAVY + ';margin:0 0 12px;font-size:16px}',
    '#jv-a11y-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '#jv-a11y-grid button{display:flex;flex-direction:column;align-items:center;gap:4px;font-family:inherit;font-size:13px;font-weight:500;color:' + NAVY + ';background:#f5f1e8;border:1px solid rgba(41,48,61,.15);border-radius:10px;padding:10px 6px;cursor:pointer;transition:background-color .15s ease,border-color .15s ease,color .15s ease}',
    '#jv-a11y-grid button:hover{border-color:' + NAVY + '}',
    '#jv-a11y-grid button[aria-pressed="true"]{background:' + NAVY + ';border-color:' + NAVY + ';color:#fff}',
    '#jv-a11y-grid button[data-a11y="reset"]{grid-column:1/-1;flex-direction:row;justify-content:center}',
    '#jv-a11y-grid .jv-ico{font-size:17px;line-height:1}',
    '#jv-a11y-statement{display:block;margin-top:12px;text-align:center;font-size:14px;font-weight:700;color:' + NAVY + ';text-decoration:underline}',

    /* --- effect modes (classes on <html>) --- */
    /* text size: zoom keeps px-based Elementor layout scaling correctly */
    'html.jv-a11y-fontup body{zoom:1.2}',
    'html.jv-a11y-fontdown body{zoom:0.88}',

    /* visual filters: applied to page containers, never to body, so
       fixed/sticky elements keep their viewport anchoring */
    'html.jv-a11y-gray{--jv-filter:grayscale(1)}',
    'html.jv-a11y-contrast{--jv-filter:contrast(1.35)}',
    'html.jv-a11y-invert{--jv-filter:invert(1) hue-rotate(180deg)}',
    'html[class*="jv-a11y-"] #site-header,html[class*="jv-a11y-"] .elementor>.e-parent:not(:has(.elementor-sticky)),html[class*="jv-a11y-"] .elementor-sticky,html[class*="jv-a11y-"] main.page{filter:var(--jv-filter,none)}',

    /* light background */
    'html.jv-a11y-light #site-header,html.jv-a11y-light .elementor>.e-parent,html.jv-a11y-light .e-con,html.jv-a11y-light main.page,html.jv-a11y-light body{background-color:#fff!important;background-image:none!important}',
    'html.jv-a11y-light .elementor h1,html.jv-a11y-light .elementor h2,html.jv-a11y-light .elementor h3,html.jv-a11y-light .elementor p,html.jv-a11y-light .elementor span,html.jv-a11y-light .elementor li,html.jv-a11y-light .elementor a,html.jv-a11y-light main.page h1,html.jv-a11y-light main.page h2,html.jv-a11y-light main.page p,html.jv-a11y-light main.page li,html.jv-a11y-light main.page a{color:#111!important}',

    /* highlight links */
    'html.jv-a11y-links a{text-decoration:underline!important;text-underline-offset:2px}',

    /* readable font */
    'html.jv-a11y-readable body *:not(.jv-ico){font-family:Arial,Helvetica,sans-serif!important;letter-spacing:.02em}'
  ].join('\n');

  var buttons = [
    { key: 'fontup',   ico: 'א+', label: 'הגדל טקסט' },
    { key: 'fontdown', ico: 'א-', label: 'הקטן טקסט' },
    { key: 'gray',     ico: '▦',  label: 'גווני אפור' },
    { key: 'contrast', ico: '◐',  label: 'ניגודיות גבוהה' },
    { key: 'invert',   ico: '◑',  label: 'ניגודיות הפוכה' },
    { key: 'light',    ico: '☀',  label: 'רקע בהיר' },
    { key: 'links',    ico: '⎁',  label: 'הדגשת קישורים' },
    { key: 'readable', ico: 'ק',  label: 'פונט קריא' },
    { key: 'reset',    ico: '↺',  label: 'איפוס' }
  ];

  /* modes that cannot combine */
  var groups = [
    ['fontup', 'fontdown'],
    ['gray', 'contrast', 'invert', 'light']
  ];

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var root = document.createElement('div');
  root.id = 'jv-a11y';
  var btnHtml = buttons.map(function (b) {
    return '<button type="button" data-a11y="' + b.key + '" aria-pressed="false">' +
      '<span class="jv-ico" aria-hidden="true">' + b.ico + '</span><span>' + b.label + '</span></button>';
  }).join('');
  root.innerHTML =
    '<button id="jv-a11y-toggle" type="button" aria-expanded="false" aria-controls="jv-a11y-panel" aria-label="תפריט נגישות">' +
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>' +
      '</svg>' +
    '</button>' +
    '<div id="jv-a11y-panel" role="dialog" aria-label="הגדרות נגישות" hidden>' +
      '<p class="jv-a11y-title">הגדרות נגישות</p>' +
      '<div id="jv-a11y-grid">' + btnHtml + '</div>' +
      '<a id="jv-a11y-statement" href="/accessibility/">להצהרת הנגישות</a>' +
    '</div>';
  document.body.appendChild(root);

  var toggle = document.getElementById('jv-a11y-toggle');
  var panel = document.getElementById('jv-a11y-panel');

  var state = {};
  try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { state = {}; }

  function applyState() {
    buttons.forEach(function (b) {
      if (b.key === 'reset') return;
      var on = !!state[b.key];
      document.documentElement.classList.toggle('jv-a11y-' + b.key, on);
      var btn = root.querySelector('[data-a11y="' + b.key + '"]');
      if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* private mode */ }
  }

  function openPanel(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', function () { openPanel(panel.hidden); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) { openPanel(false); toggle.focus(); }
  });

  document.addEventListener('click', function (e) {
    if (!panel.hidden && !root.contains(e.target)) openPanel(false);
  });

  root.querySelectorAll('[data-a11y]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-a11y');
      if (key === 'reset') { state = {}; applyState(); return; }
      var turningOn = !state[key];
      if (turningOn) {
        groups.forEach(function (group) {
          if (group.indexOf(key) !== -1) {
            group.forEach(function (k) { state[k] = false; });
          }
        });
      }
      state[key] = turningOn;
      applyState();
    });
  });

  applyState();
})();
