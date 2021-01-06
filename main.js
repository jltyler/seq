import ui from './ui.js';

const initialize = () => {
    console.log('Initializing...');
    ui.initialize();
};

window.addEventListener('load', initialize);