var socket = io.connect();
//======================
//Dashboard Informations
//======================
//Updating player name
socket.on('updateUsername', function(data) {
    document.getElementById("mcusername").innerHTML = '<img hight="10%" width="10%" src="https://mc-heads.net/head/' + data + '"> ' + data;document.getElementById("chatusername").innerHTML = data;
});
//Updating controller name
socket.on('updateController', function(data) {
    document.getElementById("mccontroller").innerHTML = '<img hight="10%" width="10%" src="https://mc-heads.net/head/' + data + '"> ' + data;
});
//Updating health
socket.on('updateHealth', function(data) {
    document.getElementById("health").style.width = Math.round(data) * 5 + '%';
    document.getElementById("healthtext").innerHTML = Math.round(data) + '/20';
});
//Updating hunger
socket.on('updateHunger', function(data) {
    document.getElementById("hunger").style.width = Math.round(data) * 5 + '%';
    document.getElementById("hungertext").innerHTML = Math.round(data) + '/20';
});

//Queue information and connection times
socket.on('updateQueuePosition', function(data) {
    document.getElementById("mcposition").innerHTML = data;
});
socket.on('updateETA', function(data) {
    document.getElementById("mcwaittime").innerHTML = data.slice(-11);
});
socket.on('updateUptime', function(data) {
    document.getElementById("serverUptime").innerHTML = data;
});
socket.on('updateETALabel', function(data) {
    document.getElementById("waittimecompleted").innerHTML = data;
});
socket.on('updateCurrentServer', function(data) {
    document.getElementById("currentserver").innerHTML = data;
});

socket.on('serverInfo', function(data) {
	let img = document.createElement('img');
	img.src = "https://mc-heads.net/body/" + data + ".png";
	document.getElementById("testio").appendChild(img);
	
});

//=========
//Whitelist
//=========
let whitelist = ""
socket.on('updateWhitelist', function(tableData) {
    var whitelist = tableData;
    var bodyString = '';
    $.each(whitelist, function(index, names) {
        bodyString += ('<tr><td>' + names + '</td></tr>');
    });
    $('.whitelistTable tbody').html(bodyString);
});
var whitelistform = document.getElementById('whitelistform');
var whitelistinput = document.getElementById('whitelistinput');
whitelistform.addEventListener('submit', function(e) {
    e.preventDefault();
    if (whitelistinput.value) {
        socket.emit('addToWhitelist', whitelistinput.value);
        whitelistinput.value = '';
    }
});
document.getElementById("delwhitelist").addEventListener("click", function() {
    socket.emit("deleteLastWhitelist");
});
//======================
//All to do with chatBox
//======================
//Chat utiliy buttons

document.getElementById("scroll-lock").addEventListener("click", function () {
	scrollLockToggle();
});
document.getElementById("webTerminal").addEventListener("click", function () {
	PopWindowOne();
	socket.emit('openWebterminal');
});
function PopWindowOne()
{
    floatingWindow = window.open("terminal.html","","height=480,width=853.33,scrollbars=no");
}
//functions
var scrollLocked = true;
function scrollLock() {
    if (scrollLocked) {
        var objDiv = document.getElementById("serverchat");
        objDiv.scrollTop = objDiv.scrollHeight;
    }
}
function scrollLockToggle() {
    if (scrollLocked) {
        scrollLocked = false;
    } else {
        scrollLocked = true;
    }
}
//Load all thats been saved since server started. Not a good to load the entire chat
socket.on('updateStoredChat', function(data) {
    let serverChat = document.getElementById("serverchat");
    while (serverChat.firstChild) {
        serverChat.removeChild(serverChat.lastChild);
    }
    data.forEach((item) => {
        let time = item[0]
        let name = item[1]
        let message = item[2]
        let box = document.createElement("div");
        let imgTime = document.createElement("div");
        let received = document.createElement("div");
        let timeStamp = document.createElement("div");
        let sender = document.createElement("div");
        let img = document.createElement("img");
        img.classList.add('profile-image');
        box.classList.add('chat-message-left', 'pb-4');
        sender.classList.add('flex-shrink-1', 'bg-light', 'rounded', 'py-2', 'px-3', 'ml-3');
        received.classList.add('font-weight-bold', 'mb-1');
        timeStamp.innerHTML = time; //time
        received.innerHTML = name; //name
        sender.innerHTML = message; //message
        img.src = 'https://mc-heads.net/avatar/' + name + '.png';
        imgTime.appendChild(img);
        imgTime.appendChild(timeStamp);
        box.appendChild(imgTime);
        received.appendChild(sender);
        box.appendChild(received);
        serverChat.appendChild(box);
    });
    scrollLock();
});
//Update the chatbox as we receive messages
socket.on('updateWebChatLog', function(data) {
    let serverChat = document.getElementById("serverchat");
    let chatLog = [];
    chatLog.push(data);
    chatLog.forEach((item) => {
        let time = item[0]
        let name = item[1]
        let message = item[2]
        let box = document.createElement("div");
        let imgTime = document.createElement("div");
        let received = document.createElement("div");
        let timeStamp = document.createElement("div");
        let sender = document.createElement("div");
        let img = document.createElement("img");
        img.classList.add('profile-image');
        box.classList.add('chat-message-left', 'pb-4');
        sender.classList.add('flex-shrink-1', 'bg-light', 'rounded', 'py-2', 'px-3', 'ml-3');
        received.classList.add('font-weight-bold', 'mb-1');
        timeStamp.innerHTML = time; //time
        received.innerHTML = name; //name
        sender.innerHTML = message; //message
        img.src = 'https://mc-heads.net/avatar/' + name + '.png';
        imgTime.appendChild(img);
        imgTime.appendChild(timeStamp);
        box.appendChild(imgTime);
        received.appendChild(sender);
        box.appendChild(received);
        serverChat.appendChild(box);
    });
    scrollLock();
});
//Send messages
var chatForm = document.getElementById('chatForm');
var chatInput = document.getElementById('chatInput');
chatForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if (chatInput.value) {
        socket.emit('chat message', chatInput.value);
        chatInput.value = '';
    }
});
//=======
//Exports
//=======
