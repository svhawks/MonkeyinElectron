var socket = io();
ace.require("ace/ext/language_tools");
var editor = ace.edit("editor"); // get reference to editor
editor.session.setMode("ace/mode/javascript");
editor.getSession().setUseSoftTabs(true);
editor.setTheme("ace/theme/twilight");
editor.$blockScrolling = Infinity;
editor.setOptions({
    enableBasicAutocompletion: true,
    enableSnippets: true,
    enableLiveAutocompletion: false
});

// Save
editor.commands.addCommand({
    name: 'save',
    bindKey: {win: "Ctrl-S", "mac": "Cmd-S"},
    exec: function(editor) {
        // console.log("saving", editor.session.getValue())
        console.log("Save your code");
        if (isValidJS()) {
          lint()
          socket.emit('saveScript', editor.getValue());
        } else {
          console.log("Js is not correct.");
        }

    }
})
// Shortcuts
editor.commands.addCommand({
    name: "showKeyboardShortcuts",
    bindKey: {win: "Ctrl-Alt-h", mac: "Command-Alt-h"},
    exec: function(editor) {
        ace.config.loadModule("ace/ext/keybinding_menu", function(module) {
            module.init(editor);
            // editor.showKeyboardShortcuts() // For show first.
        })
    }
})
editor.execCommand("showKeyboardShortcuts")

// For embed
// editor.setAutoScrollEditorIntoView(true);
// editor.setOption("maxLines", 30);


function isValidJS() {
   try {
       eval("throw 0;" + editor.getValue());
   } catch(e) {
       if (e === 0)
           return true;
   }
   return false
}

function lint() {
  console.log("Lint your code");
  var val = editor.getValue();
  var array = val.split(/\n/);
  array[0] = array[0].trim();
  val = array.join("\n");
  val = js_beautify(val);
  editor.setValue(val);
}

socket.on('url', function (res) {
  if (res.status) {
    editor.setValue(res.response.script.trim())
    // console.log(res);
  } else {
    // console.log(':)');
  }
});
