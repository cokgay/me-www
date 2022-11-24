import { createToast } from '/static/utils.js';

const form = document.querySelector('form[action="/sign-up"]');
const submitButton = document.querySelector("button[type='submit']");
const captcha = document.querySelector('div.cf-turnstile');

window.onload = () => {
  if (localStorage.getItem('token')) location.href = '/edit';

  turnstile.render(captcha, {
    sitekey: '0x4AAAAAAABWHAjOZeGegq3I',
    callback: () => (submitButton.disabled = false),
  });
};

submitButton.onsubmit = submitButton.onclick = async (b) => {
  b.preventDefault();

  if (!form.reportValidity()) return;

  const response = await fetch(form.action, {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(new FormData(form))),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (response.status !== 200) {
    createToast(await response.text());
  } else {
    if (loginDirectlyCheckbox.checked) {
      localStorage.setItem('token', response.text);
      location.href = '/edit';
    } else {
      location.href = '/sign-in';
    }
  }
};
