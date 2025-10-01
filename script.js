let players = []; // เก็บข้อมูลผู้เล่น
let history = []; // เก็บประวัติสถานะเครดิตของผู้เล่นแต่ละครั้งที่มีการกดเก็บเงิน

// จำกัดจำนวนประวัติที่เก็บไว้เพื่อไม่ให้เปลืองหน่วยความจำมากเกินไป
const MAX_HISTORY = 20; 

/**
 * บันทึกสถานะเครดิตปัจจุบันลงในประวัติ
 */
function saveStateToHistory() {
    // โคลนอาร์เรย์ players และ credit เพื่อไม่ให้ข้อมูลอ้างอิงกัน
    const currentState = players.map(player => ({
        id: player.id,
        name: player.name,
        credit: player.credit 
    }));
    
    history.push(currentState);

    // จำกัดจำนวนประวัติ
    if (history.length > MAX_HISTORY) {
        history.shift(); // ลบสถานะที่เก่าที่สุดออก
    }
    
    updateUndoButtonState();
}

/**
 * ย้อนกลับไปยังสถานะก่อนหน้า
 */
function undoLastAction() {
    if (history.length > 1) {
        // ลบสถานะปัจจุบันทิ้ง (ซึ่งเป็นสถานะก่อนหน้าที่จะกด undo)
        history.pop(); 
        
        // ดึงสถานะที่เหลือล่าสุดใน history มาใช้ (คือสถานะก่อนการกระทำล่าสุด)
        const previousState = history[history.length - 1];
        
        // อัปเดตอาร์เรย์ players ด้วยสถานะย้อนหลัง
        players = previousState.map(state => ({
            id: state.id,
            name: state.name,
            credit: state.credit
        }));

        // อัปเดตการแสดงผล
        renderPlayers(); 
        console.log("ย้อนกลับการกระทำล่าสุดแล้ว");

    } else if (history.length === 1) {
        // หากเหลือสถานะเดียว ให้กลับไปที่สถานะเริ่มต้น และล้าง history 
        initializeGame(false); // ใช้ false เพื่อไม่ให้บันทึกสถานะเริ่มต้นซ้ำ
    } else {
        alert("ไม่สามารถย้อนกลับได้อีก");
    }
    
    updateUndoButtonState();
}

/**
 * อัปเดตสถานะปุ่ม Undo (เปิด/ปิด)
 */
function updateUndoButtonState() {
    const undoButton = document.getElementById('undoButton');
    // เปิดใช้งานปุ่มถ้ามีประวัติที่สามารถย้อนกลับได้มากกว่า 1 สถานะ 
    // (history[0] คือสถานะเริ่มต้น)
    undoButton.disabled = history.length <= 1;
}

/**
 * สร้างช่อง Input สำหรับตั้งชื่อผู้เล่น ตามจำนวนผู้เล่นที่กำหนด
 */
function createNameInputs() {
    const numPlayers = parseInt(document.getElementById('numPlayers').value) || 0;
    const namesInputDiv = document.getElementById('playerNamesInput');
    namesInputDiv.innerHTML = '';

    if (numPlayers < 3 || numPlayers > 5) {
        namesInputDiv.innerHTML = '<p style="color: red;">กรุณากำหนดจำนวนผู้เล่นระหว่าง 3 ถึง 5 คน</p>';
        return;
    }

    for (let i = 0; i < numPlayers; i++) {
        const div = document.createElement('div');
        div.innerHTML = `
            <label for="pName${i}">ชื่อผู้เล่น ${i + 1}:</label>
            <input type="text" id="pName${i}" value="ผู้เล่น ${i + 1}" required>
        `;
        namesInputDiv.appendChild(div);
    }
}

/**
 * เริ่มต้น/ตั้งค่าเกมใหม่
 * @param {boolean} resetHistory - กำหนดว่าควรล้างประวัติหรือไม่ (ควรเป็น true เมื่อกดปุ่ม "เริ่มเกม")
 */
function initializeGame(resetHistory = true) {
    // ดึงค่าตั้งต้นและจำนวนผู้เล่น
    const initialAmount = parseInt(document.getElementById('initialAmount').value) || 0;
    const numPlayers = parseInt(document.getElementById('numPlayers').value) || 3;
    
    if (numPlayers < 3 || numPlayers > 5) {
        alert("กรุณากำหนดจำนวนผู้เล่นระหว่าง 3 ถึง 5 คนให้ถูกต้อง");
        return;
    }

    if (resetHistory) {
        // ตั้งค่าข้อมูลผู้เล่นใหม่ทั้งหมด
        history = []; 
        players = [];
        for (let i = 0; i < numPlayers; i++) {
            // ดึงชื่อจากช่อง Input
            const playerNameInput = document.getElementById(`pName${i}`);
            const name = playerNameInput ? playerNameInput.value : `ผู้เล่น ${i + 1}`;

            players.push({
                id: i,
                name: name,
                credit: initialAmount
            });
        }
    }
    
    // บันทึกสถานะเริ่มต้น
    saveStateToHistory();

    // แสดงผล
    renderPlayers();
    renderActionButtons();
}

/**
 * แสดงเครดิตของผู้เล่นในส่วน 'game-area'
 */
function renderPlayers() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = ''; // เคลียร์ของเก่า

    players.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        
        const creditColor = player.credit < 0 ? '#dc3545' : '#007bff';

        card.innerHTML = `
            <div class="player-name">${player.name}</div>
            <div class="player-credit" id="credit-${player.id}" style="color: ${creditColor};">${Math.round(player.credit).toLocaleString()} ฿</div>
        `;
        gameArea.appendChild(card);
    });
}

/**
 * สร้างปุ่มกดเก็บเงินในส่วน 'action-area'
 */
function renderActionButtons() {
    const actionArea = document.getElementById('action-area');
    let buttonDiv = actionArea.querySelector('.action-buttons');

    if (!buttonDiv) {
        buttonDiv = document.createElement('div');
        buttonDiv.className = 'action-buttons';
        actionArea.appendChild(buttonDiv);
    }
    
    buttonDiv.innerHTML = ''; // เคลียร์ปุ่มเก่า

    players.forEach(player => {
        const button = document.createElement('button');
        button.textContent = `เก็บเงินให้ ${player.name}`;
        button.onclick = () => collectMoney(player.id); 
        buttonDiv.appendChild(button);
    });
    
    // อัปเดตสถานะปุ่ม Undo ด้วย
    updateUndoButtonState(); 
}

/**
 * จัดการตรรกะการเก็บเงิน
 * @param {number} winnerId - ID ของผู้เล่นที่ถูกกดปุ่ม (ผู้ที่ได้รับเงิน)
 */
function collectMoney(winnerId) {
    const collectAmount = parseInt(document.getElementById('collectAmount').value) || 0;
    
    if (collectAmount <= 0) {
        alert("กรุณากำหนดจำนวนเงินที่เก็บต่อครั้งให้ถูกต้อง");
        return;
    }

    const numOthers = players.length - 1;
    if (numOthers <= 0) return; 

    // ผู้ชนะได้รับเงินรวมจากทุกคน
    const winnerReceiveAmount = collectAmount * numOthers; 

    // อัปเดตเครดิต
    players.forEach(player => {
        let updateAmount = 0;
        
        if (player.id === winnerId) {
            updateAmount = winnerReceiveAmount;
        } else {
            updateAmount = -collectAmount; 
        }

        player.credit += updateAmount;
        
        // อัปเดตการแสดงผลเครดิต
        const creditDisplay = document.getElementById(`credit-${player.id}`);
        // ใช้ Math.round() เพื่อปัดเศษทศนิยม
        creditDisplay.textContent = `${Math.round(player.credit).toLocaleString()} ฿`;
        
        // อัปเดตสีตามสถานะเครดิต
        if (player.credit < 0) {
             creditDisplay.style.color = '#dc3545';
        } else {
             creditDisplay.style.color = '#007bff';
        }
    });

    // **บันทึกสถานะใหม่เข้า History**
    saveStateToHistory(); 
    
    console.log(`เงินถูกเก็บ: ${collectAmount} บาท/คน. ${players[winnerId].name} ได้รับรวม ${winnerReceiveAmount} บาท`);
}

// เมื่อโหลดหน้าเว็บ: สร้างช่องกรอกชื่อเริ่มต้น และเริ่มเกม
window.onload = () => {
    createNameInputs(); 
    initializeGame();
};