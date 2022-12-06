import { createToast } from '/static/utils.js';

const form = document.querySelector('form[action="/api/create"]');
const submitButton = document.querySelector("button[type='submit']");
const captcha = document.querySelector('div.cf-turnstile');
const loginDirectlyCheckbox = document.querySelector('.loginDirectlyCheckbox > input');

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

  const result = await response.text();

  if (response.status !== 200) {
    createToast(result);
  } else {
    if (loginDirectlyCheckbox.checked) {
      localStorage.setItem('token', result);
      location.href = '/edit';
    } else {
      location.href = '/sign-in';
    }
  }
};
