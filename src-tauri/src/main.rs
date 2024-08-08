#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{Manager, Window};

// Command to close the splashscreen and show the main window
#[tauri::command]
async fn close_splashscreen(window: Window) {
    if let Some(splashscreen_window) = window.get_window("splashscreen") {
        println!("Closing splashscreen...");
        splashscreen_window.close().unwrap();
    } else {
        println!("Splashscreen window not found.");
    }
    if let Some(main_window) = window.get_window("main") {
        println!("Showing main window...");
        main_window.show().unwrap();
    } else {
        println!("Main window not found.");
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![close_splashscreen])
        .setup(|app| {
            let splashscreen_window = app.get_window("splashscreen").unwrap();
            let main_window = app.get_window("main").unwrap();
            tauri::async_runtime::spawn(async move {
                // Simulate initialization process
                println!("Initializing...");
                std::thread::sleep(std::time::Duration::from_secs(2));
                println!("Done initializing.");

                // After it's done, close the splashscreen and display the main window
                splashscreen_window.close().unwrap();
                println!("Splashscreen closed.");
                main_window.show().unwrap();
                println!("Main window shown.");
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
