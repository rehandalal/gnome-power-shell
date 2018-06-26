import { getSettings } from 'lib/convenience';

import ToggleDesktopButton from './button';
import { SETTINGS_KEY_POSITION } from './constants';

const Shell = imports.gi.Shell
const Gtk = imports.gi.Gtk;
const Me = imports.misc.extensionUtils.getCurrentExtension();

let button;
let settings;
const settingsSignals = [];

export function init(metadata) {
  settings = getSettings();
  Gtk.IconTheme.get_default().append_search_path(Me.dir.get_child('icons').get_path())
}

export function enable() {
  const position = settings.get_string(SETTINGS_KEY_POSITION);

  button = new ToggleDesktopButton({
    position,
  });

  settingsSignals.push(
    settings.connect('changed::' + SETTINGS_KEY_POSITION, cycle)
  );
};

export function disable() {
  settings.disconnect(settingsSignals);
  button.destroy();
  button = null;
};

function cycle() {
  if (button) {
    disable();
    enable();
  }
}
