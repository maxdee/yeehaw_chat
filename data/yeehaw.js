// A lightweight(?) javascript gui for freeliner!

window.onload = function() {

    // globals
    var sendCMD, cmdPrompt, flData, selectedTemplate, selectedLayer, selectedLayerType, availableFiles;
    var messageIncrement = 0;
    var chatDiv = document.getElementById('messages');
    // var messagesDiv = this.document.getElementById('messages');
    var videoDiv = document.getElementById('video');
    var numViewers = 0;
    var tipAmount = 0;
    var jumpButton = document.getElementById('jump');
    var autoScroll = true;
    // Booth computer address on the LAN
    var DEFAULT_WEBSOCKET_ADDR = 'ws://192.168.0.102:8025/yeehaw';
    // Check if chat div is being manually scrolled and set autoscroll accordingly
    // TODO: add button to jump to newest messages if manually scrolling
    chatDiv.onscroll = function(event) {
        if ( (chatDiv.scrollTop + chatDiv.offsetHeight) >= chatDiv.scrollHeight - 50 ) {
            autoScroll = true;
            jumpButton.style.display = 'none';
        } else {
            autoScroll = false;
            jumpButton.style.display = 'block';
        }
    }

    /*
    * /////////////////////////////////////////////////////////////
    * main or whatever
    * /////////////////////////////////////////////////////////////
    */

    // ping websocket every 30 secs to prevent timeout
    setInterval(function() {
        actualySendCMD('ping');
    }, 10000);


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
            var _messageData = JSON.parse(evt.data);
            console.log(_messageData);

            // Handle chat messages
            switch(_messageData.type) {
                case 'chat':
                    updateChat(_messageData);
                    break;
                case 'viewers':
                    var _numViewers = parseInt(_messageData.viewers);
                    updateViewers(_numViewers);
                    break;
                case 'tip':
                    var _tipamount = parseInt(_messageData.amount);
                    addTip(_tipamount);
                    break;
                default:
                    console.log('Error: could not determine message type');
            }

        }
        return socket;
    }


    function updateChat(_messageObject) {
        var _usernameDiv = document.createElement("div");
        var _contentDiv = document.createElement("div");
        var _messageDiv = document.createElement("div");
        var _layerType = ( (messageIncrement++) %2 === 1 ) ? "left" : "right";

        _usernameDiv.className = "username";
        _usernameDiv.innerHTML = "<h4>" + _messageObject.username + "</h4>";
        _contentDiv.className = "content";
        _contentDiv.innerHTML = "<p>" + _messageObject.message + "</p>";
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


    function updateViewers(_num) {
        var _viewersHeading = document.getElementById('viewers');
        var _viewersSuffix; 

        // update viewer tally
        numViewers = (numViewers + _num > 0) ? numViewers + _num : 0;
        _viewersSuffix = ( numViewers === 1 ) ? ' viewer' : ' viewers';
        _viewersHeading.innerHTML = numViewers + _viewersSuffix;
    }


    function addTip(_amount) {
        var _tipAmountHeader = document.getElementById('tip-amount');

        // add to tip amount
        tipAmount += _amount;
        _tipAmountHeader.innerHTML = tipAmount;
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

    jumpButton.addEventListener('click', function(event) {
        chatDiv.scrollTop = chatDiv.scrollHeight;
        jumpButton.style.display = 'none';
    });

}
