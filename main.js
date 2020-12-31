import ui from './ui.js';

const initialize = () => {
    console.log('Initializing...');
    // const buttons = document.querySelectorAll(".measure li");
    // buttons.forEach(e => {
    //     console.log('e:', e);
    // });
    ui.initialize();
};

window.addEventListener('load', initialize);