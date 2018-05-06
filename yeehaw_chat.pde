import websockets.*;

WebsocketServer ws;
int now;
float x,y;

int WEBSOCKET_PORT = 8025;


ArrayList<String> messages;


int increment = 0;
int index = 0;
void setup(){
  size(200,200);
  ws= new WebsocketServer(this,WEBSOCKET_PORT,"/yeehaw");
  now=millis();
  x=0;
  y=0;
  loadFile("chat_file.txt");
}

void draw(){
    increment++;
    if(increment % 40 == 1){
        if(index < messages.size()){
            ws.sendMessage(messages.get(index++));
        }
        index %= messages.size();
    }

    background(0);
    ellipse(x,y,10,10);
}


void loadFile(String _fn){
    messages = new ArrayList();
    String[] _raw = loadStrings(_fn);
    String _buf = "";

    for(int i = 0; i < _raw.length; i++){
        if(_raw[i].contains("/chat")){
            if(!_buf.equals("")){
                messages.add(_buf);
            }
            String[] _ha = split(_raw[i], " ");
            _buf = "";
            if(_ha.length > 1){
                _buf+= _ha[1];
            }
            _buf +=" : ";
        }
        else {
            _buf += _raw[i];
        }
    }
    if(!_buf.equals("")){
        messages.add(_buf);
    }
    for(String _s : messages){
        println(_s);
    }
}


void webSocketServerEvent(String msg){
    println(msg);
    x=random(width);
    y=random(height);
}
