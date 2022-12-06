import { createToast } from '/static/utils.js';

const form = document.querySelector('form[action="/api/auth"]');
const submitButton = document.querySelector("button[type='submit']");

window.onload = () => {
  if (localStorage.getItem('token')) location.href = '/edit';
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
    localStorage.setItem('token', await response.text());
    location.href = '/edit';
  }
};
