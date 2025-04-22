let currentSong = new Audio();
let songs;
let currFolder;
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith("mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1].replaceAll("%20", " "));
        }
    }
    //show all songs in the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML += `<li><img class="invert" src="img/music.svg" alt="">
                           <div class="info">
                               <div>${song}</div>
                               <div>dummy</div>
                           </div>
                           <div class="playnow">
                               <span>Play now</span>
                               <img class="invert" src="img/play.svg" alt="">
                           </div>
                           </li>`;
    }
    //attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", (element) => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })

    })

    return songs
}
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    // Round to nearest whole second
    const totalSeconds = Math.round(seconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    // Format with leading zeros
    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}


const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}
async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];         
        if (e.href.includes("/songs") && !e.href.includes(".DS_Store") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0]
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}

async function main() {
    songs = await getSongs("songs/happy_hits");
    playMusic(songs[0], true);
    await displayAlbums();
    play.addEventListener("click", e => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })
    currentSong.addEventListener("timeupdate", e => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    })
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((percent * currentSong.duration) / 100);

    })
    document.querySelector(".hamburger").addEventListener('click', e => {
        document.querySelector(".left").style.left = 0;
        document.querySelector(".close").addEventListener('click', e => {
            document.querySelector(".left").style.left = "-120%";
        })
    })
    previous.addEventListener("click", e => {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1].replaceAll("%20", " "));
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    })
    next.addEventListener("click", e => {
        let index = songs.indexOf(currentSong.src.split(`/${currFolder}/`)[1].replaceAll("%20", " "));
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    })
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    })
   document.querySelector(".volume img").addEventListener("click",e=>{
    if(e.target.src.includes("img/volume.svg")){
        e.target.src = "img/mute.svg";
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else
    {
        e.target.src = "img/volume.svg";
        currentSong.volume = 0.10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
   }
})
}
main();
