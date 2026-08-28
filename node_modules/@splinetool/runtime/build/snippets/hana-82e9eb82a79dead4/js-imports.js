
export async function loadImageFromBytes(bytes) {
    const blob = new Blob([bytes])
    const url = URL.createObjectURL(blob)
    return createImageBitmap(blob).finally(() => {
      URL.revokeObjectURL(url)
    })
}

export async function loadImageFromUrl(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            return response.blob();
        })
        .then(blob => createImageBitmap(blob));
}

// Video Imports
function setupVideo(video) {
    video.preload = "auto"; 
    video.autoplay = true; //iOs hack to show the first frame
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.currentTime = 0.01;
    video.load();

    video.onloadeddata = () => {
        video.muted = true;
        // DOMException: The play() request was interrupted by a new load request.
        // https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
        const playPromise = video.play();

        if (playPromise !== undefined) {
            playPromise
                .then((_) => {
                    // Automatic playback started! Do nothing all good!
                })
                .catch(() => {
                    // for some reason the video could not be played (The play() request was interrupted by a new load request.)
                    // so let's try to play it again
                    video.play();
                }).finally(() => {
                    video.pause();
                });
        }
    };

    let copyVideo = false;
    video.addEventListener("playing", function() {
        copyVideo = true;
    }, true);

    return new Promise((resolve) => {
        const checkVideo = () => {
            if (copyVideo) {
                resolve(video);
            } else {
                setTimeout(checkVideo, 10);
            }
        };
        checkVideo();
    });
} 


export async function loadVideoFromBytes(bytes) {
    const blob = new Blob([bytes])
    const video = document.createElement('video');
    video.src = URL.createObjectURL(blob);
    return setupVideo(video);
}


export async function loadVideoFromUrl(url) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch video: ${response.statusText}`);
            }
            return response.blob();
        })
        .then(async blob => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(blob);
            return setupVideo(video);
        });
}


