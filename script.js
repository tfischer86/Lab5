// script.js

const img = new Image(); // used to load image from <input> and draw to canvas
const canvas = document.getElementById('user-image');
const ctx = canvas.getContext('2d');

// buttons
const genButton = document.querySelector('button[type=submit]');
const clearButton = document.querySelector('button[type=reset]');
const narrateButton = document.querySelector('button[type=button]');

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  // TODO

  genButton.disabled = false;
  clearButton.disabled = false;
  narrateButton.disabled = true;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const dims = getDimensions(canvas.width, canvas.height, img.naturalWidth, img.naturalHeight);
  ctx.drawImage(img, dims.startX, dims.startY, dims.width, dims.height);
  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

// image button
const imageInput = document.getElementById('image-input');
imageInput.addEventListener('change', () => {
  let fileReader = new FileReader();
  fileReader.onload = () => { img.src = fileReader.result; };
  fileReader.readAsDataURL(imageInput.files[0]);
  img.alt = imageInput.files[0];
});

// generate form
const memeForm = document.getElementById('generate-meme');
memeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  ctx.font = '48px Impact,Charcoal,sans-serif';
  ctx.fillStyle = 'white';
  ctx.strokeStyle = 'black';
  ctx.textAlign = 'center';

  const topText = memeForm.elements[1].value;
  const bottomText = memeForm.elements[2].value;

  if (topText.length === 0 && bottomText.length === 0) {
    return;
  }

  ctx.fillText(topText, canvas.width / 2, 50);
  ctx.fillText(bottomText, canvas.width / 2, canvas.height - 24);

  ctx.strokeText(topText, canvas.width / 2, 50);
  ctx.strokeText(bottomText, canvas.width / 2, canvas.height - 24);


  genButton.disabled = true;
  narrateButton.disabled = false;
  clearButton.disabled = false;
});

// clear button
clearButton.onclick = function () {
  let topText = document.getElementById('text-top');
  let bottomText = document.getElementById('text-bottom');

  topText.value = '';
  bottomText.value = '';

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  genButton.disabled = false;
  narrateButton.disabled = true;
  clearButton.disabled = true;
}

// volume slider
const volumeSlider = document.querySelector("#volume-group input[type=range]");
const volumeIcon = document.querySelector('#volume-group img');
volumeSlider.addEventListener('input', () => {
  const volumeLevel = volumeSlider.value;

  if (volumeLevel > 66) {
    volumeIcon.src = 'icons/volume-level-3.svg';
    volumeIcon.alt = 'volume-level-3';
  } else if (volumeLevel > 33) {
    volumeIcon.src = 'icons/volume-level-2.svg';
    volumeIcon.alt = 'volume-level-2';
  } else if (volumeLevel > 0) {
    volumeIcon.src = 'icons/volume-level-1.svg';
    volumeIcon.alt = 'volume-level-1';
  } else {
    volumeIcon.src = 'icons/volume-level-0.svg';
    volumeIcon.alt = 'volume-level-0';
  }
});

// read text button
let voices = [];
let voiceSelect = document.querySelector('#voice-selection');

function populateVoiceList() {
  // remove the option saying no voices are available
  voiceSelect.options[0] = null;

  let synth = window.speechSynthesis;
  voices = synth.getVoices();

  for(let i = 0; i < voices.length ; i++) {
    let option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';

    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }

  voiceSelect.disabled = false;
}

populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

narrateButton.onclick = function () {
  let topText = document.getElementById('text-top');
  let bottomText = document.getElementById('text-bottom');

  const utter = new SpeechSynthesisUtterance(topText.value + ', ' + bottomText.value);
  let selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
  for (let i = 0; i < voices.length; i++) {
    if (voices[i].name === selectedOption) {
      utter.voice = voices[i];
    }
  }

  utter.volume = volumeSlider.value / 100;
  window.speechSynthesis.speak(utter);
}

/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
