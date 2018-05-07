// A lightweight(?) javascript gui for freeliner!

// globals
var sendCMD, cmdPrompt, flData, selectedTemplate, selectedLayer, selectedLayerType, availableFiles;

var messageIncrement = 0;

/*
 * /////////////////////////////////////////////////////////////
 * main or whatever
 * /////////////////////////////////////////////////////////////
 */

// fetch the info at 200 ms intervals
setInterval(function() {
    actualySendCMD('ping');
}, 2000);

window.onload = function () {
    // if(typeof InstallTrigger == 'undefined') setInfo("browser not supported, plz use firefox or ?");
}


/*
 * /////////////////////////////////////////////////////////////
 * webSocket!
 * /////////////////////////////////////////////////////////////
 */

function sendCMD(_cmd) {
    actualySendCMD(_cmd);
    // display it!
    document.getElementById("logline").innerHTML = _cmd;
}

// make a function to send commands through a websocket
actualySendCMD = (function () {
    var socket, _addr, DEFAULT_WEBSOCKET_ADDR;
    DEFAULT_WEBSOCKET_ADDR = 'ws://' + window.location.hostname + ':8025/yeehaw';
    // _addr = prompt("connect to", DEFAULT_WEBSOCKET_ADDR);
    // if (_addr != null) socket = makeSocket(_addr);
    // else
    socket = makeSocket(DEFAULT_WEBSOCKET_ADDR);
    return function (_cmd) {
        if(socket.readyState) socket.send(_cmd);
        else setInfo("start freeliner and refresh to connect");
    }
})();

// make a websocket
function makeSocket(_adr) {
    var socket = new WebSocket('ws://127.0.0.1:8025/yeehaw');
    socket.onopen = function() {
        populateGUI();
    }
    socket.onmessage = function (evt) {
        // parseInfo(evt.data);
        var _messageJSON = JSON.parse(evt.data);
        var _chat = document.getElementById("chat");
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

        _chat.appendChild(_messageDiv);
        // TODO: fix this so that the user can scroll freely without being sent back to bottom
        _chat.scrollTop = _chat.scrollHeight;

        console.log('message =>', evt.data);
    }
    return socket;
}

// called when the socket opens, this way we get fresh info from freeliner
function populateGUI() {
    loadJSON(function(response) {
        flData = JSON.parse(response);
        actualySendCMD("fetch-ws files");
        makeTemplateSelector();
        // creates appropriate input elements for keys present in html
        loadKeys();
        // loads options into menus
        updateMenus();
        // add callbacks to other misc
        otherInputCallbacks();
        popupCallbacks();
        // shaderSliderCallbacks();
        // colorsCallbacks();
        // updateLayerStack();
    });
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

function setInfo(_info) {
    document.getElementById("infoline").innerHTML = _info.replace('info', '');
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

// prevent keyboard default behaviors, for ctrl-_ tab
document.addEventListener("keydown", function(e) {
    // catch ctrlKey
    // if ((navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) e.preventDefault();
    // prevent default for tab key
    // if(e.keyCode == 9) e.preventDefault();
    if (document.activeElement == document.getElementById("prompt")) cmdPrompt(e);
    // else if (document.activeElement != document.getElementById("layerNameInput")) {
    //     blurAll();
    //     actualySendCMD('hid press '+kbdRules(e)+" "+e.key);
    // }

    //send keyPress to freeliner
}, false);

document.addEventListener("keyup", function(e) {
    // catch ctrlKey
    // if ((navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) e.preventDefault();
    // prevent default for tab key
    // if(e.keyCode == 9) e.preventDefault();
    //send keyRelease to freeliner
    // actualySendCMD('hid release '+kbdRules(e)+" "+e.key);
}, false);

// autofocus on ranges
document.addEventListener("mouseover", function(e){
    if(e.target.type == "range") {
        e.target.focus();
    }
});
