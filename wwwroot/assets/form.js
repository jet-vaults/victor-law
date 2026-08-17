/* Contact form handler for victor-law.co.il
   Submits the Elementor-built lead form to Web3Forms (static-site backend). */
(function () {
  'use strict';

  var ACCESS_KEY = '4ed4f1ab-53fe-4812-ab27-d6801cb00c1c';
  var ENDPOINT = 'https://api.web3forms.com/submit';

  function init() {
    var form = document.querySelector('form.elementor-form');
    if (!form) return;

    var button = form.querySelector('button[type="submit"]');
    var buttonText = button ? button.querySelector('.elementor-button-text') : null;
    var defaultLabel = buttonText ? buttonText.textContent : '';

    var status = document.createElement('div');
    status.setAttribute('role', 'status');
    status.style.cssText = 'display:none;margin-top:14px;padding:12px 16px;border-radius:8px;font-size:16px;text-align:center;';
    form.appendChild(status);

    function showStatus(ok, msg) {
      status.style.display = 'block';
      status.style.background = ok ? 'rgba(232,194,132,.18)' : 'rgba(255,99,99,.18)';
      status.style.color = ok ? '#E8C284' : '#ff9d9d';
      status.style.border = '1px solid ' + (ok ? 'rgba(232,194,132,.5)' : 'rgba(255,99,99,.5)');
      status.textContent = msg;
    }

    function setBusy(busy) {
      if (button) button.disabled = busy;
      if (buttonText) buttonText.textContent = busy ? 'שולח...' : defaultLabel;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var payload = {
        access_key: ACCESS_KEY,
        subject: 'פנייה חדשה מהאתר victor-law.co.il',
        from_name: 'victor-law.co.il',
        name: (form.querySelector('#form-field-name') || {}).value || '',
        phone: (form.querySelector('#form-field-field_ee18ad2') || {}).value || '',
        email: (form.querySelector('#form-field-email') || {}).value || '',
        message: (form.querySelector('#form-field-message') || {}).value || ''
      };

      setBusy(true);
      status.style.display = 'none';

      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          return { ok: res.ok && data.success !== false };
        });
      }).then(function (result) {
        setBusy(false);
        if (result.ok) {
          form.reset();
          showStatus(true, 'ההודעה נשלחה בהצלחה! ניצור איתכם קשר בהקדם.');
        } else {
          showStatus(false, 'אירעה שגיאה בשליחה. אנא נסו שוב או צרו קשר טלפוני.');
        }
      }).catch(function () {
        setBusy(false);
        showStatus(false, 'אירעה שגיאה בשליחה. אנא נסו שוב או צרו קשר טלפוני.');
      });
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
