

document.addEventListener('DOMContentLoaded', runEditor);

function runEditor() {

  if (window.location.href.indexOf("file://") === 0 && window.location.href.indexOf("pages/editor/index.html")) {

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

    function saveScript(callback) {
      if (isValidJS()) {
        lint()
        delay(function(){
          ipc.send('saveScript', editor.getValue());
          console.log("Saved");
          callback("Saved!")
        }, 500 );
      } else {
        console.log("Isn't saved because js is not correct");
        callback("Isn't saved because js is not correct")
      }
    }

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

    editor.execCommand("showKeyboardShortcuts");

    var delay = (function(){
      var timer = 0;
      return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
      };
    })();

    editor.commands.addCommand({
        name: 'save',
        bindKey: {win: "Ctrl-S", "mac": "Cmd-S"},
        exec: function(editor) {
            saveScript(function(res) {
              console.log(res);
            })
        }
    })

    settings.get('autoSave', function (isAutoSaveEnabled) {
      if (isAutoSaveEnabled) {
        editor.on("change", function(e) {
           if (editor.curOp && editor.curOp.command.name) {
             delay(function(){
               saveScript(function(res) {
                 console.log(res);
               })
             }, 2000 );
           }
         });
      } else {
        notifier.notify({
          'title': 'Monkey in Electron!',
          'message': 'You can active auto save in preferences.'
        });
      }
    });
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

    socket.on('url', function(arg) {
      if (arg.status) {
        editor.setValue(arg.response.script.trim())
      } else {
        // alert(arg)
        var defaultCode = ["// ==UserScript==", "// @name         " + arg.details + ' Script', "// @version      1.0.0", '// @description  try to take over the world!', '// @match        ' + arg.url, '// @enabled      true', '// ==/UserScript==', '', '(function mie() {', '    alert("Mie is working well!")', '})();']
        defaultCode = defaultCode.join("\n");
        editor.setValue(defaultCode);
      }
    })
  } else {
    socket.on('url', function(arg) {
      console.log("There isnt any script yet," + window.location.href);
      if (arg.status) {
        var code = arg.response.executable.code;
        console.log(arg);
        if (arg.executable.enabled) {
          eval(code);
        } else {
          console.log("There is a executable script but does not enabled.");
        }
      }
    })
  }
}
