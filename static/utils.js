export const createToast = (text) => {
  if (!text || !text.length) return console.error('Enter toast text to create.');
  else if (typeof text !== 'string') return console.error('Toast text must be a string.');

  const currentToast = document.querySelector('div.box.toast');
  if (currentToast) {
    currentToast.childNodes[0].textContent = text;
  } else {
    const toastDiv = document.createElement('div');
    const errorParagraph = document.createElement('p');
    const closeButton = document.createElement('button');

    errorParagraph.textContent = text;
    closeButton.textContent = '✕';
    closeButton.className = 'close';
    closeButton.onclick = () => toastDiv.remove();

    toastDiv.className = 'box toast';
    toastDiv.append(errorParagraph, closeButton);

    document.getElementById('app').appendChild(toastDiv);
  }
};
