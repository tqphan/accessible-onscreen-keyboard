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

// Key repeat configuration
const KEY_REPEAT_INITIAL_DELAY = 500; // ms before first repeat
const KEY_REPEAT_INTERVAL = 50;       // ms between repeats

// Track active key repeats: Map<pointerId, {initialTimer, repeatInterval, key}>
const activeRepeats = new Map();

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
    
    // Initial key press
    if (key.dataset.enigoKey) execute_enigo_key_press(key.dataset.enigoKey);
    if (key.dataset.enigoUni) execute_enigo_uni_press(key.dataset.enigoUni);

    // Set up key repeat (but not for modifier keys)
    if (!isModifier) {
        // Clear any existing repeat for this pointer
        if (activeRepeats.has(e.pointerId)) {
            const existing = activeRepeats.get(e.pointerId);
            clearTimeout(existing.initialTimer);
            clearInterval(existing.repeatInterval);
        }

        // Start initial delay timer
        const initialTimer = setTimeout(() => {
            // After initial delay, start repeating
            const repeatInterval = setInterval(() => {
                // Simulate key press and release for each repeat
                if (key.dataset.enigoKey) {
                    execute_enigo_key_press(key.dataset.enigoKey);
                }
                if (key.dataset.enigoUni) {
                    execute_enigo_uni_press(key.dataset.enigoUni);
                }
            }, KEY_REPEAT_INTERVAL);

            // Update the stored repeat info with the interval
            if (activeRepeats.has(e.pointerId)) {
                activeRepeats.get(e.pointerId).repeatInterval = repeatInterval;
            }
        }, KEY_REPEAT_INITIAL_DELAY);

        // Store the repeat info
        activeRepeats.set(e.pointerId, {
            initialTimer,
            repeatInterval: null,
            key
        });
    }
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
    
    // Clear any active key repeat for this pointer
    if (activeRepeats.has(e.pointerId)) {
        const repeatInfo = activeRepeats.get(e.pointerId);
        clearTimeout(repeatInfo.initialTimer);
        if (repeatInfo.repeatInterval) {
            clearInterval(repeatInfo.repeatInterval);
        }
        activeRepeats.delete(e.pointerId);
    }
    
    // Final key release
    if (key.dataset.enigoKey) execute_enigo_key_release(key.dataset.enigoKey);
    if (key.dataset.enigoUni) execute_enigo_uni_release(key.dataset.enigoUni);
});
