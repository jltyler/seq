import audio from './audio.js';

const initialize = () => {
    console.log('Initializing...');
    const buttons = document.querySelectorAll(".measure li");
    buttons.forEach(e => {
        console.log('e:', e);
    });
    audio.initialize();
};

window.addEventListener('load', initialize);