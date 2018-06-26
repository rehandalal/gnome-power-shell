import {
  POSITION_DEFAULT,
  GUID,
} from './constants';

/* Global imports */
const Atk = imports.gi.Atk;
const Clutter = imports.gi.Clutter;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const PanelMenu = imports.ui.panelMenu;
const St = imports.gi.St;

export default class ToggleDesktopButton {
  constructor(options = {}) {
    this.position = options.position || POSITION_DEFAULT;
    this.minimizedWindows = [];

    this.button = new PanelMenu.Button(0.0, null, true);
    this.button.actor.accessible_role = Atk.Role.TOGGLE_BUTTON;
    this.button.actor.add_style_class_name('gps-toggle-desktop')

    this.icon = new St.Icon({
      icon_name: 'show-desktop-button',
      style_class: 'system-status-icon'  // Use system style
    });

    this.button.actor.add_actor(this.icon);

    // Add event listeners to button
    this.button.actor.connect_after('key-release-event', ::this.handleKeyRelease);
    this.button.actor.connect('button-release-event', ::this.handleClick);

    // Add the button to the panel
    Main.panel.addToStatusArea(GUID, this.button, 1, this.position);
  }

  destroy() {
    Main.panel.statusArea[GUID] = null;
    this.button.destroy();
    this.button = null;
  }

  handleKeyRelease(actor, event) {
    const symbol = event.get_key_symbol();
    if (symbol === Clutter.KEY_Return || symbol === Clutter.KEY_space) {
        this.handleClick(actor, event);
    }
    return Clutter.EVENT_PROPAGATE;
  }

  handleClick(actor, event) {
    this.toggleDesktopVisibility();

    if (Main.overview.visible) {
      Main.overview.hide();
    }
  }

  isDesktopVisible() {
    const window = global.display.focus_window;
    return window.get_window_type() === Meta.WindowType.DESKTOP;
  }

  getWindowToRestore() {
    const activeWorkspace = global.screen.get_active_workspace();
    let window = global.display.focus_window;

    // If no window is focused select the top of the stack
    if (window === null || window.get_window_type() === Meta.WindowType.DESKTOP) {
      // Get a list of windows and filter out the desktop
      let windowList = activeWorkspace.list_windows().filter(
        w => w.get_window_type() !== Meta.WindowType.DESKTOP
      );

      // Sort the windows by stacking order
      windowList = global.display.sort_windows_by_stacking(windowList);

      window = windowList.pop();
      if (window && !('get_maximized' in window)) {
        window = window.get_meta_window();
      }
    }

    return window;
  }

  toggleDesktopVisibility() {
    if (this.isDesktopVisible()) {
      this.minimizedWindows.forEach(window => {
        if (window.minimized) {
          window.unminimize();
        }
      });

      // Restore the appropriate window
      const windowToRestore = this.getWindowToRestore();
      if (windowToRestore) {
        windowToRestore.activate(global.get_current_time());
      }

      // Clear the list of minimized windows
      this.minimizedWindows = [];
    } else {
      const activeWorkspace = global.screen.get_active_workspace();
      const windows = activeWorkspace.list_windows();

      this.minimizedWindows = [];
      windows.forEach(window => {
        if (!window.skip_taskbar && !window.minimized) {
          this.minimizedWindows.push(window);
          window.minimize();
        }
      });
    }
  }
}
