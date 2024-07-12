/*!
 * gnome-shell-extension-headsetcontrol-simple
 * Copyright (C) 2024  Mario Finelli
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import Clutter from "gi://Clutter";
import GLib from "gi://GLib";
import GObject from "gi://GObject";
import Gio from "gi://Gio";
import St from "gi://St";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import * as Main from "resource:///org/gnome/shell/ui/main.js";

const Indicator = GObject.registerClass(
  class Indicator extends PanelMenu.Button {
    _init() {
      super._init(0.0, _("Headset Control"));

      let box = new St.BoxLayout({
        vertical: false,
        style_class: "panel-status-menu-box",
      });

      let icon = new St.Icon({
        icon_name: "audio-headset-symbolic",
        style_class: "system-status-icon",
      });

      this.label = new St.Label({
        text: "",
        x_expand: true,
        x_align: Clutter.ActorAlign.END,
        y_expand: true,
        y_align: Clutter.ActorAlign.CENTER,
      });

      box.add_child(icon);
      box.add_child(this.label);
      this.add_child(box);

      let item = new PopupMenu.PopupMenuItem(_("Show Notification"));
      item.connect("activate", () => {
        Main.notify(_("Whatʼs up, folks?"));
      });
      this.menu.addMenuItem(item);

      let that = this;
      this.timer = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 5, () => {
        that._getStatus();
        return GLib.SOURCE_CONTINUE;
      });
    }

    // https://gjs.guide/guides/gio/subprocesses.html#complete-examples
    async _getStatus() {
      try {
        // TODO: put this somewhere where we don't re-eval it every time...
        const cmd = "/usr/bin/headsetcontrol -b -o json";

        const [result, argv] = GLib.shell_parse_argv(cmd);
        if (!result) {
          throw "Command parse error!";
        }

        const proc = Gio.Subprocess.new(
          argv,
          Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE,
        );

        const [stdout, stderr] = await proc.communicate_utf8_async(null, null);

        if (proc.get_successful()) {
          const output = JSON.parse(stdout);
          const numDevices = output.device_count;
          let pcts = 0;
          let atLeastOne = false;

          output.devices.forEach((device) => {
            if (device.battery.level !== -1) {
              atLeastOne = true;
              pcts += device.battery.level;
            }
          });

          const pct = Math.floor(pcts / numDevices);
          if (atLeastOne) {
            this.label.set_text(_("%d%").format(pct));
          } else {
            this.label.set_text("");
          }
        } else {
          throw new Error(stderr);
        }
      } catch (err) {
        // TODO: do something
      }
    }
  },
);

export default class IndicatorExampleExtension extends Extension {
  enable() {
    this._indicator = new Indicator();
    Main.panel.addToStatusArea(this.uuid, this._indicator);
  }

  disable() {
    this._indicator.destroy();
    this._indicator = null;

    GLib.Source.remove(this.timer);
    this.timer = null;
  }
}
