class mineSweeperGame {
    audioCache = {};
    allCells = [];
    gameWonTimeOut;
    isTouchDevice =
        ("ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0);
    lastTap = new Date();
    revealed = 0;
    focusedCell;
    touchButtons = [];
    explosionFieldSize = 1;
    allMines;
    playVolume = true;
    playingSounds = [];
    minesPositions = [];
    explosionTimers = [];
    amountFlags;
    flagCounter = 0;
    isPlaying = false;
    timerInterval;
    soundSelectors = {
        victory: "./sounds/victoryBlue.mp3",
        wasted: "./sounds/gameOver.mp3",
        unhide1: "./sounds/1unhide.wav",
        unhide2: "./sounds/2unhide.wav",
        unhide3: "./sounds/3unhide.wav",
        unhide4: "./sounds/4unhide.wav",
        unhide5: "./sounds/5unhide.wav",
        unhide6: "./sounds/6unhide.wav",
        unhide7: "./sounds/7unhide.wav",
        unhide8: "./sounds/8unhide.wav",
        spawn: "./sounds/spawn.wav",
        pullFlag: "./sounds/pullFlag.wav",
        putFlag: "./sounds/putFlag.wav",
        boom1: "./sounds/boom1.wav",
        boom2: "./sounds/boom2.wav",
        boom3: "./sounds/boom3.wav",
        boom4: "./sounds/boom4.wav",
        boom5: "./sounds/boom5.wav",
        winChime: "./sounds/winChime.wav",
    };
    selectors = {
        startGameBtn: ".startGame",
        fieldSizeSelect: ".fieldSize",
        gameFieldElement: ".gameField",
        gameOverSound: ".gameOverSound",
        gameVictorySound: ".gameVictorySound",
        resetGame: ".reset",
        questionEnd: ".questionEnd",
        newGameBtn: ".newGame",
        gameTime: ".gameTime",
        amountFlags: ".amountFlags",
        timerElement: ".timer",
    };
    fieldRows;
    fieldCols;
    constructor() {
        this.bindEvents();
    }
    phoneDblClick = ()=>{
        const currTap = new Date()
        console.log(currTap - this.lastTap);   
        if ((currTap - this.lastTap)>300){
            this.lastTap = currTap
            return false
        }
        return true
    }
    setNums = () => {
        for (let row = 0; row < this.fieldRows; row++) {
            for (let col = 0; col < this.fieldCols; col++) {
                let mineCount = 0;
                for (let newRow = -1; newRow < 2; newRow++) {
                    for (let newCol = -1; newCol < 2; newCol++) {
                        const neighborRow = row + newRow;
                        const neighborCol = col + newCol;
                        if (
                            neighborRow < 0 ||
                            neighborRow > this.fieldRows - 1 ||
                            neighborCol < 0 ||
                            neighborCol > this.fieldCols - 1 ||
                            (neighborCol == col && neighborRow == row)
                        ) {
                            continue;
                        }
                        if (this.allCells[neighborRow][neighborCol].isMine) {
                            mineCount++;
                        }
                    }
                }
                if (!this.allCells[row][col].isMine) {
                    const element = this.allCells[row][col].element;
                    this.allCells[row][col].mineCount = mineCount;
                    const nums = {
                        1: "one",
                        2: "two",
                        3: "three",
                        4: "four",
                        5: "five",
                        6: "six",
                        7: "seven",
                        8: "eight",
                    };
                    if (mineCount == 0) {
                        mineCount = "";
                    }
                    element.classList.add(nums[mineCount]);
                    element.firstElementChild.innerText = mineCount;
                }
            }
        }
    };
    newGame = () => {
        clearInterval(this.timerInterval);
        for (let timerId of this.explosionTimers) {
            clearInterval(timerId);
        }
        const amountFlagsElement = document.querySelector(
            this.selectors.amountFlags
        );
        amountFlagsElement.style.display = "none";
        const gameTimeElement = document.querySelector(this.selectors.gameTime);
        const timerElement = document.querySelector(
            this.selectors.timerElement
        );
        gameTimeElement.style.display = "none";
        timerElement.style.display = "none";
        const gameField = document.querySelector(
            this.selectors.gameFieldElement
        );
        const resetWindow = document.querySelector(this.selectors.resetGame);
        const questionEnd = document.querySelector(this.selectors.questionEnd);
        const questionEndImg = questionEnd.querySelector("img");
        if (questionEndImg) {
            questionEnd.removeChild(questionEndImg);
        }
        gameField.classList.remove("small");
        gameField.classList.remove("middle");
        gameField.classList.remove("big");
        gameField.innerHTML = "";
        resetWindow.style.display = "none";
        resetWindow.style.backgroundColor = "rgba(155, 155, 155, 0)";
        (questionEnd.style.opacity = "0"),
            gameField.replaceWith(gameField.cloneNode(true));
        setTimeout(() => {
            this.stopAllSounds();
            this.startGame();
        }, 50);
    };
    stopAllSounds = () => {
        for (let audio of this.playingSounds) {
            audio.pause();
            audio.remove();
        }
    };
    showTouchLost = ()=>{
        if (this.phoneDblClick()){
            this.showLostEnd()
            const resetWindow = document.querySelector(this.selectors.resetGame);
            resetWindow.removeEventListener('touchstart',this.showTouchLost)
        }
    }
    lostExplosion = (currRow, currCol) => {
        this.trigger();
        const resetWindow = document.querySelector(this.selectors.resetGame);
        resetWindow.style.display = "flex";
        if (this.isTouchDevice){
            resetWindow.addEventListener('touchstart',this.showTouchLost)
            
        }
        resetWindow.addEventListener("dblclick", this.showLostEnd, {
            once: true,
        });
        let minesWithDistance = [];
        clearInterval(this.timerInterval);
        for (let [row, col] of this.minesPositions) {
            if (row === currRow && col === currCol) continue;
            let distance = Math.abs(currRow - row) + Math.abs(currCol - col);
            minesWithDistance.push({
                row: row,
                col: col,
                distance: distance,
            });
        }
        minesWithDistance.sort((a, b) => a.distance - b.distance);
        minesWithDistance.forEach((mine, index) => {
            const timerId = setTimeout(() => {
                const cell = this.allCells[mine.row][mine.col];
                const wrap =
                    this.allCells[mine.row][mine.col].element.firstElementChild;
                if (this.playVolume) {
                    const randBoom = Math.ceil(Math.random() * 5);
                    this.playSound(this.soundSelectors[`boom${randBoom}`]);
                }
                wrap.style.display = "flex";
                this.explosionAnimation(wrap);
                if (cell.isFlagged) {
                    cell.element.querySelector(".flag").remove();
                }
                if (index == this.allMines - 2 && this.playVolume) {
                    resetWindow.removeEventListener(
                        "dblclick",
                        this.showLostEnd
                    );
                    setTimeout(() => this.showLostEnd(), 1000);
                }
            }, (index + 1) * 350 * (1 + Math.random() * 0.05));
            this.explosionTimers.push(timerId);
        });
    };
    showLostEnd = () => {
        const resetWindow = document.querySelector(this.selectors.resetGame);
        this.playVolume = false;
        this.playSound(this.soundSelectors.wasted);
        const questionEnd = document.querySelector(this.selectors.questionEnd);
        let sadSapperImg = document.createElement("img");
        sadSapperImg.src = "./images/sadSapper.jpg";
        questionEnd.prepend(sadSapperImg);
        setTimeout(() => {
            resetWindow.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
            questionEnd.style.opacity = "1";
            const newGameBtn = document.querySelector(
                this.selectors.newGameBtn
            );
            newGameBtn.addEventListener("click", () => this.newGame(), {
                once: true,
            });
        }, 500);
    };
    // gameLost = () => {
    //     this.playSound(this.soundSelectors.wasted);
    //     clearInterval(this.timerInterval);
    //     for (let row = 0; row < this.fieldRows; row++) {
    //         for (let col = 0; col < this.fieldCols; col++) {
    //             if (this.allCells[row][col].isMine) {
    //                 this.allCells[row][
    //                     col
    //                 ].element.firstElementChild.style.display = "flex";
    //                 const flag =
    //                     this.allCells[row][col].element.querySelector(".flag");
    //                 if (flag) {
    //                     this.allCells[row][col].isFlagged = false;
    //                     this.allCells[row][col].element.removeChild(flag);
    //                 }
    //             }
    //         }
    //     }
    //     const resetWindow = document.querySelector(this.selectors.resetGame);
    //     const questionEnd = document.querySelector(this.selectors.questionEnd);
    //     let sadSapperImg = document.createElement("img");
    //     sadSapperImg.src = "./images/sadSapper.jpg";
    //     questionEnd.prepend(sadSapperImg);
    //     resetWindow.style.display = "flex";
    //     setTimeout(() => {
    //         resetWindow.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
    //         questionEnd.style.opacity = "1";
    //     }, 2000);
    //     const newGameBtn = document.querySelector(this.selectors.newGameBtn);
    //     newGameBtn.addEventListener("click", () => this.newGame(), {
    //         once: true,
    //     });
    // };
    flowerCell = (fieldCell) => {
        const flowerPetalColors = [
            "linear-gradient(45deg, #FF1493, #DC143C)", // Розово-красный
            "linear-gradient(45deg, #FF4500, #FF1493)", // Оранжево-розовый
            "linear-gradient(45deg, #8A2BE2, #1E90FF)", // Фиолетово-голубой
            "linear-gradient(45deg, #9370DB, #FF69B4)", // Лилово-розовый
            "linear-gradient(45deg, #40E0D0, #1E90FF)", // Бирюзово-голубой
            "linear-gradient(45deg, #FF00FF, #8A2BE2)", // Фуксия-фиолетовый
            "linear-gradient(45deg, #C71585, #FF3366)", // Тёмно-розовый → Неоновый розовый
            "linear-gradient(45deg, #483D8B, #BA55D3)", // Тёмно-синий → Фиолетовый
            "linear-gradient(45deg, #8B0000, #FF4500)", // Тёмно-красный → Оранжевый
            "linear-gradient(45deg, #FF69B4, #FF00FF)", // Ярко-розовый → Фуксия
            "linear-gradient(45deg, #6A5ACD, #1E90FF)", // Сиреневый → Голубой
            "linear-gradient(45deg, #FF3366, #FF6347)", // Малиновый → Лососевый
            "linear-gradient(45deg, #DA70D6, #FF1493)", // Орхидея → Глубокий розовый
            "linear-gradient(45deg, #FF00FF, #FF1493)", // Неоновый фуксия → Ярко-розовый
            "linear-gradient(45deg, #40E0D0, #9370DB)", // Бирюзовый → Лавандовый
            "linear-gradient(60deg, #FF69B4, #FF1493, #DC143C)", // Три оттенка розового
            "linear-gradient(60deg, #8A2BE2, #6A5ACD, #1E90FF)", // Фиолетовый → Голубой
            "linear-gradient(60deg, #FF4500, #FF3366, #FF69B4)", // Оранжевый → Красный → Розовый
            "linear-gradient(60deg, #40E0D0, #9370DB, #FF1493)", // Бирюзовый → Фиолетовый → Розовый
            "linear-gradient(60deg, #483D8B, #6A5ACD, #1E90FF)", // Тёмно-синий → Сиреневый → Голубой
            "radial-gradient(circle, #FF1493, #DC143C)", // Радужный розово-красный
            "radial-gradient(circle, #FF00FF, #8A2BE2)", // Радужный фуксия-фиолетовый
            "radial-gradient(circle, #40E0D0, #1E90FF)", // Радужный бирюзовый-голубой
            "radial-gradient(circle, #FF4500, #FF1493)", // Радужный оранжевый-розовый
            "radial-gradient(circle, #6A5ACD, #FF3366)", // Радужный сиреневый-малиновый
        ];

        const flowCont = fieldCell.querySelector(".flowers-container");
        if (flowCont) {
            flowCont.remove();
        }
        const flowersContainer = document.createElement("div");
        flowersContainer.className = "flowers-container";
        const amountOfFlowers = Math.round(2 + Math.random());
        const allFlowers = ["chamomile", "tulip", "sunflower"];
        const allCurrFlowers = [];
        for (let flower = 0; flower < amountOfFlowers; flower++) {
            const currentFlower =
                allFlowers[Math.trunc(Math.random() * allFlowers.length)];
            if (currentFlower == "chamomile") {
                const chamomile = document.createElement("div");
                chamomile.className = "chamomile";
                if (flower == 0) {
                    chamomile.style.left = "0";
                    chamomile.style.top = "0";
                }
                if (flower == 1) {
                    chamomile.style.right = "0";
                    chamomile.style.top = "0";
                }
                if (flower == 2) {
                    chamomile.style.right = "0";
                    chamomile.style.bottom = "0";
                }
                const chamomileCenter = document.createElement("div");
                chamomileCenter.className = "chamomile-center";
                chamomile.appendChild(chamomileCenter);
                const randPetalColor =
                    flowerPetalColors[
                        Math.floor(flowerPetalColors.length * Math.random())
                    ];
                for (let petalCount = 0; petalCount < 12; petalCount++) {
                    const petal = document.createElement("div");
                    petal.className = "chamomile-petal";
                    petal.style = `--i:${petalCount}`;
                    petal.style.background = randPetalColor;
                    chamomile.appendChild(petal);
                }
                allCurrFlowers.push(chamomile);
                flowersContainer.appendChild(chamomile);
            } else if (currentFlower == "tulip") {
                const tulip = document.createElement("div");
                tulip.className = "tulip";
                if (flower == 0) {
                    tulip.style.left = "-5%";
                    tulip.style.top = "-5%";
                }
                if (flower == 1) {
                    tulip.style.right = "-5%";
                    tulip.style.top = "-5%";
                }
                if (flower == 2) {
                    tulip.style.right = "-5%";
                    tulip.style.bottom = "-5%";
                }
                const randPetalColor =
                    flowerPetalColors[
                        Math.floor(flowerPetalColors.length * Math.random())
                    ];
                for (let petalCount = 0; petalCount < 3; petalCount++) {
                    const petal = document.createElement("div");
                    petal.className = "tulipPetal";
                    if (petalCount == 0) {
                        petal.style = "--i:0";
                    } else if (petalCount == 1) {
                        petal.style = "--i:1";
                    } else if (petalCount == 2) {
                        petal.style = "--i:2";
                    }
                    tulip.appendChild(petal);
                    petal.style.background = randPetalColor;
                }
                const tulipCore = document.createElement("div");
                tulipCore.className = "tulip-core";
                tulip.appendChild(tulipCore);
                allCurrFlowers.push(tulip);
                flowersContainer.appendChild(tulip);
            } else if (currentFlower == "sunflower") {
                const sunflower = document.createElement("div");
                sunflower.className = "sunflower";
                if (flower == 0) {
                    sunflower.style.left = "10%";
                    sunflower.style.top = "10%";
                } else if (flower == 1) {
                    sunflower.style.right = "10%";
                    sunflower.style.top = "10%";
                } else if (flower == 2) {
                    sunflower.style.right = "10%";
                    sunflower.style.bottom = "10%";
                }
                const petals = document.createElement("div");
                petals.className = "petals";
                sunflower.appendChild(petals);
                const randPetalColor =
                    flowerPetalColors[
                        Math.floor(flowerPetalColors.length * Math.random())
                    ];
                for (let petalCount = 0; petalCount < 12; petalCount++) {
                    const petal = document.createElement("div");
                    petal.className = "petal";
                    petal.style = `--i:${petalCount}`;
                    petal.style.background = randPetalColor;
                    petals.appendChild(petal);
                }
                const center = document.createElement("div");
                center.className = "center";
                for (let seedCount = 0; seedCount < 3; seedCount++) {
                    const seed = document.createElement("div");
                    seed.className = "seed";
                    seed.classList.add(`seed${seedCount + 1}`);
                    center.appendChild(seed);
                }
                sunflower.appendChild(center);
                allCurrFlowers.push(sunflower);
                flowersContainer.appendChild(sunflower);
            }
        }

        fieldCell.appendChild(flowersContainer);
    };
    showTouchWin = ()=>{
        if (this.phoneDblClick()){
            this.gameWon()
            const resetWindow = document.querySelector(this.selectors.resetGame);
            resetWindow.removeEventListener('touchstart',this.showTouchWin)
        }
    }
    wonAnimation = () => {
        const resetWindow = document.querySelector(this.selectors.resetGame);
        if (this.isTouchDevice){
            resetWindow.addEventListener('touchstart',this.showTouchWin)
        }
        resetWindow.addEventListener("dblclick", this.gameWon, { once: true });
        resetWindow.style.display = "flex";
        clearInterval(this.timerInterval);
        this.playSound(this.soundSelectors.winChime);
        for (let row = 0; row < this.fieldRows; row++) {
            for (let col = 0; col < this.fieldCols; col++) {
                const fieldCell = this.allCells[row][col];
                if (fieldCell.isFlagged) {
                    const timerId = setTimeout(() => {
                        this.pullFlagAnimation(
                            fieldCell.element.lastElementChild
                        );
                    }, row * 340);
                }
                if (fieldCell.isMine) {
                    const timerId = setTimeout(() => {
                        this.flowerCell(fieldCell.element);
                    }, row * 400 * (1 + Math.random() * 0.1));
                }
                if (fieldCell.isRevealed) {
                    const wrap = fieldCell.element.firstElementChild;
                    if ((row + col) % 2 == 0) {
                        const timerId = setTimeout(() => {
                            wrap.style.backgroundColor = "#7ab5e2";
                            wrap.style.color = "transparent";
                        }, 10);
                    } else {
                        const timerId = setTimeout(() => {
                            wrap.style.backgroundColor = "#85b9e4";
                            wrap.style.color = "transparent";
                        }, 10);
                    }
                }
            }
        }
        this.gameWonTimeOut = setTimeout(() => this.gameWon(), 4800);
    };
    gameWon = () => {
        clearInterval(this.timerInterval);
        clearTimeout(this.gameWonTimeOut);
        const resetWindow = document.querySelector(this.selectors.resetGame);
        resetWindow.removeEventListener("dblclick", this.gameWon);
        const questionEnd = document.querySelector(this.selectors.questionEnd);
        let funnySapperImg = document.createElement("img");
        funnySapperImg.src = "./images/funnySapper.jpg";
        setTimeout(() => {
            this.stopAllSounds();
            this.playSound(this.soundSelectors.victory);
            resetWindow.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
            questionEnd.style.opacity = "1";
            questionEnd.prepend(funnySapperImg);
            const newGameBtn = document.querySelector(
                this.selectors.newGameBtn
            );
            newGameBtn.addEventListener("click", () => this.newGame(), {
                once: true,
            });
        }, 700);
    };
    pullFlagAnimation(flag) {
        const flyAnimation = `fly${Math.ceil(Math.random() * 4)}`;
        flag.classList.add(flyAnimation);
        flag.addEventListener("animationend", () => flag.remove());
    }
    putFlagAnimation(flag) {
        flag.classList.add("set");
    }
    setRedFlag = (event) => {
        const amountFlagsElement = document.querySelector(
            this.selectors.amountFlags
        );
        const target = event.target.closest(".fieldCell");
        if (!target) {
            return;
        }
        const currRow = parseInt(target.getAttribute("row"));
        const currCol = parseInt(target.getAttribute("col"));
        const fieldCell = this.allCells[currRow][currCol];
        if (fieldCell.isRevealed) {
            return;
        }

        if (fieldCell.isFlagged) {
            this.amountFlags++;
            const currFlag = fieldCell.element.lastElementChild;
            this.pullFlagAnimation(currFlag);
            amountFlagsElement.lastElementChild.innerText = this.amountFlags;
            this.playSound(this.soundSelectors.pullFlag);
            fieldCell.isFlagged = false;
            return;
        } else {
            if (this.amountFlags == 0) {
                return;
            }
            this.amountFlags--;
            amountFlagsElement.lastElementChild.innerText = this.amountFlags;
            let flag = document.createElement("img");
            flag.src = "./svgs/redFlag.svg";
            flag.classList.add("flag");
            flag.setAttribute("number", this.flagCounter);
            this.putFlagAnimation(flag);
            this.flagCounter++;
            this.playSound(this.soundSelectors.putFlag);
            fieldCell.element.appendChild(flag);
            fieldCell.isFlagged = true;
        }
    };
    startCheck = (event) => {
        if (event.button === 2) {
            event.preventDefault();
            this.setRedFlag(event);

            return;
        }

        const target = event.target.closest(".fieldCell");
        if (!target) {
            return;
        }
        const currRow = parseInt(target.getAttribute("row"));
        const currCol = parseInt(target.getAttribute("col"));

        if (
            this.allCells[currRow][currCol].isRevealed ||
            this.allCells[currRow][currCol].isFlagged
        ) {
            return;
        }
        const wrap = target.firstElementChild;
        const currCell = this.allCells[currRow][currCol];
        wrap.style.display = "flex";
        currCell.isRevealed = true;
        this.revealed++;
        if (this.allCells[currRow][currCol].isMine) {
            const randBoom = Math.ceil(Math.random() * 5);
            this.playSound(this.soundSelectors[`boom${randBoom}`]);
            this.explosionAnimation(wrap);
            this.lostExplosion(currRow, currCol);
            return;
        }
        this.createParticle(wrap);
        if (this.allCells[currRow][currCol].mineCount == 0) {
            this.playSound(this.soundSelectors.spawn);
            this.removeExtraEmpty(currRow, currCol);
            return;
        }
        this.playSound(this.soundSelectors[`unhide${wrap.innerText}`]);
        if (this.revealed == this.fieldRows * this.fieldCols - this.allMines) {
            this.wonAnimation();
            return;
        }
    };
    removeExtraEmpty = (startRow, startCol) => {
        for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
                const newRow = startRow + row;
                const newCol = startCol + col;
                if (
                    newRow >= 0 &&
                    newRow < this.fieldRows &&
                    newCol >= 0 &&
                    newCol < this.fieldCols
                ) {
                    const neighbour = this.allCells[newRow][newCol];
                    if (!neighbour.isRevealed && !neighbour.isMine) {
                        if (neighbour.isFlagged) {
                            neighbour.isFlagged = false;
                            const flag =
                                neighbour.element.querySelector(".flag");
                            this.amountFlags++;
                            const amountFlagsElement = document.querySelector(
                                this.selectors.amountFlags
                            );
                            amountFlagsElement.lastElementChild.innerText =
                                this.amountFlags;
                            this.pullFlagAnimation(flag);
                        }
                        neighbour.isRevealed = true;
                        this.revealed++;
                        const wrap = neighbour.element.firstElementChild;
                        wrap.style.display = "flex";
                        this.createParticle(wrap);
                        if (
                            this.revealed ==
                            this.fieldRows * this.fieldCols - this.allMines
                        ) {
                            this.wonAnimation();
                        }
                        if (neighbour.mineCount == 0) {
                            this.removeExtraEmpty(newRow, newCol);
                        }
                    }
                }
            }
        }
    };
    explosionAnimation(element) {
        element.innerHTML = "";
        for (let i = 0; i < 25; i++) {
            const fieldWidth = element
                .closest(".fieldCell")
                .getBoundingClientRect().width;
            const particle = document.createElement("div");
            particle.className = "mine-particle";
            const px = ((i % 5) * 8 - 16) * this.explosionFieldSize;
            const py = (Math.floor(i / 5) * 8 - 16) * this.explosionFieldSize;

            particle.style.cssText = `
                left: ${px + fieldWidth / 2}px;
                top: ${py + fieldWidth / 2}px;
                animation-delay: ${Math.random() * 0.1}s;
            `;

            element.appendChild(particle);
            particle.addEventListener("animationend", () => particle.remove(), {
                once: true,
            });
        }
        for (let i = 0; i < 8; i++) {
            const spark = document.createElement("div");
            spark.className = "mine-particle spark";

            const angle = Math.random() * Math.PI * 2;
            const distance = 15 + Math.random() * 30;

            spark.style.cssText = `
                --spark-x: ${Math.cos(angle) * distance}px;
                --spark-y: ${Math.sin(angle) * distance}px;
            `;

            element.appendChild(spark);
            spark.addEventListener("animationend", () => spark.remove(), {
                once: true,
            });
        }
        const wave = document.createElement("div");
        wave.style.cssText = `
            position: absolute;
            width: 10px;
            height: 10px;
            border: 2px solid rgba(255, 200, 0, 0.7);
            border-radius: 50%;
            animation: wave-expand 0.5s ease-out forwards;
            pointer-events: none;
        `;
        element.appendChild(wave);
        setTimeout(() => wave.remove(), 500);
        let explosionAfter = document.createElement("div");
        explosionAfter.className = "explosion-crater";
        element.appendChild(explosionAfter);
    }
    checkNeighbours = (event) => {
        const target = event.target.closest(".fieldCell");
        if (!target) {
            return false;
        }

        const currRow = parseInt(target.getAttribute("row"));
        const currCol = parseInt(target.getAttribute("col"));
        const fieldCell = this.allCells[currRow][currCol];
        if (!fieldCell.isRevealed || fieldCell.mineCount == 0) {
            return false;
        }
        const minesAround = fieldCell.mineCount;
        let counterFlags = 0;
        for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
                const newRow = currRow + row;
                const newCol = currCol + col;
                if (
                    newRow >= 0 &&
                    newRow < this.fieldRows &&
                    newCol >= 0 &&
                    newCol < this.fieldCols
                ) {
                    if (this.allCells[newRow][newCol].isFlagged) {
                        counterFlags++;
                    }
                }
            }
        }
        if (counterFlags < minesAround) {
            return false;
        }
        return true;
    };
    revealNeighbours = (event) => {
        const eve = event;
        const target = event.target.closest(".fieldCell");
        if (!target) {
            return;
        }
        const currRow = parseInt(target.getAttribute("row"));
        const currCol = parseInt(target.getAttribute("col"));
        if (!this.checkNeighbours(eve)) {
            return;
        }
        let maxNum = 1;
        let playNum = true;
        let playNumSound = false;
        if (this.allCells[currRow][currCol].isFlagged) {
            return;
        }
        for (let row = -1; row <= 1; row++) {
            for (let col = -1; col <= 1; col++) {
                const newRow = currRow + row;
                const newCol = currCol + col;
                if (
                    newRow >= 0 &&
                    newRow < this.fieldRows &&
                    newCol >= 0 &&
                    newCol < this.fieldCols
                ) {
                    const wrap =
                        this.allCells[newRow][newCol].element.firstElementChild;
                    if (
                        this.allCells[newRow][newCol].isFlagged ||
                        this.allCells[newRow][newCol].isRevealed
                    ) {
                        continue;
                    }
                    if (this.allCells[newRow][newCol].isMine) {
                        this.allCells[newRow][newCol].isRevealed = true;
                        wrap.style.display = "flex";
                        this.explosionAnimation(wrap);
                        this.lostExplosion(newRow, newCol);
                        return;
                    }
                    if (this.allCells[newRow][newCol].mineCount == 0) {
                        this.playSound(this.soundSelectors.spawn);
                        this.removeExtraEmpty(newRow, newCol);
                        playNum = false;
                        continue;
                    }
                    wrap.style.display = "flex";
                    this.createParticle(wrap);
                    this.revealed++;
                    this.allCells[newRow][newCol].isRevealed = true;
                    playNumSound = true;
                    if (maxNum < parseInt(wrap.innerText)) {
                        maxNum = parseInt(wrap.innerText);
                        this.playSound(
                            this.soundSelectors[`unhide${wrap.innerText}`]
                        );
                    }
                    if (
                        this.revealed ==
                        this.fieldRows * this.fieldCols - this.allMines
                    ) {
                        this.wonAnimation();
                    }
                }
            }
        }
        if (playNum && playNumSound) {
            this.playSound(this.soundSelectors[`unhide${maxNum}`]);
        }
    };
    createParticle = (element) => {
        const particle = document.createElement("div");
        particle.className = "particle";
        element.appendChild(particle);
        let randDeg30 = (Math.random() - 0.5) * 80;
        let randX30 = (Math.random() - 0.5) * 80;
        let randY30 = (Math.random() - 0.5) * 80;
        let randDeg70 = randDeg30 * 1.6;
        let randX70 = randX30 * 2.4;
        let randY70 = randY30 * 1.6;
        let randDeg100 = randDeg70 * 1.6;
        let randX100 = randX70 * 1.4;
        let randY100 = randY70 * 1.2;
        particle.style.setProperty("--randDeg30", `${randDeg30}deg`);
        particle.style.setProperty("--randX30", `${randX30}px`);
        particle.style.setProperty("--randY30", `${randY30}px`);
        particle.style.setProperty("--randDeg70", `${randDeg70}deg`);
        particle.style.setProperty("--randX70", `${randX70}px`);
        particle.style.setProperty("--randY70", `${randY70}px`);
        particle.style.setProperty("--randDeg100", `${randDeg100}deg`);
        particle.style.setProperty("--randX100", `${randX100}px`);
        particle.style.setProperty("--randY100", `${randY100}px`);
        particle.addEventListener(
            "animationend",
            () => element.removeChild(particle),
            { once: true }
        );
    };
    playSound = (src) => {
        const audio = new Audio(src);
        if (src.includes("boom") || src.includes("victoryBlue")) {
            audio.volume = 0.5;
        }
        audio.play();
        this.playingSounds.push(audio);
        audio.addEventListener(
            "ended",
            () => {
                audio.remove();
            },
            { once: true }
        );
    };
    trigger = () => {
        const gameField = document.querySelector(
            this.selectors.gameFieldElement
        );
        gameField.classList.add("trig");
        gameField.addEventListener("animationend", () => {
            gameField.classList.remove("trig");
        });
    };
    removeTouchButtons = () => {
        if (this.focusedCell) {
            this.focusedCell.classList.remove("focusedCell");
        }
        if (this.touchButtons.length != 0) {
            for (let btn of this.touchButtons) {
                btn.remove();
            }
            this.touchButtons = [];
        }
    };
    showTouchMenu = (event) => {
        const eve = event;
        const target = event.target.closest(".fieldCell");
        const neighbourCan = this.checkNeighbours(eve);
        if (!target) {
            return;
        }
        const startRow = parseInt(target.getAttribute("row"));
        const startCol = parseInt(target.getAttribute("col"));
        const fieldCell = this.allCells[startRow][startCol];
        this.removeTouchButtons();
        if (fieldCell.isRevealed && !neighbourCan) {
            return;
        }
        fieldCell.element.classList.add("focusedCell");
        this.focusedCell = fieldCell.element;
        const redFlagBtn = document.createElement("img");
        redFlagBtn.src = "./svgs/flagBtn.svg";
        redFlagBtn.classList.add("redFlagBtn");
        const shovelBtn = document.createElement("img");
        shovelBtn.classList.add("shovelBtn");
        shovelBtn.src = "./svgs/shovel.svg";
        const cancelBtn = document.createElement("img");
        cancelBtn.src = "./svgs/cancel.svg";
        cancelBtn.classList.add("cancelBtn");
        if (startRow == 0) {
            shovelBtn.style.top = "115%";
            cancelBtn.style.top = "110%";
        }
        if (startCol == 0) {
            redFlagBtn.style.left = "110%";
            cancelBtn.style.left = "110%";
        }
        cancelBtn.addEventListener("pointerdown", this.removeTouchButtons);
        if (fieldCell.isRevealed && neighbourCan) {
            shovelBtn.addEventListener("pointerdown", () => {
                this.removeTouchButtons();
                this.revealNeighbours(eve);
            });
            this.touchButtons.push(cancelBtn);
            this.touchButtons.push(shovelBtn);
            fieldCell.element.appendChild(cancelBtn);
            fieldCell.element.appendChild(shovelBtn);
            redFlagBtn.remove();
            
        } else {
            redFlagBtn.addEventListener("pointerdown", () => {
                this.removeTouchButtons();
                this.setRedFlag(eve);
            });
            shovelBtn.addEventListener("pointerdown", () => {
                this.removeTouchButtons();
                this.startCheck(eve);
            });
            this.touchButtons.push(cancelBtn);
            this.touchButtons.push(shovelBtn);
            this.touchButtons.push(redFlagBtn);
            fieldCell.element.appendChild(cancelBtn);
            fieldCell.element.appendChild(shovelBtn);
            fieldCell.element.appendChild(redFlagBtn);
        }
    };
    spawnBombs = (event) => {
        if (event.button === 2) {
            return;
        }
        const target = event.target.closest(".fieldCell");
        if (!target) {
            return;
        }
        const startRow = parseInt(target.getAttribute("row"));
        const startCol = parseInt(target.getAttribute("col"));
        this.allCells[startRow][startCol].isRevealed = true;

        const wrap =
            this.allCells[startRow][startCol].element.firstElementChild;

        wrap.style.display = "flex";
        this.revealed++;
        let spawnedMines = 0;
        while (spawnedMines < this.allMines) {
            const randRow = Math.trunc(Math.random() * this.fieldRows);
            const randCol = Math.trunc(Math.random() * this.fieldCols);
            if (
                (randRow == startRow && randCol == startCol) ||
                this.allCells[randRow][randCol].isMine
            ) {
                continue;
            } else {
                this.allCells[randRow][randCol].isMine = true;
                this.minesPositions.push([randRow, randCol]);
                this.allCells[randRow][randCol].isMine = true;

                spawnedMines++;
            }
        }
        const gameField = document.querySelector(
            this.selectors.gameFieldElement
        );
        this.trigger();
        this.setNums();
        this.createParticle(wrap);
        if (this.isTouchDevice) {
            gameField.addEventListener("pointerdown", (event) => {
                this.showTouchMenu(event);
            });
        } else {
            gameField.addEventListener("pointerdown", (event) =>
                this.startCheck(event)
            );
            gameField.addEventListener("dblclick", (event) => {
                this.revealNeighbours(event);
            });
        }
        gameField.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
        this.playSound(this.soundSelectors.spawn);
        this.removeExtraEmpty(startRow, startCol);
        this.startGameTimer();
    };
    field = (gameField) => {
        for (let row = 0; row < this.fieldRows; row++) {
            const rowArr = [];
            for (let col = 0; col < this.fieldCols; col++) {
                let cell = document.createElement("div");
                let wrap = document.createElement("div");
                wrap.classList.add("wrap");
                cell.classList.add("fieldCell");
                cell.setAttribute("row", row);
                cell.setAttribute("col", col);
                cell.appendChild(wrap);
                if ((row + col) % 2 == 0) {
                    cell.style.backgroundColor = "var(--lightGreen)";
                    wrap.style.backgroundColor = "var(--lightYellow)";
                } else {
                    cell.style.backgroundColor = "var(--littleDarkGreen)";
                    wrap.style.backgroundColor = "var(--darkYellow)";
                }
                gameField.appendChild(cell);
                const cellData = {
                    element: cell,
                    row: row,
                    col: col,
                    isMine: false,
                    mineCount: 0,
                    isRevealed: false,
                    isFlagged: false,
                };
                rowArr.push(cellData);
            }
            this.allCells.push(rowArr);
        }
        gameField.addEventListener(
            "pointerdown",
            (event) => this.spawnBombs(event),
            { once: true }
        );
    };
    startGameTimer = () => {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        const gameTimeElement = document.querySelector(this.selectors.gameTime);
        const timer = document.querySelector(this.selectors.timerElement);
        timer.style.display = "flex";
        gameTimeElement.innerText = `00:00`;
        gameTimeElement.style.display = "flex";
        const startTime = new Date();
        function convert() {
            const currTime = new Date();
            const startMin = (currTime - startTime) / 1000;
            const startSec = Math.trunc((currTime - startTime) / 1000);
            const minDiff = `${Math.trunc(startMin / 60)}`.padStart(2, 0);
            const secDiff = `${startSec % 60}`.padStart(2, 0);
            const time = `${minDiff}:${secDiff}`;
            gameTimeElement.innerText = time;
        }
        this.timerInterval = setInterval(convert, 1000);
    };
    startGame = () => {
        this.playingSounds = [];
        this.minesPositions = [];
        this.playVolume = true;
        const gameTimeElement = document.querySelector(this.selectors.gameTime);
        gameTimeElement.innerText = `00:00`;
        gameTimeElement.style.display = "flex";
        const timer = document.querySelector(this.selectors.timerElement);
        timer.style.display = "flex";
        const amountFlagsElement = document.querySelector(
            this.selectors.amountFlags
        );
        amountFlagsElement.style.display = "flex";
        if (this.isPlaying) {
            this.revealed = 0;
            this.isPlaying = false;
            this.newGame();
            return;
        }
        this.isPlaying = true;
        this.allCells = [];
        this.allMines = 0;
        this.revealed = 0;
        const gameField = document.querySelector(
            this.selectors.gameFieldElement
        );
        const fieldSize = document.querySelector(
            this.selectors.fieldSizeSelect
        ).value;
        const viewWidth = window.innerWidth;
        if (fieldSize == "10x8") {
            this.fieldRows = 8;
            this.fieldCols = 10;
            this.allMines = 12;
            if (viewWidth < 800) {
                this.fieldRows = 10;
                this.fieldCols = 10;
            }
            if (viewWidth < 576) {
                this.fieldRows = 10;
                this.fieldCols = 6;
                this.allMines = 10;
            }
            this.amountFlags = this.allMines;
            gameField.classList.add("small");
            gameField.style.gridTemplateColumns = `repeat(${this.fieldCols},1fr)`;
            gameField.style.gridTemplateRows = `repeat(${this.fieldRows},1fr)`;
            amountFlagsElement.lastElementChild.innerText = this.amountFlags;
            this.field(gameField);
        } else if (fieldSize == "20x16") {
            this.fieldRows = 16;
            this.fieldCols = 20;
            this.allMines = 48;
            this.explosionFieldSize = 0.8;
            if (viewWidth < 790) {
                this.fieldRows = 14;
                this.fieldCols = 12;
                this.allMines = 34;
            }
            if (viewWidth < 576) {
                this.fieldRows = 16;
                this.fieldCols = 10;
                this.allMines = 28;
            }
            this.amountFlags = this.allMines;
            gameField.classList.add("middle");
            gameField.style.gridTemplateColumns = `repeat(${this.fieldCols},1fr)`;
            gameField.style.gridTemplateRows = `repeat(${this.fieldRows},1fr)`;
            amountFlagsElement.lastElementChild.innerText = this.amountFlags;
            this.field(gameField);
        } else if (fieldSize == "30x24") {
            this.fieldRows = 20;
            this.fieldCols = 26;
            this.allMines = 100;
            this.explosionFieldSize = 0.6;
            if (viewWidth < 860) {
                this.fieldRows = 20;
                this.fieldCols = 20;
                this.allMines = 70;
            }
            if (viewWidth < 730) {
                this.fieldRows = 20;
                this.fieldCols = 16;
                this.allMines = 60;
            }
            if (viewWidth < 576) {
                this.fieldRows = 20;
                this.fieldCols = 12;
                this.allMines = 46;
            }
            gameField.style.gridTemplateColumns = `repeat(${this.fieldCols},1fr)`;
            gameField.style.gridTemplateRows = `repeat(${this.fieldRows},1fr)`;
            this.amountFlags = this.allMines;
            gameField.classList.add("big");
            amountFlagsElement.lastElementChild.innerText = this.amountFlags;
            this.field(gameField);
        }
    };
    bindEvents = () => {
        const startGameBtn = document.querySelector(
            this.selectors.startGameBtn
        );
        const selectElement = document.querySelector(
            this.selectors.fieldSizeSelect
        );
        this.startGame();
        selectElement.addEventListener("input", () => this.startGame());
        startGameBtn.addEventListener("click", () => this.startGame());
    };
}
new mineSweeperGame();
