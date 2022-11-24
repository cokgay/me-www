import { createToast } from '/static/utils.js';

const allDisplays = [
  'ArtStation',
  'DeviantArt',
  'Discord',
  'Dribbble',
  'Facebook',
  'GitHub',
  'Instagram',
  'Patreon',
  'PayPal',
  'Reddit',
  'SoundCloud',
  'Spotify',
  'Steam',
  'TikTok',
  'Twitch',
  'Twitter',
  'Website',
  'Youtube',
];

const form = document.querySelector("form[action='/edit']");

const aboutTextarea = document.querySelector("textarea[name='about']");
const lanyardIdInput = document.querySelector("input[name='lanyard-id']");
const themeSelect = document.querySelector("select[name='theme']");
const addedLinksBox = document.querySelector('div.box.links');

const newLinkButton = document.querySelector("button[class='new-link']");
const logoutButton = document.querySelector("button[class='logout']");
const submitButton = document.querySelector("button[type='submit']");

window.onload = async () => {
  const token = localStorage.getItem('token');
  if (!token) location.href = '/sign-in';

  const userData = await getUserData(token);
  if (userData) {
    aboutTextarea.textContent = userData.about ?? '';
    lanyardIdInput.value = userData.lanyardId ?? '';
    themeSelect.value = userData.theme ?? 'ArtBox';

    userData.links.forEach((link) => {
      addedLinksBox.appendChild(createLink(link.title, link.url, link.display));
    });
  } else {
    createToast("User doesn't exist.");
  }
};

newLinkButton.onclick = () => {
  if (addedLinksBox.childElementCount > 16)
    return createToast('Exceeded maximum 16 display limit.');
  addedLinksBox.appendChild(createLink());
};

logoutButton.onclick = () => {
  localStorage.clear();
  window.location.href = '/';
};

submitButton.onclick = submitButton.onsubmit = async (b) => {
  b.preventDefault();

  if (!form.reportValidity()) return;

  const aboutMe = document.querySelector('textarea[name="about"');
  const lanyardId = document.querySelector('input[name="lanyard-id"');
  const theme = document.querySelector('select[name="theme"');
  const linksBox = document.querySelector('div.box.links');

  const links = [];
  for (const element of linksBox.childNodes) {
    const linkNodes = element.childNodes;

    links.push({
      display: linkNodes[0].value,
      title: linkNodes[1].value,
      url: linkNodes[2].value,
    });
  }

  const data = {
    about: aboutMe.value,
    lanyardId: lanyardId.value,
    theme: theme.value,
    links,
  };

  const result = await fetch(form.action, {
    method: 'PATCH',
    body: JSON.stringify({
      token: localStorage.getItem('token'),
      update: data,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (result.status !== 200) {
    createToast(await result.text());
  }
};

async function getUserData(token) {
  if (!token || !token.length) return console.log('Enter a token.');
  else if (typeof token !== 'string')
    return createToast('Token value is broken. Please clear website data and try again.');

  const response = await fetch(`/about?token=${token}`, {
    method: 'GET',
  });

  if (response.status !== 200) {
    localStorage.clear();
    location.href = '/sign-in';
  }

  return await response.json();
}

function createLink(displayName = '', displayURL = '', selection = 'Website') {
  if (displayName && typeof displayName !== 'string')
    return console.error('Display name must be a string.');
  if (displayURL && typeof displayURL !== 'string')
    return console.error('Display URL must be a string.');

  const linkDiv = document.createElement('div');
  const linkDivSelect = document.createElement('select');
  const linkDivDisplayName = document.createElement('input');
  const linkDivDisplayURL = document.createElement('input');
  const deleteButton = document.createElement('button');

  allDisplays.forEach((d) => {
    const option = document.createElement('option');
    option.value = d;
    option.textContent = d;

    if (d === selection) option.setAttribute('selected', '');

    linkDivSelect.appendChild(option);
  });

  linkDiv.className = 'link';
  linkDivSelect.name = 'display';

  linkDivDisplayName.name = 'display-title';
  linkDivDisplayName.type = 'text';
  linkDivDisplayName.placeholder = 'Display title';
  linkDivDisplayName.value = displayName.length ? displayName : selection;
  linkDivDisplayName.maxLength = 16;
  linkDivDisplayName.setAttribute('required', '');

  linkDivDisplayURL.name = 'display-url';
  linkDivDisplayURL.type = 'url';
  linkDivDisplayURL.placeholder = 'Display URL';
  linkDivDisplayURL.value = displayURL;
  linkDivDisplayURL.maxLength = 128;
  linkDivDisplayURL.pattern = 'https?://.*';
  linkDivDisplayURL.title = "Link must start with 'https://' or 'http://'";
  linkDivDisplayURL.setAttribute('required', '');

  deleteButton.className = 'delete-link';
  deleteButton.textContent = '✕';
  deleteButton.onclick = ({ target }) => target.parentNode.remove();

  linkDiv.append(linkDivSelect, linkDivDisplayName, linkDivDisplayURL, deleteButton);

  return linkDiv;
}
