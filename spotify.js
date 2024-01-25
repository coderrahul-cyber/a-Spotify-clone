// window.addEventListener('keydown',function(e){
//     console.log(e)
// })

//loader animation
window.addEventListener("load",()=>{
    document.body.classList.add('loaded');
})


document.addEventListener('DOMContentLoaded', () => {
    const scroll = new LocomotiveScroll({
        el: document.querySelector('.main .left'),
        smooth: true
    });
});

let songs;
let listContainer;
const currentMusic = new Audio();
let currentFolder ;
const playButton = document.getElementById("play");
const songInfo = document.querySelector(".songinfo");
const songTime = document.querySelector(".songTime");
const seekBar = document.querySelector(".seekbar");

function secondConverter(sec) {
    if (isNaN(sec) || sec < 0) {
        return "00:00";
    }
    const minute = Math.floor(sec / 60);
    const remaining = Math.floor(sec % 60);

    const formattedMinute = String(minute).padStart(2, '0');
    const formattedSecond = String(remaining).padStart(2, '0');

    return `${formattedMinute}:${formattedSecond}`;
}

async function fetchSongs(folder) {
    try {
        currentFolder = folder ;
        const response = await fetch(`http://127.0.0.1:3000/${folder}/`);
        const htmlText = await response.text();
        const div = document.createElement("div");
        div.innerHTML = htmlText;
        const anchors = div.getElementsByTagName("a");
        const songs = Array.from(anchors)
            .filter(element => element.href.endsWith(".mp3"))
            .map(element => element.href.split(`/${folder}/`)[1]);

             listContainer = document.querySelector(".songlist").getElementsByTagName("ul")[0];
            listContainer.innerHTML ="";
            const fragment = document.createDocumentFragment();
    
            for (const song of songs) {
                const listItem = document.createElement("li");
                listItem.innerHTML = `
                    <img src="music.svg" class="invert logo">
                    <div class="info">
                        <div>${song.replaceAll("%20", ' ')}</div>
                        <div>Artist Name</div>
                    </div>
                    <div class="playnow">
                        <span>Play Now</span>
                        <img src="play.svg" class="invert">
                    </div>`;
                listItem.addEventListener("click", () => {
                    startMusic(song.trim());
                });
                fragment.appendChild(listItem);
            }
            
        listContainer.appendChild(fragment);

            Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e =>{
                e.addEventListener("click" , element =>{
                    startMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
                })
            })


        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

function startMusic(track, pause = false) {
    currentMusic.src = `/${currentFolder}/${track}`;
    if (!pause) {
        currentMusic.play();
        playButton.src = "pause.svg";
    }
    songInfo.innerHTML = decodeURI(track);
    songTime.innerHTML = "00:00";
}
 
async function displayabb(){
    const response = await fetch(`/songs/`);
    const htmlText = await response.text();
    const div = document.createElement("div");
    div.innerHTML = htmlText;
    // console.log(div)
    let anchors = div.getElementsByTagName("a");
    let cardConn = document.querySelector(".cardCon") ;
   let array =  Array.from(anchors)
        for(let index = 0 ; index < array.length ; index++){
            const  e = array[index] ;

        if(e.href.includes("/songs") && !e.href.includes(".htaccess")){
         let folderr = e.href.split("/").slice(-2)[0] ;
         console.log("this is floder " ,folderr)

         const response = await fetch(`http://127.0.0.1:3000/songs/${folderr}/info.json`);
         const htmlText = await response.json();
         console.log(htmlText)

         cardConn.innerHTML = cardConn.innerHTML + ` <div  data-folder="${folderr}" class="card">
         <div class="play">
           <svg
             xmlns="http://www.w3.org/2000/svg"
             width="45"
             height="45"
             viewBox="0 0 24 24"
             fill="#1DB954"
             class="injected-svg"
             data-src="/icons/play-circle-stroke-rounded.svg"
             xmlns:xlink="http://www.w3.org/1999/xlink"
             role="img"
             color="#000000"
           >
             <circle
               cx="12"
               cy="12"
               r="10"
               stroke=""
               stroke-width="1.5"
             ></circle>
             <path
               d="M15.4531 12.3948C15.3016 13.0215 14.5857 13.4644 13.1539 14.3502C11.7697 15.2064 11.0777 15.6346 10.5199 15.4625C10.2893 15.3913 10.0793 15.2562 9.90982 15.07C9.5 14.6198 9.5 13.7465 9.5 12C9.5 10.2535 9.5 9.38018 9.90982 8.92995C10.0793 8.74381 10.2893 8.60868 10.5199 8.53753C11.0777 8.36544 11.7697 8.79357 13.1539 9.64983C14.5857 10.5356 15.3016 10.9785 15.4531 11.6052C15.5156 11.8639 15.5156 12.1361 15.4531 12.3948Z"
               stroke=""
               stroke-width="1.5"
               stroke-linejoin="sharp"
               fill="black"
             ></path>
           </svg>
         </div>
         <img
           src="songs/${folderr}/cover.png"
         />
         <h2>${htmlText.title}</h2>
         <p>${htmlText.description}</p>
       </div>`
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach( e=>{
        e.addEventListener("click" , async item =>{
            songs = await fetchSongs(`songs/${item.currentTarget.dataset.folder}`);
            console.table(songs)
            startMusic(songs[0])
            // playMusic(songs[0])
        })
    })
}

async function main() {
    try {
         songs = await fetchSongs("songs/folder1");
        console.table(songs);

         startMusic(songs[0], true);

        // ablum display

         displayabb();


        playButton.addEventListener("click", () => {
            if (currentMusic.paused) {
                currentMusic.play();
                playButton.src = "pause.svg";
            } else {
                currentMusic.pause();
                playButton.src = "play.svg";
            }
        });

        currentMusic.addEventListener("timeupdate", () => {
            songTime.innerHTML = `${secondConverter(currentMusic.currentTime)}/${secondConverter(currentMusic.duration)}`;
            const percent = (currentMusic.currentTime / currentMusic.duration) * 100 + "%";
            document.querySelector(".circle").style.left = percent;
        });

        seekBar.addEventListener("click", (e) => {
            const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
            document.querySelector(".circle").style.left = percent;
            currentMusic.currentTime = (currentMusic.duration * parseInt(percent)) / 100;
        });

      // add evnet leistener to bar
      document.querySelector(".seekbar").addEventListener("click" ,(e)=>{
        let per = (e.offsetX / e.target.getBoundingClientRect().width) *100 ;
        document.querySelector(".circle").style.left = per +"%";
        currentMusic.currentTime = ((currentMusic.duration) + per ) / 100 + "%" ;
      })

      // hambuger menu 
      let menuu = document.querySelector(".menu");
      let playbb =document.querySelector(".playbtt");
      var ran = 0 ;
      menuu.addEventListener("click" ,()=>{

        if(ran == 0 ){
           document.querySelector(".left").style.left = "0" ;
           menuu.style.left ="44%"
           menuu.style.marginLeft = "20px";
           playbb.style.display = "none";
           ran = 1 ;
           menuu.src = "cross.svg";
           console.log("hamburger is clicked" , ran)
           document.querySelector(".right").style.height = "100vh"
        }else{
            document.querySelector(".left").style.left = "-100%" ;
            menuu.style.left ="0"
            menuu.style.marginLeft = "10";
            playbb.style.display = "block";
            ran = 0 ;
            menuu.src = "ham.svg";
            console.log("hamburger again" , ran)
            document.querySelector(".right").style.height = "auto"
        }
      })

      

      // preivous
      document.querySelector("#previous").addEventListener("click",()=>{
        console.log("pervious")
        let index = songs.indexOf(currentMusic.src.split("/").slice(-1)[0]);
        // console.log(currentMusic.src.split("/").slice(-1))
        if((index-1) >= 0){
            startMusic(songs[index-1])
        }
    })

    // next
    document.querySelector("#next").addEventListener("click",()=>{
        console.log("next")
        currentMusic.pause()
        // console.log(songs)
        let index = songs.indexOf(currentMusic.src.split("/").slice(-1)[0]);
        if((index+1) < songs.length ){
            startMusic(songs[index+1])
        }
    })

    // volume 

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentMusic.volume = parseInt(e.target.value) / 100;
    });
    
    

     // lib 
     listContainer.addEventListener("click",()=>{
        playbb.style.display = "block";
        document.querySelector(".left").style.left = "-100%" ;
        document.querySelector(".left").style.left = "-100%" ;
        menuu.style.left ="0"
        menuu.style.marginLeft = "10";
        ran = 0 ;
        menuu.src = "ham.svg";
        document.querySelector(".right").style.height = "auto"
     })

    // volume buton 

    let sound = document.querySelector(".sound");
    let volbb =document.querySelector(".volu");
    let bar = 0 ;
    sound.addEventListener("click",()=>{
        if (bar === 0){
        sound.getElementsByTagName("input")[0].style.display ="inline-block";
        volbb.style.left = "20%";
        bar++ ;
        }else{
            sound.getElementsByTagName("input")[0].style.display ="none";
        volbb.style.left = "40%";
         bar-- ;
        }
    })

    // ablum opening 

   

    } catch (error) {
        console.error("Error in main:", error);
    }
}

main();

document.querySelector("#previous").addEventListener("click",()=>{
    console.log("pere")
})


