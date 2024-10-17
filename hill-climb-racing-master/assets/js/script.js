const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const pauseBtn=document.getElementById('pause-btn');
const resumeBtn=document.getElementById('resume-btn');
const quitBtn=document.getElementById('quit-btn');
const restartBtn=document.getElementById('restart-btn');

const gameOverNode=document.getElementById('game-over');
const gameScore=document.getElementById('game-score');
const tryAgainBtn=document.getElementById('tryagain-btn');

const playerImg=new Image();
playerImg.src='assets/images/truck.png';

const coinImg=new Image();
coinImg.src='assets/images/coin.png';

const bombImg=new Image();
bombImg.src='assets/images/bomb.png';

const boomImg=new Image();
boomImg.src='assets/images/boom.png';

const coinSound=new Audio('assets/music/coin-sound.mp3');
const gameOverSound=new Audio('assets/music/game-over.mp3');

let dy=0;
let speed=1;
const scale = 4;
let coinCount=0;
let position = 0;
let coinPosition=20;
let bombPosition=-300;

let isPaused=false;
let isResumed=false;
let isStart=true;
let animationFrame;
let resumeAnimation;

let storage=window.localStorage;
let highCoinCount=storage.getItem('highCoin');


canvas.height = canvas.height * scale;
canvas.width = canvas.width * scale;

let land = [];

let player={x:200,y:null,width:100,height:75};

let coin={x:null,y:null,width:50,height:50};

let bomb={x:null,y:null,width:50,height:60};

document.addEventListener("keydown", moveTruck);
document.addEventListener("keyup", stopTruck);

quitBtn.addEventListener('click',quitGame);
pauseBtn.addEventListener('click',pauseGame);
resumeBtn.addEventListener('click',resumeGame);
tryAgainBtn.addEventListener('click',tryAgain);
restartBtn.addEventListener('click',restartGame);

function calcAngle(a, b, c) {
   return a + b + (a - b) * Math.cos(c * Math.PI);
}

function createWave(x) {
  x = x / 200;
  land.push(Math.random() * 120);
  return calcAngle(land[Math.floor(x)], land[Math.ceil(x)], x - Math.floor(x));
}

function drawHill(speed) {
  position +=1*speed;

  context.fillStyle = "#19f";
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "#86592d";
  context.beginPath();
  context.moveTo(0, canvas.height);

  for (i = 0; i < canvas.width; i++) {
    y = canvas.height - createWave(position+i) * 0.7;
    context.lineTo(i, y);
  }

  context.lineTo(canvas.width, canvas.height);
  context.fill();
  
}

function drawPlayer(dy){
    let offsetX=player.width/2;
    let y=(canvas.height- player.height-dy) - createWave(position +player.x) * 0.7;
    player.y=y;
    context.save();
    context.drawImage(playerImg,player.x-offsetX,player.y, player.width,player.height);
    context.restore();
}

function drawCoin(coinPosition){
    coin.x=(canvas.width-coinPosition);
    let y=(canvas.height- coin.height) - createWave(position +coin.x) * 0.7;
    coin.y=y;
    context.drawImage(coinImg,coin.x,coin.y,coin.width,coin.height); 
}

function drawBomb(bombPosition){
    bomb.x=(canvas.width-bombPosition);
    let y=(canvas.height- bomb.height) - createWave(position +bomb.x) * 0.7;
    bomb.y=y;
    context.drawImage(bombImg,bomb.x,bomb.y,bomb.width,bomb.height);
}

function drawBombBlast(){
    context.drawImage(boomImg,player.x,player.y,100,100);
}


function drawScore(coinCount){
    context.font = "30px Comic Sans MS";
    context.fillStyle = "white";
    context.textAlign = "center";
    context.fillText("Coin: "+coinCount,60,40);
}

function drawHighScore(highCoinCount){
    context.font = "30px Comic Sans MS";
    context.fillStyle = "purple";
    context.textAlign = "center";
    context.fillText("High Coin: "+highCoinCount,1100,40);
}

function checkCoinCollision(){
    let x = player.x - coin.x;
    let y = player.y - coin.y;
    let distance= Math.sqrt( x*x + y*y );

    let collisionDistance=(player.width/2+coin.width/2);

    if (distance<collisionDistance) {
        return true;  
    }
}

function checkBombCollision(){
    let x = player.x - bomb.x;
    let y = player.y - bomb.y;
    let distance= Math.sqrt( x*x + y*y );

    let collisionDistanceRight=(player.width/2+bomb.width/2);
    let collisionDistanceTop=(player.height/2+bomb.height/2);

    if (distance<collisionDistanceRight|| distance<collisionDistanceTop) {
        return true;  
    }
}

function syncCoinAndBombSpeed(){
    if(speed==0){
        coinPosition+=0;
        bombPosition+=0;
    }else if(speed==1){
        coinPosition+=3.5;
        bombPosition+=3.5;
    }
    else if(speed==1.5){
        coinPosition+=5;
        bombPosition+=5;
    }else if(speed==-0.5){
        coinPosition-=1.5;
        bombPosition-=1.5;
    }
}

function updateCoin(){
    if(coinPosition>=canvas.width){
        coinPosition=20;
    }
    else if(checkCoinCollision()){
        coinSound.play();
        coinPosition=20;
        coinCount +=1;
    }
}

function updateBomb(){
    if(bombPosition>=canvas.width){
        bombPosition=-300;
    }
    else if(checkBombCollision()){
        gameOver();
    }
}

function updateHighCoinCount(){
    if(highCoinCount==null || highCoinCount<=coinCount){
        highCoinCount=coinCount;
        storage.setItem("highCoin",highCoinCount);
    }
}

function start(){
    drawHill(speed);
    drawPlayer(dy);
    drawCoin(coinPosition);
    drawBomb(bombPosition)
    updateCoin();
    updateHighCoinCount();
    updateBomb();
    syncCoinAndBombSpeed();
    drawScore(coinCount);
    drawHighScore(highCoinCount);
    console.log("refershing");
    (isStart) && (animationFrame=requestAnimationFrame(start));
}
start();

function pauseGame(){
    speed=0; 
    isPaused=true;
    isResumed=false;
    pauseBtn.style.display='none';
    resumeBtn.style.display='inline'; 
    cancelAnimationFrame(animationFrame); 
}

function resumeGame(){
    speed=1;  
    isResumed=true;
    isPaused=false;
    pauseBtn.style.display='inline';
    resumeBtn.style.display='none';
    requestAnimationFrame(start);
}

function gameOver(){
    isResumed=false;
    isPaused=false;
    isStart=false;
    drawBombBlast();
    gameOverSound.play();
    pauseBtn.style.display='none';
    gameScore.innerHTML='Your Score is: '+coinCount;
    gameOverNode.style.display='block';
}

function tryAgain(){
    document.location.reload();
    cancelAnimationFrame(animationFrame);
    
}

function quitGame(){
    cancelAnimationFrame(animationFrame);  
    window.close();
}

function restartGame(){
    document.location.reload();
    cancelAnimationFrame(animationFrame);
}


/*Key Down*/
function moveTruck(e) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    if (e.keyCode == UP_KEY) {
        dy=100; 
    } else if (e.keyCode == DOWN_KEY) {
        speed=0;
    } else if (e.keyCode == LEFT_KEY) {      
        speed=-0.5;
    } else if (e.keyCode == RIGHT_KEY) {
        speed=1.5;     
    }
 
  }
  
/*Key Up */
function stopTruck(e) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    if (e.keyCode == UP_KEY) {
        dy=0;
    } else if (e.keyCode == DOWN_KEY) {
        speed=0;
    } else if (e.keyCode == LEFT_KEY) {  
        speed=0;
    } else if (e.keyCode == RIGHT_KEY) {
        speed=1;    
    }
  }



