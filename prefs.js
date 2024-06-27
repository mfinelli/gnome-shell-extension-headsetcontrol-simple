import Gio from "gi://Gio";
import Adw from "gi://Adw";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class ExamplePreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    // Create a preferences page, with a single group
    const page = new Adw.PreferencesPage({
      title: _("General"),
      icon_name: "dialog-information-symbolic",
    });
    window.add(page);

    const group = new Adw.PreferencesGroup({
      title: _("Appearance"),
      description: _("Configure the appearance of the extension"),
    });
    page.add(group);

    // Create a new preferences row
    const row = new Adw.SwitchRow({
      title: _("Notify on Low Battery"),
      subtitle: _("Whether to send a notification when the battery is low"),
    });
    group.add(row);

    // Create a settings object and bind the row to the `show-indicator` key
    window._settings = this.getSettings();
    window._settings.bind(
      "notify-low-battery",
      row,
      "active",
      Gio.SettingsBindFlags.DEFAULT,
    );
  }
}
