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
  'Email',
];
const allThemeConfigs = [
  'backgroundUrl',
  'backgroundColor',
  'secondaryColor',
  'thirdColor',
  'foregroundColor',
];

const form = document.querySelector("form[action='/edit']");

const aboutTextarea = document.querySelector("textarea[name='about']");
const lanyardIdInput = document.querySelector("input[name='lanyard-id']");
const themeSelect = document.querySelector("select[name='theme']");
const addedLinksBox = document.querySelector('div.box.links');
const themeConfigsBox = document.querySelector('div.box.theme-configs');

const newLinkButton = document.querySelector("button[class='new-link']");
const newThemeConfigButton = document.querySelector("button[class='new-config']");
const logoutButton = document.querySelector("button[class='logout']");
const submitButton = document.querySelector("button[type='submit']");

window.onload = async () => {
  const token = localStorage.getItem('token');
  if (!token) location.href = '/sign-in';

  const userData = await getUserData(token);
  if (userData) {
    aboutTextarea.textContent = userData.about ?? '';
    lanyardIdInput.value = userData.lanyardId ?? '';
    themeSelect.value = userData.theme ?? 'Classic';

    for (const [key, value] of Object.entries(userData.themeOptions)) {
      themeConfigsBox.appendChild(createThemeConfig(key, value));
    }

    for (const link of userData.links) {
      addedLinksBox.appendChild(createLink(link.title, link.url, link.display));
    }
  } else {
    createToast("User doesn't exist.");
  }
};

newLinkButton.onclick = () => {
  if (addedLinksBox.childElementCount > 16)
    return createToast('Exceeded maximum 16 display limit.');
  addedLinksBox.appendChild(createLink());
};

newThemeConfigButton.onclick = () => {
  if (themeConfigsBox.childElementCount > allThemeConfigs.length)
    return createToast(`Exceeded maximum ${allThemeConfigs.length} config limit.`);
  themeConfigsBox.appendChild(createThemeConfig());
};

logoutButton.onclick = () => {
  localStorage.clear();
  window.location.href = '/';
};

submitButton.onclick = submitButton.onsubmit = async (b) => {
  b.preventDefault();

  if (!form.reportValidity()) return;

  submitButton.setAttribute('disabled', '');

  const links = [];
  for (const element of addedLinksBox.childNodes) {
    const linkNodes = element.childNodes;

    links.push({
      display: linkNodes[0].value,
      title: linkNodes[1].value,
      url: `${linkNodes[0].value === 'Email' ? 'mailto:' : ''}${linkNodes[2].value}`,
    });
  }

  const keyValueConfig = {};
  for (const element of themeConfigsBox.childNodes) {
    const linkNodes = element.childNodes;

    keyValueConfig[linkNodes[0].value] = linkNodes[1].value;
  }

  const data = {
    about: aboutTextarea.value,
    lanyardId: lanyardIdInput.value,
    theme: themeSelect.value,
    themeOptions: keyValueConfig,
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
  } else {
    createToast('Settings saved.');
    submitButton.removeAttribute('disabled');
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
    option.value = option.textContent = d;

    if (d === selection) option.setAttribute('selected', '');

    linkDivSelect.appendChild(option);
  });

  linkDiv.className = 'link';
  linkDivSelect.name = 'display';

  linkDivDisplayName.name = 'display-title';
  linkDivDisplayName.type = 'text';
  linkDivDisplayName.placeholder = 'Display title';
  linkDivDisplayName.value = displayName;
  linkDivDisplayName.maxLength = 16;
  linkDivDisplayName.setAttribute('required', '');

  linkDivDisplayURL.name = 'display-url';
  linkDivDisplayURL.value = linkDivSelect.value === 'Email' ? displayURL.slice(7) : displayURL;
  linkDivDisplayURL.maxLength = 128;
  linkDivDisplayURL.setAttribute('required', '');

  (linkDivSelect.onchange = () => {
    if (linkDivSelect.value === 'Email') {
      linkDivDisplayURL.type = 'email';
      linkDivDisplayURL.removeAttribute('pattern');
      linkDivDisplayURL.removeAttribute('title');
      linkDivDisplayURL.placeholder = 'Display Email';
    } else {
      linkDivDisplayURL.type = 'url';
      linkDivDisplayURL.pattern = 'https?://.*';
      linkDivDisplayURL.title = "Link must start with 'https://' or 'http://'";
      linkDivDisplayURL.placeholder = 'Display URL';
    }
  })();

  deleteButton.className = 'delete-link';
  deleteButton.textContent = '✕';
  deleteButton.onclick = ({ target }) => target.parentNode.remove();

  linkDiv.append(linkDivSelect, linkDivDisplayName, linkDivDisplayURL, deleteButton);

  return linkDiv;
}

function createThemeConfig(configKey = '', configValue = '') {
  if (configKey && typeof configKey !== 'string')
    return console.error('Config key must be a string.');
  if (configValue && typeof configValue !== 'string')
    return console.error('Config value must be a string.');

  const configDiv = document.createElement('div');
  const configDivSelect = document.createElement('select');
  const configDivValue = document.createElement('input');
  const deleteButton = document.createElement('button');

  allThemeConfigs.forEach((t) => {
    const option = document.createElement('option');
    option.value = option.textContent = t;

    if (t === configKey) option.setAttribute('selected', '');

    configDivSelect.appendChild(option);
  });

  configDiv.className = 'config'
  configDivSelect.name = 'config-keys'

  configDivValue.name = 'config-value';
  configDivValue.type = 'text';
  configDivValue.placeholder = 'Config Value';
  configDivValue.value = configValue;
  configDivValue.maxLength = 512;
  configDivValue.setAttribute('required', '');

  deleteButton.className = 'delete-config';
  deleteButton.textContent = '✕';
  deleteButton.onclick = ({ target }) => target.parentNode.remove();

  configDiv.append(configDivSelect, configDivValue, deleteButton);

  return configDiv;
}
