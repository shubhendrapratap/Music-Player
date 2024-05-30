console.log("Lets play song")
let currentSongs = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}


async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                        <div class="info">
                            <div>${song.replaceAll("%20", " ")}</div>
                            <div>Song Artist</div>
                        </div>
                        <div class="playnow">
                            <span>Play Now</span>
                            <img class="invert" src="img/play.svg" alt="">
                        </div>  </li>`;
    }

    //attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

    return songs


}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentSongs.src = `/${currFolder}/` + track
    if (!pause) {
        currentSongs.play()
        play.src = "img/pause.svg"

    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"



}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    // console.log(cardContainer)
    let array = Array.from(anchors)
    for(let index = 0; index<array.length; index++){

        const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-2)[1]
            //get the meta data of the folder
            // console.log(e)
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`)
            
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML +`<div data-folder="${folder}"  class="card ">
                <div  class="play">
                    <svg width="30px" height="30px" viewBox="0 0 24 24" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="#1C274C" stroke-width="1.5" />
                        <path
                            d="M15.4137 10.941C16.1954 11.4026 16.1954 12.5974 15.4137 13.059L10.6935 15.8458C9.93371 16.2944 9 15.7105 9 14.7868L9 9.21316C9 8.28947 9.93371 7.70561 10.6935 8.15419L15.4137 10.941Z"
                            stroke="#1C274C" stroke-width="1.5" />
                    </svg>
                </div>

                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>    
            </div>`
        }
    }

    //load the library whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item, item.currentTarget.dataset)
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            // for(let i = 0; i<songs.length; i++)
                playMusic(songs[0])
        })
    })
}

async function main() {
    songs = await getSongs("songs/maitrika_playlist");
    // for(let i = 0; i<songs.length; i++)
    //     console.log(songs[i])
        playMusic(songs[0], true)
    // console.log(songs)
    // display all the album on the page
    await displayAlbums()

    // attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSongs.paused) {
            currentSongs.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSongs.pause()
            play.src = "img/play.svg"
        }
    })
    // var audio = new Audio(songs[0]);
    // // audio.play();

    //listen for timeupdate event
    currentSongs.addEventListener("timeupdate", () => {
        console.log(currentSongs.currentTime, currentSongs.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSongs.currentTime)}
        /${secondsToMinutesSeconds(currentSongs.duration)}`
        document.querySelector(".circle").style.left = (currentSongs.currentTime / currentSongs.duration) * 100 + "%";
    })

    // add an event to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSongs.currentTime = ((currentSongs.duration) * percent) / 100
    })

    // add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // add an event listener for close icon
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add event listener to previous 
    previous.addEventListener("click", () => {
        console.log("Previous clicked")

        let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0])

        console.log(songs, index)
        if ((index - 1) >= 0){

            playMusic(songs[index - 1])
            
        }
    })

    // Add event listener to  next
    next.addEventListener("click", () => {
        currentSongs.pause()
        console.log("Next clicked")
        let index = songs.indexOf(currentSongs.src.split("/").slice(-1)[0])

        console.log(songs, index)
        if(index + 1 < songs.length)
        {
            playMusic(songs[index + 1])
        

        }
    })

    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(e, e.target.value)
        currentSongs.volume = parseInt(e.target.value) / 100
    })

    // add evenlistner to mute the track
    document.querySelector(".volume >img").addEventListener("click", e=>{
        console.log(e.target)
        if(e.target.src.includes("img/volume.svg")){
            e.target.src= e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSongs.volume =0
            document.querySelector(".range").getElementsByTagName("input")[0].value =0
        }else{
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentSongs.volume =.5
            document.querySelector(".range").getElementsByTagName("input")[0] = 50
        }
    })


}


main()

