const Me = imports.misc.extensionUtils.getCurrentExtension();
const Package = Me.imports.package;

function init(metadata) {
  Package.ext.init(metadata);
}

function enable() {
  Package.ext.enable();
}

function disable() {
  Package.ext.disable(arguments);
}
