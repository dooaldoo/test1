let deck = [];
let cover = null;

const ui = {
    inDeck: document.getElementById('inDeck'),
    inCover: document.getElementById('inCover'),
    txtDeck: document.getElementById('txtDeck'),
    txtCover: document.getElementById('txtCover'),
    boxDeck: document.getElementById('boxDeck'),
    boxCover: document.getElementById('boxCover'),
    btn3: document.getElementById('btn3'),
    btn5: document.getElementById('btn5'),
    board: document.getElementById('board')
};

// --- 1. UPLOAD LOGIC ---

ui.inCover.addEventListener('change', (e) => {
    if(e.target.files[0]) {
        cover = URL.createObjectURL(e.target.files[0]);
        ui.txtCover.innerText = "Cover Custom Terpasang";
        ui.boxCover.classList.add('has-file');
    }
});

ui.inDeck.addEventListener('change', (e) => {
    if(e.target.files.length > 0) {
        deck = Array.from(e.target.files).map(f => URL.createObjectURL(f));
        ui.txtDeck.innerText = `${deck.length} Kartu Siap`;
        ui.boxDeck.classList.add('has-file');
        updateButtons();
    }
});

function updateButtons() {
    ui.btn3.disabled = deck.length < 3;
    ui.btn5.disabled = deck.length < 5;
}

// --- 2. GAME LOGIC ---

async function play(count) {
    if(deck.length < count) return;
    
    ui.btn3.disabled = true; ui.btn5.disabled = true;
    ui.board.innerHTML = '';

    // Generate Kartu
    const cards = [];
    for(let i=0; i<count; i++) {
        const c = createCardEl();
        ui.board.appendChild(c);
        cards.push(c);
    }
    
    await wait(50);

    // Hitung Center untuk numpuk
    // Re-calculate rects inside play for responsiveness
    const boardRect = ui.board.getBoundingClientRect();
    const cx = boardRect.width / 2;
    const cy = boardRect.height / 2;

    cards.forEach(c => {
        const r = c.getBoundingClientRect();
        // Relative positioning calculation fix for responsiveness
        const tx = cx - (r.left - boardRect.left + r.width/2);
        const ty = cy - (r.top - boardRect.top + r.height/2);
        
        // Slightly reduced rotation for mobile aesthetic
        const rot = (Math.random() * 8 - 4) + 'deg'; 

        c.style.setProperty('--tx', `${tx}px`);
        c.style.setProperty('--ty', `${ty}px`);
        c.style.setProperty('--rot', rot);
        c.classList.add('stacked');
    });

    // Animasi Kocok
    ui.board.classList.add('shaking');
    await wait(1500);
    ui.board.classList.remove('shaking');

    // Pilih Kartu Acak
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // Sebar dan Isi Gambar
    cards.forEach((c, i) => {
        c.querySelector('.front').innerHTML = `<img src="${selected[i]}">`;
        c.classList.remove('stacked');
    });

    await wait(600);

    // Buka Kartu Otomatis (Sequential)
    cards.forEach((c, i) => {
        // Add touchstart for faster mobile response
        const flipAction = (e) => {
            e.preventDefault(); // Prevent double firing on some devices
            c.classList.toggle('flipped');
        };
        
        c.addEventListener('click', flipAction);
        // Also enable standard click for consistency
        
        setTimeout(() => c.classList.add('flipped'), i * 300);
    });
}

function createCardEl() {
    const div = document.createElement('div');
    div.className = 'card';
    const backContent = cover ? `<img src="${cover}">` : `<div class="pattern">POY</div>`;
    div.innerHTML = `
        <div class="face back">${backContent}</div>
        <div class="face front"></div>
    `;
    return div;
}

// --- 3. RESET FUNCTIONS ---

function clearTable() {
    ui.board.innerHTML = ''; 
    updateButtons(); 
}

function resetAll() {
    ui.board.innerHTML = '';
    deck = [];
    cover = null;
    
    ui.inDeck.value = '';
    ui.inCover.value = '';
    
    ui.txtDeck.innerText = '0 Kartu Dimuat';
    ui.boxDeck.classList.remove('has-file');
    ui.txtCover.innerText = 'Default (Opsional)';
    ui.boxCover.classList.remove('has-file');
    
    ui.btn3.disabled = true;
    ui.btn5.disabled = true;
}

const wait = ms => new Promise(r => setTimeout(r, ms));
