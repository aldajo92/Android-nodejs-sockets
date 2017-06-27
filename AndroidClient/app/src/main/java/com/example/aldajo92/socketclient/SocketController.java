package com.example.aldajo92.socketclient;

import org.json.JSONException;
import org.json.JSONObject;

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
            mSocket = IO.socket("http://192.168.1.14:8090/");
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
        JSONObject data = (JSONObject) args[0];
        try {
            String message = data.getString("portname") + " " + data.getString("gross");
            view.onSocketDataArrive(message);
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public interface SocketView{
        void onSocketDataArrive(String data);
    }
}
