var connected = false;
var socket;

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("connect").addEventListener("click", connect);
    document.getElementById("send").addEventListener("click", sendMessage);

    document.getElementById("name").addEventListener("keypress", function (event) {
        if (event.keyCode === 13 || event.which === 13) {
            connect();
        }
    });

    document.getElementById("msg").addEventListener("keypress", function (event) {
        if (event.keyCode === 13 || event.which === 13) {
            sendMessage();
        }
    });
});

var connect = function () {
    if (!connected) {
        var name = document.getElementById("name").value;
        if (name.trim() === "") {
            alert("Please enter your name.");
            return;
        }

        socket = new WebSocket("ws://" + location.host + "/chat/" + name);

        socket.onopen = function () {
            connected = true;
            document.getElementById("send").disabled = false;
            document.getElementById("connect").disabled = true;
            document.getElementById("name").disabled = true;
            document.getElementById("msg").focus();
        };

        socket.onmessage = function (m) {
            const data = JSON.parse(m.data);
            const { username, icon, message } = data;

            const chatBox = document.getElementById("chat");
            const formattedMessage = `
                    <div class="flex items-center mb-2">
                        <div class="flex items-center justify-center w-7 h-7 rounded-full bg-blue-700 text-white font-bold mr-3">
                            ${icon}
                        </div>
                        <div>
                            <strong>${username}:</strong> ${message}
                        </div>
                    </div>
                `;
            chatBox.innerHTML += formattedMessage;
            chatBox.scrollTop = chatBox.scrollHeight;
        };
    }
};

var sendMessage = function () {
    if (connected) {
        var value = document.getElementById("msg").value;
        if (value.trim() === "") {
            alert("Please enter a message.");
            return;
        }
        socket.send(value);
        document.getElementById("msg").value = "";
    }
};