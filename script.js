let currentsong = new Audio();
let songs;
let currfolder;

function sectomin(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    let min = Math.floor(seconds / 60)
    let remainsec = Math.floor(seconds % 60)

    let formatmin = String(min).padStart(2, '0')
    let formatremainsec = String(remainsec).padStart(2, '0')

    return `${formatmin} : ${formatremainsec}`
}

async function getsongs(folder) {
    try {
        currfolder = folder
        let response = await fetch(`https://github.com/yashrmalhotra/spotify-clone/tree/main/songs/${folder}`);
    
        let html = await response.text();

        let div = document.createElement('div');
        div.innerHTML = html;
        let as = div.getElementsByTagName("a");
       
        songs = [];
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            
            if (element.href.endsWith(".mp3")) {
              
                songs.push(element.href.split(`/${folder}/`)[1]);


            }
            
        }
        let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0]
        songUl.innerHTML = ""
        for (const song of songs) {
            let decoded = song.replaceAll("%20", " ").split(".mp3")[0]
            songUl.innerHTML = songUl.innerHTML + `<li><img class="invert" src="headphone.svg" alt="">
            <div class="info">
                <div style="width:100px;">${decoded}</div>
                <div class="artist">Jack</div>
            </div>
           <div class="pnow">
            <span>Play Now</span> <img src="play.svg" alt="">
           </div>
        </li>`

        }
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                play.src = "pause.svg"
                playMusic(e.querySelector(".info").firstElementChild.innerHTML + ".mp3")
            })

        })
        return songs

    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

const playMusic = (track, pause) => {

    currentsong.src = `songs/${currfolder}/` + track
    if (!pause) {
        currentsong.play()

    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track).split(".mp3")[0]
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}
async function displayAlbums() {
    let response = await fetch("https://github.com/yashrmalhotra/spotify-clone/tree/main/songs/")
    let html = await response.text()

    let div = document.createElement("div")
    div.innerHTML = html
    let anchor = div.getElementsByTagName("a")
    let as = Array.from(anchor)

    let cardcontaner = document.querySelector(".cardcontainer")
    for(let index=0;index<as.length;index++){
        const e = as[index]
        
        if(e.href.includes("/songs/")){
           
            let folder = e.href.split("songs/")[1]

            let info = await fetch(`https://github.com/yashrmalhotra/spotify-clone/tree/main/songs/${folder}/info.json`)

            let data = await info.json()

            cardcontaner.innerHTML +=  `<div class="card"  data-folder="${folder}">
            <div class="play" style="width: 28px; height: 28px; border-radius: 50%; display: flex; background-color: #1fdf64;  align-items: center; justify-content: center; padding: 4px; ">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" color="black" fill="black">
                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="black" stroke-width="1.5" stroke-linejoin="corner" />
                </svg>
            </div>
            <img src="songs/${folder}/cover.jpg" alt="">
            <h2>${data.title}</h2>
            <p>${data.description}</p>
        </div>`

        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {

            songs = await getsongs(`${item.currentTarget.getAttribute("data-folder")}`)
      
            playMusic(songs[0])
            play.src = "pause.svg"
        })
    })


}

async function main() {

    songs = await getsongs("ncs")
    
  
    playMusic(songs[0],true)
    displayAlbums()
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })
    currentsong.addEventListener("timeupdate", () => {

        document.querySelector(".songtime").innerHTML = `${sectomin(currentsong.currentTime)} / ${sectomin(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"


    })
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"

        currentsong.currentTime = ((currentsong.duration) * percent) / 100
    })
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0px"


    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-331px"

    })
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        else if ((index - 1) < 0) {
            playMusic(songs[songs.length - 1])
        }
    })

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {

            playMusic(songs[index + 1])
        }
        else if ((index + 1) >= songs.length) {
            playMusic(songs[0])
        }
    })
    let range = document.querySelector(".range").getElementsByTagName("input")[0]
    range.value = currentsong.volume*100
    
    let sv = currentsong.volume
    range.addEventListener("change", (e) => {

        currentsong.volume = parseInt(e.target.value) / 100
        sv = currentsong.volume
        
    })
    document.querySelector(".volume img").addEventListener("click",e=>{
      if(e.target.getAttribute("src")=="volume.svg"){
        currentsong.volume = 0
        
        e.target.src = "mute.svg"
        document.querySelector(".range input").value = 0
      }else{
        e.target.src = "volume.svg"
        currentsong.volume = sv
        document.querySelector(".range input").value = sv*100
        console.log(sv)
        

      }
    })
    

}
main()

