// A lightweight(?) javascript gui for freeliner!

window.onload = function() {

    // globals
    var sendCMD, cmdPrompt, flData, selectedTemplate, selectedLayer, selectedLayerType, availableFiles;
    var messageIncrement = 0;
    // var chatDiv = document.getElementById("messages");
    // var jumpButton = document.getElementById("jump");
    var autoScroll = true;
    var DEFAULT_WEBSOCKET_ADDR = 'ws://127.0.0.1:8026/control';

    // Check if chat div is being manually scrolled and set autoscroll accordingly
    // TODO: add button to jump to newest messages if manually scrolling

    /*
    * /////////////////////////////////////////////////////////////
    * main or whatever
    * /////////////////////////////////////////////////////////////
    */

    // fetch the info at 200 ms intervals
    // setInterval(function() {
    //     actualySendCMD('control');
    // }, 2000);


    /*
    * /////////////////////////////////////////////////////////////
    * webSocket!
    * /////////////////////////////////////////////////////////////
    */

    // function sendCMD(_cmd) {
    //     actualySendCMD(_cmd);
    //     // display it!
    //     document.getElementById("logline").innerHTML = _cmd;
    // }

    // make a function to send commands through a websocket
    actualySendCMD = (function () {
        var socket, _addr;
        // _addr = prompt("connect to", DEFAULT_WEBSOCKET_ADDR);
        // if (_addr != null) socket = makeSocket(_addr);
        // else
        socket = makeSocket(DEFAULT_WEBSOCKET_ADDR);
        return function (_cmd) {
            if(socket.readyState) socket.send(_cmd);
        }
    })();

    // make a websocket
    function makeSocket(_adr) {
        var socket = new WebSocket(_adr);
        socket.onmessage = function (evt) {
            // parseInfo(evt.data);
            var _messageJSON = JSON.parse(evt.data);
            var _messageDiv;
            var _layerType;
            var _usernameDiv;
            var _contentDiv;

            _usernameDiv = document.createElement("div");
            _usernameDiv.className = "username";
            _usernameDiv.innerHTML = "<h4>" + _messageJSON.username + "</h4>";

            _contentDiv = document.createElement("div");
            _contentDiv.className = "content";
            _contentDiv.innerHTML = "<p>" + _messageJSON.content + "</p>";

            _messageDiv = document.createElement("div");
            // XXX (chris): HTML element ids should be unique to a single element
            // _messageDiv.id = ( (messageIncrement++) %2 === 1 ) ? "left" : "right" ;
            _layerType = ( (messageIncrement++) %2 === 1 ) ? "left" : "right";
            _messageDiv.classList.add("message");
            _messageDiv.classList.add(_layerType);
            _messageDiv.appendChild(_usernameDiv);
            _messageDiv.appendChild(_contentDiv);

            chatDiv.appendChild(_messageDiv);

            // Auto scrolling
            if ( autoScroll ) {
                chatDiv.scrollTop = chatDiv.scrollHeight;
            }
        }
        return socket;
    }


    // fetch json data
    function loadJSON(callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'freelinerData.json', true); // Replace 'my_data' with the path to your file
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    function popupCallbacks() {
        var _element;
        _element = document.getElementById("configureDisplay");
        if(!_element) return;
        _element.onclick = function () {
            document.getElementById("configPopup").style.display = 'block';
        }

        _element = document.getElementById("saveConfig");
        if(_element) _element.onclick = function () {
            var _width, _height, _fullscreen, _display, _pipeline;

            _width = document.getElementById("configWidth").value;
            _height = document.getElementById("configHeight").value;
            if(_width > 10) sendCMD("config width "+_width);
            if(_height > 10) sendCMD("config height "+_height);

            _fullscreen = 0;
            if(document.getElementById("fullscreenCheckBox").checked) _fullscreen = 1;
            sendCMD("config fullscreen "+ _fullscreen);

            _pipeline = 0;
            if(document.getElementById("pipelineCheckBox").checked) _pipeline = 1;
            sendCMD("config pipeline "+ _pipeline);

            _display = 1;
            if(document.getElementById("displaySpan").checked) _display = 0;
            else if(document.getElementById("displayOne").checked) _display = 1;
            else if(document.getElementById("displayTwo").checked) _display = 2;
            sendCMD("config display "+ _display);
            document.getElementById("configPopup").style.display = 'none';
            alert("restart freeliner!");
        }
        _element = document.getElementById("cancelConfig");
        if(_element) _element.onclick = function () {
            document.getElementById("configPopup").style.display = 'none';
        }
    }


    cmdPrompt = (function () {
        var cmdIndex, cmdHistory, cmdPrompt;
        cmdHistory = ["no previous cmd"];
        prompt = document.getElementById("prompt");
        return function (e) {
            if(e.keyCode == 13) {
                sendCMD(prompt.value);
                cmdHistory.push(prompt.value);
                prompt.value = "";
                cmdIndex = 0;
            }
            else if(e.keyCode == 38) {
                cmdIndex++;
                if(cmdIndex >= cmdHistory.length) cmdIndex = cmdHistory.length-1;
                prompt.value = cmdHistory[cmdHistory.length-1];
                prompt.value = cmdHistory[cmdHistory.length - cmdIndex];
            }
            else if(e.keyCode == 40) {
                cmdIndex--;
                if(cmdIndex < 1) cmdIndex = 1;
                prompt.value = cmdHistory[cmdHistory.length - cmdIndex];
            }
        }
    })();


    /*
    * /////////////////////////////////////////////////////////////
    * mouse section!
    * /////////////////////////////////////////////////////////////
    */


    /*
    * /////////////////////////////////////////////////////////////
    * keyboard section!
    * /////////////////////////////////////////////////////////////
    */

    // some keys returned weird codes, fix em here.
    function kbdRules(_event) {
        if(_event.keyCode == 13) return 10;
        else if(_event.keyCode == 173) return 45;
        else return _event.keyCode;
    }

    var shiftKeyPressed = false;
    // Keycode mapping
    const SHIFT_KEY = 16;
    const NEXT_MESSAGE_KEY = 32; // spacebar
    const VIEWERS_1_KEY = 90; // Z key
    const VIEWERS_2_KEY = 88; // X key
    const VIEWERS_5_KEY = 67; // C key
    const VIEWERS_10_KEY = 86; // V key
    const TIP_ADD_1_KEY = 49; // 1 key
    const TIP_ADD_2_KEY = 50; // 2 key
    const TIP_ADD_5_KEY = 51; // 3 key
    const TIP_ADD_10_KEY = 52; // 4 key
    const TIP_ADD_20_KEY = 53; // 5 key
    const TIP_ADD_40_KEY = 54; // 6 key
    const TIP_ADD_60_KEY = 55; // 7 key
    const TIP_ADD_100_KEY = 56; // 8 key
    const SILENT_TIP_KEY = 57; // 9 key

    // prevent keyboard default behaviors, for ctrl-_ tab
    document.addEventListener("keydown", function(e) {

        console.log('keyCode =>', e.keyCode);

        // Key press actions
        switch(e.keyCode) {
            case SHIFT_KEY:
                // Activate shift state
                shiftKeyPressed = true;
                break;
            case NEXT_MESSAGE_KEY:
                // trigger next chat message
                actualySendCMD("next");
                break;
            case VIEWERS_1_KEY:
                actualySendCMD(shiftKeyPressed ? 'viewers -1' : 'viewers 1');
                break;
            case VIEWERS_2_KEY:
                actualySendCMD(shiftKeyPressed ? 'viewers -2' : 'viewers 2');
                break;
            case VIEWERS_5_KEY:
                actualySendCMD(shiftKeyPressed ? 'viewers -5' : 'viewers 5');
                break;
            case VIEWERS_10_KEY:
                actualySendCMD(shiftKeyPressed ? 'viewers -10' : 'viewers 10');
                break;
            case TIP_ADD_1_KEY:
                actualySendCMD('tip 1');
                break;
            case TIP_ADD_2_KEY:
                actualySendCMD('tip 2');
                break;
            case TIP_ADD_5_KEY:
                actualySendCMD('tip 5');
                break;
            case TIP_ADD_10_KEY:
                actualySendCMD('tip 10');
                break;
            case TIP_ADD_20_KEY:
                actualySendCMD('tip 20');
                break;
            case TIP_ADD_40_KEY:
                actualySendCMD('tip 40');
                break;
            case TIP_ADD_60_KEY:
                actualySendCMD('tip 60');
                break;
            case TIP_ADD_100_KEY:
                actualySendCMD('tip 100');
                break;
            case SILENT_TIP_KEY:
                actualySendCMD('tip silent')
                break;
        }

    }, false);

    document.addEventListener("keyup", function(e) {
        // Remove shift state
        if (e.keyCode === SHIFT_KEY) {
            shiftKeyPressed = false;
        }
    }, false);

    // autofocus on ranges
    document.addEventListener("mouseover", function(e){
        if(e.target.type == "range") {
            e.target.focus();
        }
    });

    var nextButton = document.getElementById("nextButton");
    nextButton.onclick = function() {
        actualySendCMD("next");
    };

    var viewersButtons = document.getElementsByClassName('viewers-button');
    // Add viewers button events
    for (var i = 0; i < viewersButtons.length; i++) {
        var _button = viewersButtons[i];

        _button.addEventListener('click', function(event) {
            var _value = event.target.value;
            console.log('viewers ' + _value);
            actualySendCMD('viewers ' + _value);
        });
    }

    var tipButtons = document.getElementsByClassName('tip-jar-add');
    // Add tip button events
    for (var i = 0; i < tipButtons.length; i++) {
        var _button = tipButtons[i];

        _button.addEventListener('click', function(event) {
            var _value = event.target.value;

            console.log(event.target.name);
            if (event.target.name === 'add-tip-silent') {
                actualySendCMD('tip silent');
            } else {
                actualySendCMD('tip ' + _value);
            }
        });
    }

    // Util to check if HTML element has class
    function hasClass(element, className) {
        return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
    }
    

}
