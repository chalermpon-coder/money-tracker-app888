let players = []; 
let history = []; 
let transactionLog = []; // NEW: อาร์เรย์ใหม่สำหรับเก็บรายการธุรกรรม
const MAX_HISTORY = 20; 

// --- ฟังก์ชันเกี่ยวกับการจัดการ History (Undo) ---

/**
 * บันทึกสถานะเครดิตปัจจุบันลงในประวัติ
 */
function saveStateToHistory() {
    const currentState = players.map(player => ({
        id: player.id,
        name: player.name,
        credit: player.credit 
    }));
    
    history.push(currentState);

    if (history.length > MAX_HISTORY) {
        history.shift(); 
    }
    
    updateUndoButtonState();
}

/**
 * ย้อนกลับไปยังสถานะก่อนหน้า
 */
function undoLastAction() {
    if (history.length > 1) {
        history.pop(); 
        
        // NEW: ลบรายการล่าสุดออกจาก transactionLog ด้วย
        transactionLog.pop();
        
        const previousState = history[history.length - 1];
        
        players = previousState.map(state => ({
            id: state.id,
            name: state.name,
            credit: state.credit
        }));

        renderPlayers(); 
        renderHistoryLog(); // NEW: เรียกแสดง Log ใหม่
        console.log("ย้อนกลับการกระทำล่าสุดแล้ว");

    } else if (history.length === 1) {
        initializeGame(false); 
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
    undoButton.disabled = history.length <= 1;
}

// --- NEW: ฟังก์ชันการจัดการ Log และการแสดงผล ---

/**
 * เพิ่มรายการธุรกรรมใหม่เข้า Log
 * @param {string} type - 'group' หรือ 'manual'
 * @param {string} description - รายละเอียดการทำรายการ
 */
function addTransactionToLog(type, description) {
    const timestamp = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    transactionLog.push({
        type: type === 'manual' ? 'manual-payment' : 'group-collect',
        timestamp: timestamp,
        description: description
    });
    
    renderHistoryLog();
}

/**
 * แสดงรายการธุรกรรมทั้งหมดใน UI
 */
function renderHistoryLog() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    // แสดงรายการย้อนหลัง (รายการล่าสุดอยู่บนสุด)
    for (let i = transactionLog.length - 1; i >= 0; i--) {
        const item = transactionLog[i];
        const li = document.createElement('li');
        
        li.className = item.type;
        li.innerHTML = `
            [${item.timestamp}] ${item.description}
        `;
        
        historyList.appendChild(li);
    }
}


// --- ฟังก์ชันเกี่ยวกับการตั้งค่าและการแสดงผล (ส่วนที่เหลือยังคงเหมือนเดิม) ---

/**
 * สร้างช่อง Input สำหรับตั้งชื่อผู้เล่น
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
 * สร้างเมนู Dropdown ผู้จ่าย/ผู้รับ สำหรับฟังก์ชันจ่ายพิเศษ
 */
function createPaymentSelects() {
    const payerSelect = document.getElementById('payerSelect');
    const payeeSelect = document.getElementById('payeeSelect');
    
    // เคลียร์รายการเดิม
    payerSelect.innerHTML = '';
    payeeSelect.innerHTML = '';

    players.forEach(player => {
        // สร้าง Option สำหรับผู้จ่าย
        const payerOption = document.createElement('option');
        payerOption.value = player.id;
        payerOption.textContent = player.name;
        payerSelect.appendChild(payerOption);

        // สร้าง Option สำหรับผู้รับ
        const payeeOption = document.createElement('option');
        payeeOption.value = player.id;
        payeeOption.textContent = player.name;
        payeeSelect.appendChild(payeeOption);
    });
}


/**
 * เริ่มต้น/ตั้งค่าเกมใหม่
 */
function initializeGame(resetHistory = true) {
    const initialAmount = parseInt(document.getElementById('initialAmount').value) || 0;
    const numPlayers = parseInt(document.getElementById('numPlayers').value) || 3;
    
    if (numPlayers < 3 || numPlayers > 5) {
        alert("กรุณากำหนดจำนวนผู้เล่นระหว่าง 3 ถึง 5 คนให้ถูกต้อง");
        return;
    }

    if (resetHistory) {
        history = []; 
        transactionLog = []; // NEW: ล้าง Log ด้วย
        players = [];
        for (let i = 0; i < numPlayers; i++) {
            const playerNameInput = document.getElementById(`pName${i}`);
            const name = playerNameInput ? playerNameInput.value : `ผู้เล่น ${i + 1}`;

            players.push({
                id: i,
                name: name,
                credit: initialAmount
            });
        }
    }
    
    saveStateToHistory();
    renderPlayers();
    renderActionButtons();
    createPaymentSelects(); 
    renderHistoryLog(); // NEW: แสดง Log หลังการเริ่มต้น
}

/**
 * แสดงเครดิตของผู้เล่นในส่วน 'game-area'
 */
function renderPlayers() {
    const gameArea = document.getElementById('game-area');
    gameArea.innerHTML = ''; 

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
    
    buttonDiv.innerHTML = ''; 

    players.forEach(player => {
        const button = document.createElement('button');
        button.textContent = `เก็บเงินให้ ${player.name}`;
        button.onclick = () => collectMoney(player.id); 
        buttonDiv.appendChild(button);
    });
    
    updateUndoButtonState(); 
}

// --- ฟังก์ชันสำหรับตรรกะของเกม ---

/**
 * จัดการตรรกะการเก็บเงินแบบกลุ่ม
 */
function collectMoney(winnerId) {
    const collectAmount = parseInt(document.getElementById('collectAmount').value) || 0;
    
    if (collectAmount <= 0) {
        alert("กรุณากำหนดจำนวนเงินที่เก็บต่อครั้งให้ถูกต้อง");
        return;
    }

    const numOthers = players.length - 1;
    if (numOthers <= 0) return; 

    const winnerReceiveAmount = collectAmount * numOthers; 
    const winnerName = players.find(p => p.id === winnerId).name;
    let payersList = [];

    // อัปเดตเครดิต 
    players.forEach(player => {
        if (player.id === winnerId) {
            player.credit += winnerReceiveAmount;
        } else {
            player.credit -= collectAmount; 
            payersList.push(player.name);
        }
    });

    // บันทึก Log และสถานะใหม่
    const description = `${winnerName} ได้รับ ${winnerReceiveAmount.toLocaleString()} ฿ (จากทุกคนจ่ายคนละ ${collectAmount.toLocaleString()} ฿)`;
    addTransactionToLog('group', description); // NEW: บันทึก Log
    
    saveStateToHistory(); 
    renderPlayers(); 
}

/**
 * จัดการตรรกะการจ่ายพิเศษ (โอนเงิน)
 */
function handleManualPayment() {
    const payerId = parseInt(document.getElementById('payerSelect').value);
    const payeeId = parseInt(document.getElementById('payeeSelect').value);
    const amount = parseInt(document.getElementById('manualAmount').value) || 0;

    if (payerId === payeeId) {
        alert("ผู้จ่ายและผู้รับต้องไม่เป็นคนเดียวกัน");
        return;
    }

    if (amount <= 0) {
        alert("กรุณากำหนดจำนวนเงินที่ถูกต้อง");
        return;
    }

    const payer = players.find(p => p.id === payerId);
    const payee = players.find(p => p.id === payeeId);

    if (payer && payee) {
        payer.credit -= amount; 
        payee.credit += amount; 
        
        // บันทึก Log และสถานะใหม่
        const description = `${payer.name} โอนเงิน ${amount.toLocaleString()} ฿ ให้ ${payee.name}`;
        addTransactionToLog('manual', description); // NEW: บันทึก Log
        
        saveStateToHistory();
        renderPlayers();

    } else {
        alert("ไม่พบข้อมูลผู้เล่น");
    }
}


// เมื่อโหลดหน้าเว็บ: สร้างช่องกรอกชื่อเริ่มต้น และเริ่มเกม
window.onload = () => {
    createNameInputs(); 
    initializeGame();
};