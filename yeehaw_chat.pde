import http.*;
import websockets.*;
import oscP5.*;
import netP5.*;
import processing.sound.*;

OscP5 oscP5;
NetAddress myRemoteLocation;

SimpleHTTPServer server;
WebsocketServer chatSocket;
WebsocketServer controlSocket;

int now;
float x,y;

int WEBSOCKET_PORT = 8025;
int HTTPSERVER_PORT = 8000;
ArrayList<String> messages;

SoundFile tipJarSound;

int increment = 0;
int index = 0;
void setup(){
    size(200, 200);
    oscP5 = new OscP5(this, 8000);
    myRemoteLocation = new NetAddress("127.0.0.1", 9000);
    server = new SimpleHTTPServer(this, HTTPSERVER_PORT);
    server.serveAll("", sketchPath()+"/data");
    chatSocket = new WebsocketServer(this, WEBSOCKET_PORT,"/yeehaw");
    controlSocket = new WebsocketServer(this, WEBSOCKET_PORT+1,"/control");
    tipJarSound = new SoundFile(this, "assets/sounds/spitoon.wav");

    now = millis();
    x = 0;
    y = 0;
    loadFile("chat_file.txt");
}

void draw() {
    background(0);
    ellipse(x,y,10,10);
}

void keyPressed( ){
    if(key == 32) {
        nextMessage();
    }
}


void nextMessage() {
    if(index < messages.size()) {
        chatSocket.sendMessage(messages.get(index));
        println(messages.get(index));
        index++;
    }
    index %= messages.size();
}

void updateViewers(int _numViewers) {
    // Construct viewers message JSON
    String _viewersObject = "{ "
        + "\"type\": \"viewers\", "
        + "\"viewers\": \"" + _numViewers + "\""
    + " }";
    println(_viewersObject);
    chatSocket.sendMessage(_viewersObject);
}


void addToTipJar(String _tipAmount) {
    String _tipObject;

    if (_tipAmount.equals("silent")) {
        _tipAmount = "1";
        // Construct tip message JSON
        _tipObject = "{ "
            + "\"type\": \"tip\", "
            + "\"amount\": \"" + _tipAmount + "\""
        + " }";
        println(_tipObject);
        chatSocket.sendMessage(_tipObject);
    } else {
        // Construct tip message JSON
        _tipObject = "{ "
            + "\"type\": \"tip\", "
            + "\"amount\": \"" + _tipAmount + "\""
        + " }";
        println(_tipObject);
        println("loud");
        tipJarSound.play();
        chatSocket.sendMessage(_tipObject);
    }
}


void loadFile(String _fn){
    messages = new ArrayList();
    String[] _raw = loadStrings(_fn);
    String _buf = "";

    // Construct chat message JSON
    for (int i = 0; i < _raw.length; i++){
        if (_raw[i].contains("/chat")){
            if (!_buf.equals("")) {
                messages.add(_buf);
            }
            String[] _ha = split(_raw[i], " ");
            _buf = "{ \"type\": \"chat\", ";
            if (_ha.length > 1) {
                _buf += "\"username\": \"" + _ha[1] + "\", ";
            }
        }
        else {
            _buf += "\"message\": \"" + _raw[i] + "\" }";
        }
    }
    if (!_buf.equals("")) {
        messages.add(_buf);
    }
    for (String _s : messages) {
        println(_s);
    }
}


void webSocketServerEvent(String msg){
    println(msg);

    // split message args
    String[] _message = split(msg, " ");
    String _messageType = _message[0];

    // Trigger next message
    if (_messageType.equals("next")) {
        nextMessage();
    }

    // Add or remove viewers
    if (_messageType.equals("viewers")) {
        int _numViewers = int(_message[1]);
        updateViewers(_numViewers);
    }

    if (_messageType.equals("tip")) {
        String _tipAmount = _message[1];
        addToTipJar(_tipAmount);
    }

    x=random(width);
    y=random(height);
}

void sendOSCMessage() {
    /* in the following different ways of creating osc messages are shown by example */
    OscMessage myMessage = new OscMessage("/test");

    myMessage.add(123); /* add an int to the osc message */

    /* send the message */
    oscP5.send(myMessage, myRemoteLocation);
}

/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {
    /* print the address pattern and the typetag of the received OscMessage */
    print("### received an osc message.");
    print(" addrpattern: "+theOscMessage.addrPattern());
    println(" typetag: "+theOscMessage.typetag());

    if(theOscMessage.checkAddrPattern("/chat/next")==true) {
        nextMessage();
    }
    else if(theOscMessage.checkAddrPattern("/chat/prev")==true){
        println("PREVIOUS MESSAGE QUEUE, NOT IMPLEMENTED");
    }
    else {
        println(theOscMessage);
    }
}
