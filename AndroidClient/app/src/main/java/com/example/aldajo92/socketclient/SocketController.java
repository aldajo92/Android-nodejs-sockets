package com.example.aldajo92.socketclient;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class SocketController implements Emitter.Listener {

    private Socket mSocket;
    private SocketView view;

    public SocketController(SocketView view) {
        this.view = view;
    }

    void connect(){
        try {
            mSocket = IO.socket("http://192.168.1.15:8080/");
        } catch (URISyntaxException e) {

        }

        mSocket.on("android-message", this);
        mSocket.connect();
    }

    void disconnect(){
        mSocket.disconnect();
        mSocket.close();
    }

    @Override
    public void call(Object... args) {
        String message = (String) args[0];
        view.onSocketDataArrive(message);
    }

    public interface SocketView{
        void onSocketDataArrive(String data);
    }
}
