

document.addEventListener('DOMContentLoaded', runEditor);

function runEditor() {


  if (window.location.href.indexOf("file://") === 0 ) {

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
              ipc.send('saveScript', editor.getValue());
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

    var renderer = electron.ipcRenderer

    socket.on('connect', function(){
      console.log("Socket connected");
    });
    socket.on('event', function(data){
      console.log(data);
    });
    socket.on('disconnect', function(){
      console.log("Socket disconnected");
    });

    socket.on('url', function(arg) {
      // alert(JSON.stringify(arg))
      if (arg.status) {
        editor.setValue(arg.response.script.trim())
      } else {
        // console.log(':)');
      }
    })



  }


}
