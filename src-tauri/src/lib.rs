use enigo::{
    Enigo, Settings,
    agent::{Agent, Token},
};
use std::{
    sync::{LazyLock, Mutex},
};
use ron::de::from_str;
use tauri::{Manager};

// Global, shared Enigo wrapped in a Mutex
static ENIGO: LazyLock<Mutex<Enigo>> =
    LazyLock::new(|| Mutex::new(Enigo::new(&Settings::default()).unwrap()));

#[tauri::command]
fn execute_enigo_key_press(action: &str) -> Result<(), String> {
    let str: String = format!("k({},p)", action);
    let token: Token = from_str(&str).map_err(|e| format!("Deserialization error: {}", e))?;
    ENIGO.lock().unwrap().execute(&token).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn execute_enigo_key_release(action: &str) -> Result<(), String> {
    let str: String = format!("k({},r)", action);
    let token: Token = from_str(&str).map_err(|e| format!("Deserialization error: {}", e))?;
    ENIGO.lock().unwrap().execute(&token).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn execute_enigo_uni_press(action: &str) -> Result<(), String> {
    let str: String = format!("k(uni('{}'),p)", action);
    let token: Token = from_str(&str).map_err(|e| format!("Deserialization error: {}", e))?;
    ENIGO.lock().unwrap().execute(&token).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn execute_enigo_uni_release(action: &str) -> Result<(), String> {
    let str: String = format!("k(uni('{}'),r)", action);
    let token: Token = from_str(&str).map_err(|e| format!("Deserialization error: {}", e))?;
    ENIGO.lock().unwrap().execute(&token).map_err(|e| e.to_string())?;
    Ok(())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            execute_enigo_key_press, 
            execute_enigo_uni_press, 
            execute_enigo_uni_release, 
            execute_enigo_key_release])
        .setup(|app| {
                let window = app.get_webview_window("main").unwrap();
                window.set_always_on_top(true)?; // Example usage
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
