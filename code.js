class mineSweeperGame {
    audioCache = {};
    allCells = [];
    revealed = 0;
    allMines;
    amountFlags;
    isPlaying = false;
    timerInterval;
    soundSelectors = {
        victory: './sounds/victory.mp3',
        wasted: './sounds/gameOver.mp3',
        unhide1: './sounds/1unhide.wav',
        unhide2: './sounds/2unhide.wav',
        unhide3: './sounds/3unhide.wav',
        unhide4: './sounds/4unhide.wav',
        unhide5: './sounds/5unhide.wav',
        unhide6: './sounds/6unhide.wav',
        unhide7: './sounds/7unhide.wav',
        unhide8: './sounds/8unhide.wav',
        spawn: './sounds/spawn.wav',
        pullFlag: './sounds/pullFlag.wav',
        putFlag: './sounds/putFlag.wav',

    }
    selectors = {
        startGameBtn: ".startGame",
        fieldSizeSelect: ".fieldSize",
        gameFieldElement: ".gameField",
        gameOverSound: ".gameOverSound",
        gameVictorySound:'.gameVictorySound',
        resetGame: '.reset',
        questionEnd: '.questionEnd',
        newGameBtn: '.newGame',
        gameTime: '.gameTime',
        amountFlags: '.amountFlags',
        timerElement:'.timer'
    };
    fieldRows;
    fieldCols;
    constructor() {
        this.bindEvents();
    }
    playSound = (src) => {
        if (!this.audioCache[src]) {
            this.audioCache[src] = new Audio(src);
            this.audioCache[src].preload = 'auto'; 
        }
        const clone = this.audioCache[src].cloneNode();
        clone.play();
    
        clone.addEventListener('ended', () => {
        clone.remove(); // Удаляем после завершения
    });
    };
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
    // Maybe will help
    // exitGame=()=>{
    //     const amountFlagsElement = document.querySelector(this.selectors.amountFlags)
    //     amountFlagsElement.style.display ='none'
    //     const gameTimeElement = document.querySelector(this.selectors.gameTime)
    //     gameTimeElement.style.display = 'none'
    //     const gameField = document.querySelector(this.selectors.gameFieldElement)
    //     const resetWindow = document.querySelector(this.selectors.resetGame)
    //     const questionEnd = document.querySelector(this.selectors.questionEnd)
    //     gameField.classList.remove('small')
    //     gameField.classList.remove('middle')
    //     gameField.classList.remove('big')
    //     gameField.innerHTML = ''
    //     resetWindow.style.display = 'none'
    //     resetWindow.style.backgroundColor='rgba(155, 155, 155, 0)';
    //     questionEnd.style.opacity = '0',
    //     gameField.replaceWith(gameField.cloneNode(true));
    // }
    newGame=()=>{
        clearInterval(this.timerInterval)
        const amountFlagsElement = document.querySelector(this.selectors.amountFlags)
        amountFlagsElement.style.display ='none'
        const gameTimeElement = document.querySelector(this.selectors.gameTime)
        const timerElement = document.querySelector(this.selectors.timerElement)
        gameTimeElement.style.display = 'none'
        timerElement.style.display = 'none'
        const gameField = document.querySelector(this.selectors.gameFieldElement)
        const resetWindow = document.querySelector(this.selectors.resetGame)
        const questionEnd = document.querySelector(this.selectors.questionEnd)
        const questionEndImg = questionEnd.querySelector('img')
        if (questionEndImg){
             questionEnd.removeChild(questionEndImg)
        }
        gameField.classList.remove('small')
        gameField.classList.remove('middle')
        gameField.classList.remove('big')
        gameField.innerHTML = ''
        resetWindow.style.display = 'none'
        resetWindow.style.backgroundColor='rgba(155, 155, 155, 0)';
        questionEnd.style.opacity = '0',
        gameField.replaceWith(gameField.cloneNode(true));
        setTimeout(()=>{this.startGame()},50)
    }
    gameLost=()=>{
        this.playSound(this.soundSelectors.wasted)
        clearInterval(this.timerInterval)
        for (let row = 0; row < this.fieldRows; row++) {
            for (let col = 0; col < this.fieldCols; col++){
                if (this.allCells[row][col].isMine){
                    this.allCells[row][col].element.firstElementChild.style.display='flex'
                    const flag = this.allCells[row][col].element.querySelector('.flag')
                    if (flag){
                    this.allCells[row][col].isFlagged = false
                    this.allCells[row][col].element.removeChild(flag)
                    }
                }
            }
        }
        const resetWindow = document.querySelector(this.selectors.resetGame)
        const questionEnd = document.querySelector(this.selectors.questionEnd)
        let sadSapperImg = document.createElement('img')
        sadSapperImg.src = './images/sadSapper.jpg'
        questionEnd.prepend(sadSapperImg)
        resetWindow.style.display = 'flex'
        setTimeout(()=>{
        resetWindow.style.backgroundColor='rgba(0, 0, 0, 0.6)';
        questionEnd.style.opacity = '1'
        },2000
        )
        const newGameBtn = document.querySelector(this.selectors.newGameBtn)
        newGameBtn.addEventListener('click',()=>this.newGame(),{once:true})
    }
    gameWon=()=>{
        this.playSound(this.soundSelectors.victory)
        clearInterval(this.timerInterval)
        const resetWindow = document.querySelector(this.selectors.resetGame)
        const questionEnd = document.querySelector(this.selectors.questionEnd)
        let funnySapperImg = document.createElement('img')
        funnySapperImg.src = './images/funnySapper.jpg'
        questionEnd.prepend(funnySapperImg)
        resetWindow.style.display = 'flex'
        setTimeout(()=>{
        resetWindow.style.backgroundColor='rgba(0, 0, 0, 0.6)';
        questionEnd.style.opacity = '1'},2000)
        const newGameBtn = document.querySelector(this.selectors.newGameBtn)
        newGameBtn.addEventListener('click',()=>this.newGame(),{once:true})
    }
    setRedFlag = (event)=>{
        event.preventDefault();
        const amountFlagsElement = document.querySelector(this.selectors.amountFlags)
        const target = event.target.closest(".fieldCell");        
        if (!target) {
            return;
        }
        const currRow = parseInt(target.getAttribute("row"));
        const currCol = parseInt(target.getAttribute("col"));
        if (this.allCells[currRow][currCol].isRevealed){return}
        if (this.allCells[currRow][currCol].isFlagged){
            const flag = this.allCells[currRow][currCol].element.querySelector('.flag')
            this.allCells[currRow][currCol].isFlagged = false
            this.amountFlags++
            amountFlagsElement.lastElementChild.innerText = this.amountFlags
            this.allCells[currRow][currCol].element.removeChild(flag)
            this.playSound(this.soundSelectors.pullFlag)
            return
        }if (this.amountFlags==0){return}
        this.amountFlags--
        amountFlagsElement.lastElementChild.innerText = this.amountFlags
        let img = document.createElement("img");
        img.src = "./svgs/redFlag.svg";
        img.classList.add('flag')
        this.playSound(this.soundSelectors.putFlag)
        this.allCells[currRow][currCol].element.appendChild(img);
        this.allCells[currRow][currCol].isFlagged = true
    }
    startCheck = (event) => {
        if (event.button ===2){return}
        const target = event.target.closest(".fieldCell");        
        if (!target) {
            return;
        }
        const currRow = parseInt(target.getAttribute("row"));
        const currCol = parseInt(target.getAttribute("col"));
        if (this.allCells[currRow][currCol].isRevealed || this.allCells[currRow][currCol].isFlagged)
            {return}
        if (this.allCells[currRow][currCol].isMine) {
            this.gameLost()
            return
        }
        const wrap = target.firstElementChild 
        wrap.style.display = "flex";
        this.createParticle(wrap)
        if (this.allCells[currRow][currCol].mineCount==0){
            this.playSound(this.soundSelectors.spawn)
            this.removeExtraEmpty(currRow,currCol)
            return
        }
        const currCell = this.allCells[currRow][currCol];
        console.log(`unhide${wrap.innerText}`);
        
        this.playSound(this.soundSelectors[`unhide${wrap.innerText}`])

        currCell.isRevealed = true;
        this.revealed++;
        if (this.revealed == (this.fieldRows*this.fieldCols - this.allMines)) {
            this.gameWon()
            return
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
                            const flag = this.allCells[newRow][newCol].element.querySelector('.flag')
                            this.allCells[newRow][newCol].isFlagged = false
                            this.allCells[newRow][newCol].element.removeChild(flag)
                        }                    
                        neighbour.isRevealed = true;
                        this.revealed++;
                        const wrap = neighbour.element.firstElementChild
                        wrap.style.display = "flex"; 
                        this.createParticle(wrap)
                        if (this.revealed == this.fieldRows*this.fieldCols-this.allMines){
                            this.gameWon()
                        }                  
                        if (neighbour.mineCount == 0){
                        this.removeExtraEmpty(newRow, newCol)            
                        }
                    }
                }
            }
        }
    };
    revealNeighbours = (event) => {
        const target = event.target.closest(".fieldCell");        
        if (!target) {
            return;
        }
        const currRow = parseInt(target.getAttribute("row"));
        const currCol = parseInt(target.getAttribute("col"));
        const minesAround = this.allCells[currRow][currCol].mineCount
        let counterFlags = 0
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
                    if (this.allCells[newRow][newCol].isFlagged){
                        counterFlags++
                    }
                }
            }
        }
        if (counterFlags<minesAround){
            return
        }
        let maxNum = 1
        let playNum = true
        let playNumSound = false
        if (this.allCells[currRow][currCol].isFlagged){return}
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
                    if (this.allCells[newRow][newCol].isFlagged || this.allCells[newRow][newCol].isRevealed){continue}
                    if (this.allCells[newRow][newCol].isMine){
                        this.gameLost()
                        return
                    }
                    if (this.allCells[newRow][newCol].mineCount==0){
                        this.playSound(this.soundSelectors.spawn)
                        this.removeExtraEmpty(newRow,newCol)
                        playNum = false
                        continue
                    }
                    const wrap = this.allCells[newRow][newCol].element.firstElementChild                              
                    wrap.style.display = 'flex'
                    this.createParticle(wrap)
                    this.revealed++      
                    this.allCells[newRow][newCol].isRevealed = true
                    playNumSound = true
                    if (maxNum<parseInt(wrap.innerText)){
                        maxNum = parseInt(wrap.innerText)
                        this.playSound(this.soundSelectors[`unhide${wrap.innerText}`])
                    }
                    if (this.revealed==(this.fieldRows*this.fieldCols - this.allMines)){this.gameWon()}
                }
            }
        }
        if (playNum&&playNumSound){

            this.playSound(this.soundSelectors[`unhide${maxNum}`])
        }
    }
    createParticle = (element)=>{
        const particle = document.createElement('div');
        particle.className = 'particle';
        element.appendChild(particle)
        let randDeg30 = (Math.random()-0.5)*80
        let randX30 = (Math.random()-0.5)*80
        let randY30 = (Math.random()-0.5)*80
        let randDeg70 = randDeg30*1.6
        let randX70 = randX30*2.4
        let randY70 = randY30*1.6
        let randDeg100 = randDeg70*1.6
        let randX100 = randX70*1.4
        let randY100 = randY70*1.2
        particle.style.setProperty('--randDeg30',`${randDeg30}deg`)
        particle.style.setProperty('--randX30',`${randX30}px`)
        particle.style.setProperty('--randY30',`${randY30}px`)
        particle.style.setProperty('--randDeg70',`${randDeg70}deg`)
        particle.style.setProperty('--randX70',`${randX70}px`)
        particle.style.setProperty('--randY70',`${randY70}px`)
        particle.style.setProperty('--randDeg100',`${randDeg100}deg`)
        particle.style.setProperty('--randX100',`${randX100}px`)
        particle.style.setProperty('--randY100',`${randY100}px`)
        particle.addEventListener('animationend',()=>element.removeChild(particle),{once:true})
    }
    spawnBombs = (event) => {
        if (event.button ===2){return}
        const target = event.target.closest(".fieldCell");
        if (!target) {
            return;
        }
        const startRow = parseInt(target.getAttribute("row"));
        const startCol = parseInt(target.getAttribute("col"));
        this.allCells[startRow][startCol].isRevealed = true;

        const wrap = this.allCells[startRow][
            startCol
        ].element.firstElementChild

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
                let img = document.createElement("img");
                img.src = "./svgs/bomb.svg";
                this.allCells[randRow][
                    randCol
                ].element.firstElementChild.appendChild(img);
                this.allCells[randRow][randCol].isMine = true;
                spawnedMines++;
            }
        }
        const gameField = document.querySelector(
            this.selectors.gameFieldElement
        );
        this.setNums();
        this.createParticle(wrap)
        this.playSound(this.soundSelectors.spawn)
        this.removeExtraEmpty(startRow, startCol);
        this.startGameTimer()
        gameField.addEventListener("dblclick", (event) => this.revealNeighbours(event));
        gameField.addEventListener("pointerdown", (event) => this.startCheck(event));
        gameField.addEventListener("contextmenu", (event) => this.setRedFlag(event));
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
                if ((row+col)%2==0){
                    cell.style.backgroundColor = 'var(--lightGreen)'
                    wrap.style.backgroundColor = 'var(--lightYellow)'
                }
                else{
                    cell.style.backgroundColor = 'var(--littleDarkGreen)'
                    wrap.style.backgroundColor = 'var(--darkYellow)'
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
        gameField.addEventListener("pointerdown", (event) => this.spawnBombs(event),{once:true});
    };
    startGameTimer = ()=>{
        if (this.timerInterval){
            clearInterval(this.timerInterval)
        }    
        const gameTimeElement = document.querySelector(this.selectors.gameTime)
        const timer = document.querySelector(this.selectors.timerElement)
        timer.style.display ='flex'
        gameTimeElement.innerText = `00:00`
        gameTimeElement.style.display = 'flex'
        const startTime = new Date()
        function convert(){
            const currTime = new Date()
            const startMin = (currTime - startTime)/1000
            const startSec = Math.trunc((currTime - startTime)/1000)
            const minDiff = `${Math.trunc(startMin/60)}`.padStart(2,0)
            const secDiff = `${startSec%60}`.padStart(2,0)        
            const time = `${minDiff}:${secDiff}`
            gameTimeElement.innerText = time
        }
        this.timerInterval = setInterval(convert,1000)
        
    }
    startGame = () => {
        const gameTimeElement = document.querySelector(this.selectors.gameTime)
        gameTimeElement.innerText = `00:00`
        gameTimeElement.style.display = 'flex'
        const timer = document.querySelector(this.selectors.timerElement)
        timer.style.display ='flex'
        const amountFlagsElement = document.querySelector(this.selectors.amountFlags)
        amountFlagsElement.style.display = 'flex'
        if (this.isPlaying){
            this.revealed = 0
            this.isPlaying=false
            this.newGame()
            return
        }
        this.isPlaying = true
        this.allCells = []
        this.allMines = 0
        this.revealed = 0
        const gameField = document.querySelector(
            this.selectors.gameFieldElement
        );
        const fieldSize = document.querySelector(
            this.selectors.fieldSizeSelect
        ).value;
        const viewWidth = window.innerWidth
        if (fieldSize == "10x8") {
            this.fieldRows = 8;
            this.fieldCols = 10;
            this.allMines = 12;
            if (viewWidth<800){
                this.fieldRows = 10
                this.fieldCols = 10
            }
            if (viewWidth<576){
                this.fieldRows = 10
                this.fieldCols = 6
                this.allMines = 10;
            }
            this.amountFlags = this.allMines
            gameField.classList.add("small");
            gameField.style.gridTemplateColumns= `repeat(${this.fieldCols},1fr)`;
            gameField.style.gridTemplateRows = `repeat(${this.fieldRows},1fr)`;
            amountFlagsElement.lastElementChild.innerText = this.amountFlags
            this.field(gameField);
        } else if (fieldSize == "20x16") {
            this.fieldRows = 16;
            this.fieldCols = 20;
            this.allMines = 48;
            if (viewWidth<790){
                this.fieldRows= 14
                this.fieldCols = 12
                this.allMines = 34
            }
            if (viewWidth<576){
                this.fieldRows = 16
                this.fieldCols = 10
                this.allMines = 28
            }
            this.amountFlags = this.allMines
            gameField.classList.add("middle");
            gameField.style.gridTemplateColumns= `repeat(${this.fieldCols},1fr)`;
            gameField.style.gridTemplateRows = `repeat(${this.fieldRows},1fr)`;
             amountFlagsElement.lastElementChild.innerText = this.amountFlags
            this.field(gameField);
        } else if (fieldSize == "30x24") {
            this.fieldRows = 20;
            this.fieldCols = 26;
            this.allMines = 100;
            if (viewWidth<860){
                this.fieldRows = 20
                this.fieldCols = 20
                this.allMines = 70
            }
            if (viewWidth<730){
                this.fieldRows = 20;
                this.fieldCols = 16;
                this.allMines = 60
            }
            if (viewWidth<576){
                this.fieldRows = 20
                this.fieldCols = 12
                this.allMines = 46
            }
            gameField.style.gridTemplateColumns= `repeat(${this.fieldCols},1fr)`;
            gameField.style.gridTemplateRows = `repeat(${this.fieldRows},1fr)`;
            this.amountFlags = this.allMines
            gameField.classList.add("big");
             amountFlagsElement.lastElementChild.innerText = this.amountFlags
            this.field(gameField);
        }
    };
    bindEvents = () => {
        const startGameBtn = document.querySelector(
            this.selectors.startGameBtn
        );
        const selectElement = document.querySelector(
            this.selectors.fieldSizeSelect
        )
        this.startGame()
        selectElement.addEventListener('input',()=>this.startGame())
        startGameBtn.addEventListener("click", () => this.startGame());
    };
}
new mineSweeperGame();