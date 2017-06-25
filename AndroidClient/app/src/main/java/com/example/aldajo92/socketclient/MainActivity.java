package com.example.aldajo92.socketclient;

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.widget.TextView;

import butterknife.BindView;
import butterknife.ButterKnife;

public class MainActivity extends AppCompatActivity implements SocketController.SocketView {

    @BindView(R.id.message)
    TextView textViewMessage;

    SocketController socketController;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ButterKnife.bind(this);

        socketController = new SocketController(this);
        socketController.connect();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        socketController.disconnect();
    }

    @Override
    public void onSocketDataArrive(String data) {
        addTextMessage(data);
    }

    private void addTextMessage(final String message) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                textViewMessage.append("\n" + message);
            }
        });
    }
}
