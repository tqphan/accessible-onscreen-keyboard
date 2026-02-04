const { invoke } = window.__TAURI__.core;

async function execute_enigo_key_press(str) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    await invoke("execute_enigo_key_press", { action: str });
}
async function execute_enigo_key_release(str) {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    await invoke("execute_enigo_key_release", { action: str });
}

async function execute_enigo_uni_press(str) {
    await invoke("execute_enigo_uni_press", { action: str });
}
async function execute_enigo_uni_release(str) {
    await invoke("execute_enigo_uni_release", { action: str });
}

// Prevent default context menu
document.addEventListener('contextmenu', e => e.preventDefault());

// Handle pointer down
document.addEventListener('pointerdown', e => {
    const key = e.target.closest('.key');
    if (!key) return;

    const isModifier = key.classList.contains('modifier');
    e.target.device = e.persistentDeviceId;
    e.target.button = e.button;
    key.setPointerCapture(e.pointerId);
    if (key.dataset.enigoKey) execute_enigo_key_press(key.dataset.enigoKey);
    if (key.dataset.enigoUni) execute_enigo_uni_press(key.dataset.enigoUni);

});

// Handle pointer up
document.addEventListener('pointerup', e => {
    const key = e.target.closest('.key');
    if (!key) return;

    const isModifier = key.classList.contains('modifier');
    e.target.device = e.persistentDeviceId;
    e.target.button = null;
    key.setPointerCapture(e.pointerId);
    key.releasePointerCapture(e.pointerId);
    if (key.dataset.enigoKey) execute_enigo_key_release(key.dataset.enigoKey);
    if (key.dataset.enigoUni) execute_enigo_uni_release(key.dataset.enigoUni);
});