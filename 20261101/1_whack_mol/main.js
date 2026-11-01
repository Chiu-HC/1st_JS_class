// public variables (公共變數區)
const time = document.querySelector("#time");
const combo = document.querySelector("#combo");
const startBtn = document.querySelector(".control>button");
const animals = document.querySelectorAll(".imgs-box>img");

// 遊戲參數設定
const GAME_TIME = 30;
const SHOW_RANGE = [2, 4];
const IMG = {
    red: "./img/on.png",
    green: "./img/off.png",
    yellow: "./img/state.png",
};
const MAX_COMBO = 20;
let score = 0;

const codeMap = {
    Numpadd1: 6,
    Numpadd2: 7,
    Numpadd3: 8,
    Numpadd4: 3,
    Numpadd5: 4,
    Numpadd6: 5,
    Numpadd7: 0,
    Numpadd8: 1,
    Numpadd9: 2,
};

// init (初始化)
startBtn.addEventListener("click", startGame);
animals.forEach((item) => item.addEventListener("click", getScore));

document.addEventListener("keydown", (e) => {
    console.log(codeMap[e.key]);
});
// private mothods (私有方法區)

function startGame() {
    // startBtn.removeEventListener("click", startGame);
    // console.log("start game");
    startBtn.disabled = true;
    startBtn.textContent = "GO !!";
    let sec = GAME_TIME;
    time.textContent = sec;
    score = 0;
    combo.textContent = 0;

    // 計時
    const timerId = setInterval(() => {
        if (sec === 0) {
            clearInterval(timerId);
            startBtn.disabled = false;
            startBtn.textContent = "遊戲開始";
            alert("遊戲結束");
            return;
        }
        time.textContent = --sec;
    }, 1000);

    // 產生可得分事件
    for (let i = 0; i < MAX_COMBO; i++) {
        setTimeout(
            () => {
                const space = Math.floor(Math.random() * animals.length);
                const [a, b] = SHOW_RANGE;
                const delay =
                    Math.floor(Math.random() * (Math.abs(a - b) + 1)) + Math.min(a, b);
                toRedEvent({ space, delay });
            },
            Math.floor(Math.random() * (GAME_TIME - 3)) * 1000)
    }
}

//安排紅色事件
function toRedEvent({ space, delay }) {
    if (!animals[space].src.includes("state")) {
        // 該位置不是黃色空間，重新安排位置執行, 放慢速度避免全滿的時候瞬間狂問占用瀏覽器資源
        setTimeout(
            () =>
                toRedEvent({
                    space: Math.floor(Math.random() * animals.length),
                    delay,
                }),
            100,
        );
        return;
    }

    animals[space].src = IMG.red; // 排入紅色

    // 這裡的 timeout 是讓紅字自消失, 然如果玩家自己消失紅色, 理所當然這裡的定時 toY 要清除
    animals[space].dataset.timeId = setTimeout(
        () => (animals[space].src = IMG.yellow),
        delay * 1000,
    );
}

// 獲取得分
function getScore({ target: animal }) {
    if (!animal.src.includes("on")) return; // 不是紅色都忽略

    combo.textContent = ((++score / MAX_COMBO) * 100).toFixed(1);
    animal.src = IMG.green;
    clearTimeout(animal.dataset.timeId); // 清除自消失的定時器
    animal.dataset.timeId = null; // 清除自消失的定時器 id
    setTimeout(() => (animal.src = IMG.yellow), 1000);
}