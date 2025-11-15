document.addEventListener("DOMContentLoaded", function() {

  openDB()
        .then(db => {
          console.log('Base de datos inicializada:', db);
        })
        .catch(err => {
          console.error('Error al abrir IndexedDB:', err);
        });
  // ========== ELEMENT SELECTORS ==========
  // Excel and localStorage controls
  const btnSaveExcel = document.getElementById("btn-saveExcel"); 
  const btnDeleteExcel = document.getElementById("btn-deleteExcel");
  
  // Basic form elements
  const reloj = document.querySelector(".clock");
  const inputId = document.querySelector(".input-id");
  const inputRut = document.querySelector(".input-rut");
  const inputName = document.querySelector(".input-name");
  const inputPhone1 = document.querySelector(".input-phone1");
  const inputPhone2 = document.querySelector(".input-phone2");
  const inputOnt = document.querySelector(".input-ont");
  const inputOlt = document.querySelector(".input-olt");
  const inputNodo = document.querySelector(".input-nodo");
  const inputAddress = document.querySelector(".input-address");
  const inputNotas = document.querySelector('.input-notas');
  
  // Internet elements
  const checkboxInternetRojo = document.querySelector(".checkbox-internet-rojo");
  const selectInternetRojo = document.querySelector(".select-internet-rojo");
  const checkboxInternetVerde = document.querySelector(".checkbox-internet-verde");
  const selectInternetVerde = document.querySelector(".select-internet-verde");
  const checkboxInternetBase = document.querySelector(".checkbox-internet-base");
  const selectInternetBase = document.querySelector(".select-internet-base");
  
  // TV elements
  const checkboxTvRojo = document.querySelector(".checkbox-tv-rojo");
  const selectTvRojo = document.querySelector(".select-tv-rojo");
  const checkboxTvVerde = document.querySelector(".checkbox-tv-verde");
  const selectTvVerde = document.querySelector(".select-tv-verde");
  const checkboxTvBase = document.querySelector(".checkbox-tv-base");
  const selectTvBase = document.querySelector(".select-tv-base");
  const checkboxTvGo = document.querySelector(".checkbox-tv-go");
  const selectTvGo = document.querySelector(".select-tv-go");
  const checkboxTvGoPlus = document.querySelector(".checkbox-tv-go-plus");
  const selectTvGoPlus = document.querySelector(".select-tv-go-plus");
  
  // Phone elements
  const checkboxPhoneRojo = document.querySelector(".checkbox-phone-rojo");
  const selectPhoneRojo = document.querySelector(".select-phone-rojo");
  const checkboxPhoneVerde = document.querySelector(".checkbox-phone-verde");
  const selectPhoneVerde = document.querySelector(".select-phone-verde");
  
  // Output area and buttons
  const textareaObs = document.querySelector(".textarea-obs");
  const btnCopy = document.querySelector(".btn-copy");
  const btnClear = document.querySelector(".btn-clear");
  
  // Code display
  const codigoDisplay = document.querySelector(".codigo-display");
  
  // Excel data storage
  let excelData = null;
  // Constante orden de la tabla

  let sortAscending = true;

  
  // ========== UTILITY FUNCTIONS ==========

//Funcionalidad orden de la tabla:

  document.getElementById("toggleSortBtn").addEventListener("click", () => {
  sortAscending = !sortAscending;
  renderCallsTable();
});




//Utilidad: Manejo de IndexedDB
// Utilidad: Manejo de IndexedDB
function openDB() {
  if (openDB.dbInstance) {
    return Promise.resolve(openDB.dbInstance);
  }

  return new Promise((resolve, reject) => {
    // Ajusta aquí la versión si ya tienes AppDB en v2 o superior
    const request = indexedDB.open("AppDB", 1);

    request.onupgradeneeded = event => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("datosExcel")) {
        db.createObjectStore("datosExcel");
      }
      if (!db.objectStoreNames.contains("llamadas")) {
        db.createObjectStore("llamadas");
      }
      // no resolvemos aquí
    };

    request.onsuccess = event => {
      const db = event.target.result;
      openDB.dbInstance = db;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

async function getFromStore(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function setToStore(storeName, key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function getAllFromStore(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAllKeys();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function deleteFromStore(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

//** función para borrar
function deleteAllFromStore(storeName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("AppDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(storeName, "readwrite");
      const store = transaction.objectStore(storeName);
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    };

    request.onerror = () => reject(request.error);
  });
}


  
  /**
   * Updates the clock display with current date and time
   */
  function updateClock() {
    const now = new Date();
    reloj.value = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
  }
  
  /**
   * Auto-resizes a textarea based on its content
   * @param {HTMLElement} ta - The textarea element
   */
  function autoResize(ta) { 
    ta.style.height = 'auto'; 
    ta.style.height = ta.scrollHeight + 'px'; 
  }
  
  // ========== EXCEL DATA HANDLING ==========
  
  // Load Excel data automatically from "datos.xlsx"
  fetch('datos.xlsx')
    .then(response => response.arrayBuffer())
    .then(buffer => {
      const data = new Uint8Array(buffer);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const extractedData = {};
      excelData.forEach(row => {
        if (row.length >= 2) extractedData[row[0]] = row[1];
      });
      localStorage.setItem("datosExcel", JSON.stringify(extractedData));
    })
    .catch(error => console.error("Error loading Excel:", error));
  
  /**
   * Generates an Excel file from saved calls
   */
async function generarExcel() {
  const keys = await getAllFromStore("llamadas");
  const sortedKeys = keys.sort((a, b) =>
    parseInt(a.replace("llamada", "")) - parseInt(b.replace("llamada", ""))
  );

  const data = [];

  for (const key of sortedKeys) {
    const value = await getFromStore("llamadas", key);
    if (value) {
      data.push([key, value]);
    }
  }

  if (!data.length) {
    alert('No hay datos de OBS guardados para generar el Excel.');
    return;
  }

  const ws = XLSX.utils.aoa_to_sheet([['Llamada', 'OBS'], ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Llamadas');
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'llamadas.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

  
  // ========== FORM HANDLING FUNCTIONS ==========
  
  /**
   * Updates the combined text in the OBS textarea
   */
  async function updateCombined() {
  let combined = [];
  const stored = JSON.parse(localStorage.getItem("datosExcel") || "{}");
  let extras = '';

  // Procesar todos los checkboxes y selects
  [
    {c: checkboxInternetRojo, s: selectInternetRojo, p: 'internetRojo'},
    {c: checkboxInternetVerde, s: selectInternetVerde, p: 'internetVerde'},
    {c: checkboxInternetBase, s: selectInternetBase, p: 'internetBase'},
    {c: checkboxTvRojo, s: selectTvRojo, p: 'tvRojo'},
    {c: checkboxTvVerde, s: selectTvVerde, p: 'tvVerde'},
    {c: checkboxTvBase, s: selectTvBase, p: 'tvBase'},
    {c: checkboxTvGo, s: selectTvGo, p: 'tvGo'},
    {c: checkboxTvGoPlus, s: selectTvGoPlus, p: 'tvGoPlus'},
    {c: checkboxPhoneRojo, s: selectPhoneRojo, p: 'telefonoRojo'},
    {c: checkboxPhoneVerde, s: selectPhoneVerde, p: 'telefonoVerde'}
  ].forEach(item => {
    if (item.c.checked && item.s.value && item.s.selectedIndex > 0) {
      const key = item.p + item.s.selectedIndex;
      extras += `Cliente indica ${stored[key] || ''}\n`;
    }
  });

  // Información básica
  if (reloj.value) combined.push(`DATE: ${reloj.value}`);
  if (inputId.value) combined.push(`ID: ${inputId.value}`);
  if (inputRut.value) combined.push(`RUT: ${inputRut.value}`);
  if (inputName.value) combined.push(`NOMBRE: ${inputName.value}`);

  // Teléfonos
  if (inputPhone1.value || inputPhone2.value) {
    const p = inputPhone2.value ? 
      `${inputPhone1.value} / ${inputPhone2.value}` : 
      inputPhone1.value || inputPhone2.value;
    combined.push(`FONO: ${p}`);
  }

  // Detalles técnicos
  if (inputOnt.value) combined.push(`ONT: ${inputOnt.value}`);
  if (inputOlt.value) combined.push(`OLT: ${inputOlt.value}`);
  if (inputNodo.value) combined.push(`TARJETA Y PUERTO: ${inputNodo.value}`);
  if (inputAddress.value) combined.push(`DIRECCIÓN Y NODO: ${inputAddress.value}`);

  // Observaciones
  const notas = inputNotas.value.trim();
  if (extras || notas) {
    combined.push('OBS:');
    if (extras) combined.push(extras.trim());
    if (notas) combined.push(notas);
  }

  textareaObs.value = combined.join('\n');
  autoResize(textareaObs);
  updateCodigoDisplay(); // ya migrada
}

  
  /**
   * Updates the code display with service information
   */
async function updateCodigoDisplay() {
  const stored = JSON.parse(localStorage.getItem("datosExcel") || "{}");
  let info = '';

  [
    {c: checkboxInternetRojo, s: selectInternetRojo, o: 0},
    {c: checkboxInternetVerde, s: selectInternetVerde, o: 7},
    {c: checkboxInternetBase, s: selectInternetBase, o: 14},
    {c: checkboxTvRojo, s: selectTvRojo, o: 21},
    {c: checkboxTvVerde, s: selectTvVerde, o: 28},
    {c: checkboxTvBase, s: selectTvBase, o: 35},
    {c: checkboxTvGo, s: selectTvGo, o: 42},
    {c: checkboxTvGoPlus, s: selectTvGoPlus, o: 49},
    {c: checkboxPhoneRojo, s: selectPhoneRojo, o: 56},
    {c: checkboxPhoneVerde, s: selectPhoneVerde, o: 63}
  ].forEach(srv => {
    if (srv.c.checked && srv.s.value && srv.s.selectedIndex > 0) {
      const idx = srv.o + srv.s.selectedIndex;
      const key = 'codigo' + idx;
      info += `Tipificación:\n\n${stored[key] || ''}\n`;
    }
  });

  codigoDisplay.innerText = info;
}
  
  /**
   * Toggles select visibility based on checkbox state
   * @param {HTMLElement} sel - The select element
   * @param {HTMLElement} chk - The checkbox element
   */
  function toggleSelect(sel, chk) {
    sel.style.display = chk.checked ? 'block' : 'none';
    if (!chk.checked) sel.value = '';
    updateCombined();
  }
  
  /**
   * Unchecks all other checkboxes when one is checked
   * @param {HTMLElement} cur - The currently checked checkbox
   */
  function uncheckOthers(cur) {
    const allCheckboxes = [
      checkboxInternetRojo, checkboxInternetVerde, checkboxInternetBase,
      checkboxTvRojo, checkboxTvVerde, checkboxTvBase, checkboxTvGo, checkboxTvGoPlus,
      checkboxPhoneRojo, checkboxPhoneVerde
    ];
    
    const allSelects = [
      selectInternetRojo, selectInternetVerde, selectInternetBase,
      selectTvRojo, selectTvVerde, selectTvBase, selectTvGo, selectTvGoPlus,
      selectPhoneRojo, selectPhoneVerde
    ];
    
    allCheckboxes.forEach((cb, i) => {
      if (cb !== cur) {
        cb.checked = false;
        allSelects[i].style.display = 'none';
      }
    });
    
    updateCombined();
  }
  
  // ========== FORM ACTIONS ==========
  
  /**
   * Copies the OBS text to clipboard and saves it
   */
  function copiar() {
    navigator.clipboard.writeText(textareaObs.value)
      .then(_ => {
        alert('¡Copiado al portapapeles!');
        guardarOBS();
      });
  }
  
  /**
   * Saves the current OBS to localStorage
   */
async function guardarOBS() {
  const keys = await getAllFromStore("llamadas");
  const max = Math.max(0, ...keys.map(k => parseInt(k.replace("llamada", "")) || 0));
  const newKey = "llamada" + (max + 1);
  await setToStore("llamadas", newKey, textareaObs.value);
}

  
  /**
   * Clears all form fields
   */
  function limpiarCampos() {
    // Clear input fields
    [inputId, inputRut, inputName, inputPhone1, inputPhone2, inputOnt, 
     inputOlt, inputNodo, inputAddress, inputNotas].forEach(i => i.value = '');
    
    // Uncheck all checkboxes
    [checkboxInternetRojo, checkboxInternetVerde, checkboxInternetBase,
     checkboxTvRojo, checkboxTvVerde, checkboxTvBase, checkboxTvGo, checkboxTvGoPlus,
     checkboxPhoneRojo, checkboxPhoneVerde].forEach(cb => cb.checked = false);
    
    // Hide and clear all selects
    [selectInternetRojo, selectInternetVerde, selectInternetBase,
     selectTvRojo, selectTvVerde, selectTvBase, selectTvGo, selectTvGoPlus,
     selectPhoneRojo, selectPhoneVerde].forEach(s => {
      s.style.display = 'none';
      s.value = '';
    });
    
    textareaObs.value = '';
    updateCodigoDisplay();
  }
  
  /**
   * Loads a call from history into the form
   * @param {string} text - The call text to parse and load
   */
  function loadCallIntoForm(text) {
    limpiarCampos();
    const lines = text.split('\n');
    let inObsSection = false;
    let obsLines = [];
    
    lines.forEach(line => {
      if (line.startsWith('OBS:')) {
        inObsSection = true;
        return;
      }
      
      if (!inObsSection) {
        const [field, ...rest] = line.split(': ');
        const val = rest.join(': ').trim();
        
        switch(field) {
          case 'ID': inputId.value = val; break;
          case 'RUT': inputRut.value = val; break;
          case 'NOMBRE': inputName.value = val; break;
          case 'FONO': 
            const phones = val.split(' / ');
            inputPhone1.value = phones[0] || '';
            inputPhone2.value = phones[1] || '';
            break;
          case 'ONT': inputOnt.value = val; break;
          case 'OLT': inputOlt.value = val; break;
          case 'TARJETA Y PUERTO': inputNodo.value = val; break;
          case 'DIRECCIÓN Y NODO': inputAddress.value = val; break;
        }
      } else {
        obsLines.push(line.trim());
      }
    });
    
    // Join OBS lines, skipping empty lines at start/end
    const obsText = obsLines.join('\n').replace(/^\n+|\n+$/g, '');
    inputNotas.value = obsText;
    autoResize(inputNotas);
    setTimeout(() => autoResize(inputNotas), 50); // Double-check resize
    
    // Switch to form tab
    document.querySelector('[data-tab="tab1"]').click();
    updateCombined();
  }
  
  // ========== HISTORY TABLE FUNCTIONS ==========
  
  /**
   * Renders the calls table with data from localStorage
   */
async function renderCallsTable() {
  const tbody = document.querySelector('#callsTable tbody');
  tbody.innerHTML = '';

  const keys = await getAllFromStore("llamadas");
  const sortedKeys = keys
    .filter(k => k.startsWith('llamada'))
    .sort((a, b) => {
      const numA = parseInt(a.replace('llamada', ''));
      const numB = parseInt(b.replace('llamada', ''));
      return sortAscending ? numA - numB : numB - numA;
    });

  for (const key of sortedKeys) {
    const text = await getFromStore("llamadas", key);
    const num = key.replace('llamada', '');
    const nombre = (text.match(/NOMBRE:\s*(.*)/) || ['', ''])[1];
    const rut = (text.match(/RUT:\s*(.*)/) || ['', ''])[1];
    const obs = text;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${num}</td>
      <td>${nombre}<br/><small>${rut}</small></td>
      <td style="white-space: pre-wrap;">${obs}</td>
      <td>
        <button class="action-btn edit-btn">Editar</button>
        <button class="action-btn delete-btn">Borrar</button>
        <button class="action-btn copy-btn">Copiar</button>
      </td>`;

    tr.querySelector('.edit-btn').onclick = () => loadCallIntoForm(text);
    tr.querySelector('.delete-btn').onclick = async () => {
      if (confirm(`¿Borrar llamada ${num}?`)) {
        await deleteFromStore("llamadas", key);
        renderCallsTable();
      }
    };
    tr.querySelector('.copy-btn').onclick = () => {
      navigator.clipboard.writeText(obs)
        .then(_ => alert('OBS copiada al portapapeles'));
    };

    tbody.appendChild(tr);
  }
}



  
  // ========== TAB SYSTEM ==========
  
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active tab button
      document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show corresponding tab content
      document.querySelectorAll('.tab-content').forEach(tc => tc.style.display = 'none');
      document.getElementById(btn.dataset.tab).style.display = 'block';
      
      // Render calls table if history tab is selected
      if (btn.dataset.tab === 'tab2') renderCallsTable();
    });
  });
  
  // ========== EVENT LISTENERS ==========
  
  // Initialize clock
  updateClock();
  setInterval(updateClock, 1000);
  
  // Excel buttons
  btnSaveExcel.addEventListener('click', generarExcel);

btnDeleteExcel.addEventListener('click', async function () {
  await deleteAllFromStore("datosExcel"); // elimina todos los datos Excel
  await deleteAllFromStore("llamadas");   // elimina todas las llamadas

  alert("¡Datos borrados!");
});


  
  // Form input listeners
  [inputId, inputRut, inputName, inputPhone1, inputPhone2, 
   inputOnt, inputOlt, inputNodo, inputAddress].forEach(inp => {
    inp.addEventListener('input', updateCombined);
  });
  
  inputNotas.addEventListener('input', () => {
    autoResize(inputNotas);
    updateCombined();
  });
  
  // Internet service listeners
  [checkboxInternetRojo, checkboxInternetVerde, checkboxInternetBase].forEach((cb, i) => {
    cb.addEventListener('change', () => {
      if (cb.checked) uncheckOthers(cb);
      toggleSelect([selectInternetRojo, selectInternetVerde, selectInternetBase][i], cb);
    });
    [selectInternetRojo, selectInternetVerde, selectInternetBase][i]
      .addEventListener('change', updateCombined);
  });
  
  // TV service listeners
  [checkboxTvRojo, checkboxTvVerde, checkboxTvBase, checkboxTvGo, checkboxTvGoPlus].forEach((cb, i) => {
    cb.addEventListener('change', () => {
      if (cb.checked) uncheckOthers(cb);
      toggleSelect([selectTvRojo, selectTvVerde, selectTvBase, selectTvGo, selectTvGoPlus][i], cb);
    });
    [selectTvRojo, selectTvVerde, selectTvBase, selectTvGo, selectTvGoPlus][i]
      .addEventListener('change', updateCombined);
  });
  
  // Phone service listeners
  [checkboxPhoneRojo, checkboxPhoneVerde].forEach((cb, i) => {
    cb.addEventListener('change', () => {
      if (cb.checked) uncheckOthers(cb);
      toggleSelect([selectPhoneRojo, selectPhoneVerde][i], cb);
    });
    [selectPhoneRojo, selectPhoneVerde][i]
      .addEventListener('change', updateCombined);
  });
  
  // Action buttons
  btnCopy.addEventListener('click', copiar);
  btnClear.addEventListener('click', limpiarCampos);
  
  // ========== TIMER AND PIP FUNCTIONALITY ==========
  // (Remaining timer code remains unchanged as it was working correctly)
  const totalTime = 120000;
  let remainingTime = totalTime;
  let timerState = 'paused';
  let lastTimestamp = null;
  let startTimestamp = null;
  let timeout30 = null;
  let timeout15 = null;
  let alert30Triggered = false;
  let alert15Triggered = false;
  
  function playCustomSound() {
    const audio = new Audio('alerta.mp3');
    audio.volume = 0.02;
    audio.play();
  }
  
  function updateFavicon(color) {
    let fav = document.getElementById('dynamic-favicon');
    if (!fav) {
      fav = document.createElement('link');
      fav.id = 'dynamic-favicon';
      fav.rel = 'icon';
      document.head.appendChild(fav);
    }
    
    const c = document.createElement('canvas');
    c.width = 32;
    c.height = 32;
    const ctx2 = c.getContext('2d');
    ctx2.fillStyle = color;
    ctx2.fillRect(0, 0, 32, 32);
    fav.href = c.toDataURL();
  }
  
  function scheduleTimeouts() {
    const now = Date.now();
    const end = startTimestamp + totalTime;
    
    if (!alert30Triggered && remainingTime > 30000) {
      timeout30 = setTimeout(() => {
        playCustomSound();
        alert30Triggered = true;
      }, end - 30000 - now);
    }
    
    if (!alert15Triggered && remainingTime > 15000) {
      timeout15 = setTimeout(() => {
        playCustomSound();
        alert15Triggered = true;
      }, end - 15000 - now);
    }
  }
  
  function handleTimerClick() {
    if (timerState === 'paused') {
      timerState = 'running';
      startTimestamp = Date.now();
      lastTimestamp = performance.now();
      alert30Triggered = false;
      alert15Triggered = false;
      if (document.hidden) scheduleTimeouts();
    } else {
      timerState = 'paused';
      remainingTime = totalTime;
      clearTimeout(timeout30);
      clearTimeout(timeout15);
    }
  }
  
  function drawCountdown(tm) {
    const prog = (totalTime - tm) / totalTime;
    const sc = { r: 119, g: 221, b: 119 };
    const ec = { r: 255, g: 105, b: 97 };
    const r = Math.round(sc.r + (ec.r - sc.r) * prog);
    const g = Math.round(sc.g + (ec.g - sc.g) * prog);
    const b = Math.round(sc.b + (ec.b - sc.b) * prog);
    const color = `rgb(${r},${g},${b})`;
    
    updateFavicon(color);
    
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      document.body.style.backgroundColor = color;
      
      const secs = Math.ceil(tm / 1000);
      const mins = Math.floor(secs / 60);
      const s = secs % 60;
      
      ctx.font = '40px Arial';
      ctx.fillStyle = 'black';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`, canvas.width / 2, canvas.height / 2);
    }
  }
  
  function updateTimer() {
    if (timerState === 'running') {
      remainingTime = Math.max(totalTime - (Date.now() - startTimestamp), 0);
      
      if (!document.hidden) {
        if (!alert30Triggered && remainingTime <= 30000) {
          playCustomSound();
          alert30Triggered = true;
        }
        if (!alert15Triggered && remainingTime <= 15000) {
          playCustomSound();
          alert15Triggered = true;
        }
      }
    }
    
    drawCountdown(remainingTime);
    requestAnimationFrame(updateTimer);
  }
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && timerState === 'running') {
      scheduleTimeouts();
    } else {
      clearTimeout(timeout30);
      clearTimeout(timeout15);
      lastTimestamp = performance.now();
    }
  });
  
  const canvas = document.getElementById('countdownCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  if (canvas) canvas.addEventListener('click', handleTimerClick);
  
  const pipButton = document.getElementById('pipButton');
  const pipVideo = document.getElementById('pipVideo');
  if (pipVideo) pipVideo.addEventListener('click', handleTimerClick);
  
  if (canvas && pipButton && pipVideo) {
    const stream = canvas.captureStream(30);
    pipVideo.srcObject = stream;
    pipVideo.play();
    
    pipButton.addEventListener('click', async () => {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
          pipButton.textContent = 'Desacoplar';
        } else {
          const w = await pipVideo.requestPictureInPicture();
          pipButton.textContent = 'Acoplar';
          if (w.resizeTo) w.resizeTo(100, 50);
        }
      } catch (e) {
        console.error(e);
      }
    });
  }
  
  requestAnimationFrame(updateTimer);
  
  // ========== WIZARD FUNCTIONALITY ==========
  // (Wizard and Sondeo code remains unchanged as it was working correctly)
 /* --- Funcionalidad del Wizard (Persiste) --- */
  function customAlert(message) {
    let alertDiv = document.createElement('div');
    alertDiv.className = 'custom-alert';
    alertDiv.innerText = message;
    document.body.appendChild(alertDiv);
    setTimeout(() => {
      alertDiv.remove();
    }, 2000);
  }
  
  let currentStep = 1;
  function showCurrentStep() {
    var steps = document.querySelectorAll('.wizard-step');
    steps.forEach(function(step) {
      step.style.display = 'none';
    });
    document.getElementById('step' + currentStep).style.display = 'block';
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    if (currentStep === 1) {
      prevBtn.style.visibility = "hidden";
    } else {
      prevBtn.style.visibility = "visible";
    }
    if (currentStep === 4) {
      nextBtn.innerHTML = "Enviar";
    } else {
      nextBtn.innerHTML = "&gt;";
    }
  }
  
  function nextStep() {
    if (currentStep === 1) {
      var cedulaVal = document.getElementById('cedulaInput').value.trim();
      if (!cedulaVal) {
        customAlert('Por favor, ingresa la Cédula');
        return;
      }
      currentStep = 2;
    } else if (currentStep === 2) {
      var servicioSeleccionado = document.querySelector('input[name="servicioFalla"]:checked');
      if (!servicioSeleccionado) {
        customAlert('Por favor, selecciona un servicio con falla');
        return;
      }
      currentStep = 3;
    } else if (currentStep === 3) {
      var contratoVal = document.getElementById('contratoInput').value.trim();
      if (!contratoVal) {
        customAlert('Por favor, ingresa el Código de contrato');
        return;
      }
      currentStep = 4;
    } else if (currentStep === 4) {
      submitWizard();
      return;
    }
    showCurrentStep();
  }
  
  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      showCurrentStep();
    }
  }
  
  function cancelWizard() {
    document.getElementById('wizardModal').style.display = 'none';
    document.getElementById('cedulaInput').value = '';
    document.getElementById('contratoInput').value = '';
    document.querySelectorAll('input[name="servicioFalla"]').forEach(radio => radio.checked = false);
    document.querySelectorAll('input[name="monitoreo"]').forEach(radio => radio.checked = false);
    currentStep = 1;
  }
  
  function openWizard() {
    currentStep = 1;
    document.getElementById('wizardModal').style.display = 'block';
    showCurrentStep();
  }
  
  function submitWizard() {
    // Obtener valores de los campos
    const cedulaVal = document.getElementById('cedulaInput').value.trim();
    const servicioVal = document.querySelector('input[name="servicioFalla"]:checked').value;
    const contratoVal = document.getElementById('contratoInput').value.trim();
    const monitoreoVal = document.querySelector('input[name="monitoreo"]:checked').value;
    const rutVal = document.querySelector('.input-rut').value.trim();
    const idVal = document.querySelector('.input-id').value.trim();
    const ontVal = document.querySelector('.input-ont').value.trim();
    const oltVal = document.querySelector('.input-olt').value.trim();
    const obsVal = document.querySelector('.textarea-obs').value.trim();

    // Construir URL de prefill
    const baseURL = "https://docs.google.com/forms/d/e/1FAIpQLScBARUWj5MxH9pp9ax1QWFa-2voO9cx75yEE0q3qq_ZiD593Q/viewform?";
    const params = new URLSearchParams({
      "entry.1756173374": cedulaVal,
      "entry.748509019": servicioVal,
      "entry.907612803": contratoVal,
      "entry.504780451": monitoreoVal,
      "entry.596409908": rutVal,
      "entry.1029252672": idVal,
      "entry.359541124": ontVal,
      "entry.259929954": oltVal,
      "entry.1859159833": obsVal
    });
    const prefillURL = baseURL + params.toString();

    // Abrir nueva ventana con el formulario prellenado
    window.open(prefillURL, "ventanaPersiste", "width=800,height=600");

    // Cerrar modal y limpiar sus campos
    cancelWizard();
  }
  
  document.getElementById('btn-persiste').addEventListener('click', openWizard);
  
  /* --- Funcionalidad del Wizard (Sondeo) --- */
  let currentSondeoStep = 1;
  const totalSondeoSteps = 8;
  
  function showCurrentSondeoStep() {
    for (let i = 1; i <= totalSondeoSteps; i++) {
      const step = document.getElementById("sondeoStep" + i);
      if (step) {
        step.style.display = (i === currentSondeoStep) ? "block" : "none";
      }
    }
    const prevBtn = document.querySelector("#sondeoWizardModal .prev-btn");
    const nextBtn = document.querySelector("#sondeoWizardModal .next-btn");
    if (prevBtn) prevBtn.style.visibility = (currentSondeoStep === 1) ? "hidden" : "visible";
    if (nextBtn) nextBtn.innerText = (currentSondeoStep === totalSondeoSteps) ? "Enviar" : ">";
  }
  
  function nextSondeoModal() {
    if (currentSondeoStep < totalSondeoSteps) {
      currentSondeoStep++;
      showCurrentSondeoStep();
    } else {
      sendSondeoData();
    }
  }
  
  function prevSondeoModal() {
    if (currentSondeoStep > 1) {
      currentSondeoStep--;
      showCurrentSondeoStep();
    }
  }
  
  function cancelSondeo() {
    const sondeoModal = document.getElementById("sondeoWizardModal");
    if (sondeoModal) sondeoModal.style.display = "none";
  
    // Limpiar campos del modal Sondeo
    const inputCC = document.getElementById("cc");
    if (inputCC) inputCC.value = "";
    document.querySelectorAll("input[name='sondeoServicioFalla']").forEach(radio => radio.checked = false);
    document.querySelectorAll("input[name='sondeoInconvenientes']").forEach(radio => radio.checked = false);
    const sondeoOtrosInput = document.getElementById("sondeoOtrosInconveniente");
    if (sondeoOtrosInput) sondeoOtrosInput.value = "";
    document.querySelectorAll("input[name='sondeoClienteReincidente']").forEach(radio => radio.checked = false);
    const fallaDateInput = document.getElementById("fallaDate");
    if (fallaDateInput) fallaDateInput.value = "";
    const fallaTimeInput = document.getElementById("fallaTime");
    if (fallaTimeInput) fallaTimeInput.value = "";
    document.querySelectorAll("input[name='sondeoSuministroElectrico']").forEach(radio => radio.checked = false);
    document.querySelectorAll("input[name='sondeoGeneradorElectrico']").forEach(radio => radio.checked = false);
    document.querySelectorAll("input[name='sondeoLucesEstado']").forEach(radio => radio.checked = false);
  
    currentSondeoStep = 1;
    showCurrentSondeoStep();
  }
  
  function sendSondeoData() {
    const rut = document.querySelector(".input-rut").value;
    const telefono = document.querySelector(".input-phone1").value;
    const direccion = document.querySelector(".input-address").value;
    const ont = document.querySelector(".input-ont").value;
    const olt = document.querySelector(".input-olt").value;
    const tarjetaPuerto = document.querySelector(".input-nodo").value;
    const obs = document.querySelector(".textarea-obs").value;
  
    let tarjeta = "";
    let puerto = "";
    if (tarjetaPuerto.includes("/")) {
      let parts = tarjetaPuerto.split("/");
      tarjeta = parts[0].trim();
      puerto = parts[1].trim();
    } else {
      tarjeta = tarjetaPuerto.trim();
    }
  
    let nodo = "";
    const nodoRegex = /NODO:\s*(\S+)/i;
    const match = direccion.match(nodoRegex);
    if (match) {
      nodo = match[1];
    }
  
    const cc = document.getElementById("cc").value;
    const servicioFallaElem = document.querySelector('input[name="sondeoServicioFalla"]:checked');
    const servicioFalla = servicioFallaElem ? servicioFallaElem.value : "";
    const inconvenientesElem = document.querySelector('input[name="sondeoInconvenientes"]:checked');
    let inconvenientesStr = "";
    if (inconvenientesElem) {
      if (inconvenientesElem.value === "Otros:") {
        const otroTexto = document.getElementById("sondeoOtrosInconveniente").value;
        inconvenientesStr = "Otros: " + otroTexto;
      } else {
        inconvenientesStr = inconvenientesElem.value;
      }
    }
    const reincidenteElem = document.querySelector('input[name="sondeoClienteReincidente"]:checked');
    const reincidenteStr = reincidenteElem ? reincidenteElem.value : "";
    const fallaDate = document.getElementById("fallaDate").value;
    const fallaTime = document.getElementById("fallaTime").value;
    let fallaYear = "", fallaMonth = "", fallaDay = "", fallaHour = "", fallaMinute = "";
    if (fallaDate) {
      const dateParts = fallaDate.split("-");
      fallaYear = dateParts[0];
      fallaMonth = dateParts[1];
      fallaDay = dateParts[2];
    }
    if (fallaTime) {
      const timeParts = fallaTime.split(":");
      let h = parseInt(timeParts[0], 10);
      fallaMinute = timeParts[1];
      if (h > 12) { h = h - 12; }
      if (h === 0) { h = 12; }
      fallaHour = h.toString();
    }
    const suministroElem = document.querySelector('input[name="sondeoSuministroElectrico"]:checked');
    const suministroStr = suministroElem ? suministroElem.value : "";
    const generadorElem = document.querySelector('input[name="sondeoGeneradorElectrico"]:checked');
    const generadorStr = generadorElem ? generadorElem.value : "";
    const lucesElem = document.querySelector('input[name="sondeoLucesEstado"]:checked');
    const lucesStr = lucesElem ? lucesElem.value : "";
  
    // Se extrae el contenido de obs que se encuentra después de "OBS:"
    let obsPost = "";
    const marker = "OBS:";
    const pos = obs.indexOf(marker);
    if (pos >= 0) {
      obsPost = obs.substring(pos + marker.length).trim();
    }
  
    const baseURL = "https://docs.google.com/forms/d/e/1FAIpQLSeOA7OULm89gvnyG0q8Fvkr_bCdzXNsnRotRu6_tSmh-lPdLw/viewform?";
    const params = new URLSearchParams({
      "entry.423430974": cc,
      "entry.189057090": rut,
      "entry.399236047": servicioFalla,
      "entry.302927497": telefono,
      "entry.1510722740": direccion,
      "entry.825850316": ont,
      "entry.163062648": olt,
      "entry.1433390129": tarjeta,
      "entry.825069013": puerto,
      "entry.1038443960": nodo,
      "entry.1833454695": inconvenientesStr,
      "entry.542616353": reincidenteStr,
      "entry.978502501_year": fallaYear,
      "entry.978502501_month": fallaMonth,
      "entry.978502501_day": fallaDay,
      "entry.978502501_hour": fallaHour,
      "entry.978502501_minute": fallaMinute,
      "entry.1760026309": suministroStr,
      "entry.1092691919": generadorStr,
      "entry.64765887": lucesStr,
      "entry.505366834": obsPost
    });
    const prefillURL = baseURL + params.toString();
    window.open(prefillURL, "ventanaSondeo", "width=800,height=600");
    cancelSondeo();
  }
  
  document.getElementById("btn-sondeo").addEventListener("click", function() {
    currentSondeoStep = 1;
    showCurrentSondeoStep();
    document.getElementById("sondeoWizardModal").style.display = "block";
  });
  
  // Exponer funciones globalmente para atributos inline
  window.openWizard = openWizard;
  window.nextStep = nextStep;
  window.prevStep = prevStep;
  window.cancelWizard = cancelWizard;
  window.customAlert = customAlert;
  window.nextSondeoModal = nextSondeoModal;
  window.prevSondeoModal = prevSondeoModal;
  window.cancelSondeo = cancelSondeo;
  window.sendSondeoData = sendSondeoData;
});


