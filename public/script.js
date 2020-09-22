const socket = io('/');
const videoGrid = document.getElementById('video-frame');

const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
})

const streamPayload = {
    video: { height: 300, width: 400 },
    audio: true
}

let myVideoStream;
const myVideo = document.createElement('video');
myVideo.muted = true;
const peers = {}

const getUserStream = async () => {
    myVideoStream = await navigator.mediaDevices.getUserMedia(streamPayload);
    addVideoStream(myVideo,myVideoStream);
    peer.on('call', call => {
        call.answer(myVideoStream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video,userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        connectToNewUser(userId, myVideoStream)
    })
}

getUserStream();

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
        addVideoStream(video,userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video,stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        document.querySelector('.main__controls-wrapper.mute i').className = "unmute fas fa-microphone-slash";
    } else {
        document.querySelector('.main__controls-wrapper.mute i').className = "fas fa-microphone";
        myVideoStream.getAudioTracks()[0].enabled = true;

    }
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        document.querySelector('.main__controls-wrapper.video i').className = "stop fas fa-video-slash";

    } else {
        document.querySelector('.main__controls-wrapper.video i').className = "fas fa-video";
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}
