class mineSweeperGame {
    allCells = [];
    revealed = 0;
    allMines;
    amountFlags;
    isPlaying = false;
    timerInterval;
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
        let audio = document.querySelector(this.selectors.gameOverSound)
        clearInterval(this.timerInterval)
        audio.volume = 0.5
        audio.play()
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
        },1000
        )
        const newGameBtn = document.querySelector(this.selectors.newGameBtn)
        newGameBtn.addEventListener('click',()=>this.newGame(),{once:true})
    }
    gameWon=()=>{
        let audio = document.querySelector(this.selectors.gameVictorySound)
        audio.play()
        clearInterval(this.timerInterval)
        const resetWindow = document.querySelector(this.selectors.resetGame)
        const questionEnd = document.querySelector(this.selectors.questionEnd)
        let funnySapperImg = document.createElement('img')
        funnySapperImg.src = './images/funnySapper.jpg'
        questionEnd.prepend(funnySapperImg)
        resetWindow.style.display = 'flex'
        setTimeout(()=>{
        resetWindow.style.backgroundColor='rgba(0, 0, 0, 0.6)';
        questionEnd.style.opacity = '1'},1000)
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
            return
        }if (this.amountFlags==0){return}
        this.amountFlags--
        amountFlagsElement.lastElementChild.innerText = this.amountFlags
        let img = document.createElement("img");
        img.src = "./images/redFlag.svg";
        img.classList.add('flag')
        this.allCells[currRow][currCol].element.appendChild(img);
        this.allCells[currRow][currCol].isFlagged = true
    }
    startCheck = (event) => {
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
        target.firstElementChild.style.display = "flex";
        if (this.allCells[currRow][currCol].mineCount==0){
            this.removeExtraEmpty(currRow,currCol)
            return
        }
        const currCell = this.allCells[currRow][currCol];
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
                        neighbour.element.firstElementChild.style.display = "flex"; 
                        if (this.revealed == this.fieldRows*this.fieldCols-this.allMines){
                            this.gameWon()
                        }                  
                        if (neighbour.mineCount == 0){
                        this.removeExtraEmpty(newRow, newCol)}
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
                        this.removeExtraEmpty(newRow,newCol)
                        continue
                    }                                 
                    this.allCells[newRow][newCol].element.firstElementChild.style.display = 'flex'
                    this.revealed++      
                    this.allCells[newRow][newCol].isRevealed = true    
                    if (this.revealed==(this.fieldRows*this.fieldCols - this.allMines)){this.gameWon()}
                }
            }
        }
    }
    spawnBombs = (event) => {
        const target = event.target.closest(".fieldCell");
        if (!target) {
            return;
        }
        const startRow = parseInt(target.getAttribute("row"));
        const startCol = parseInt(target.getAttribute("col"));
        this.allCells[startRow][startCol].isRevealed = true;
        this.allCells[startRow][
            startCol
        ].element.firstElementChild.style.display = "flex";
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
                img.src = "./images/bomb.svg";
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
        this.removeExtraEmpty(startRow, startCol);
        this.startGameTimer()
        gameField.addEventListener("dblclick", (event) => this.revealNeighbours(event));
        gameField.addEventListener("click", (event) => this.startCheck(event));
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
        gameField.addEventListener("click", (event) => this.spawnBombs(event),{once:true});
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
                this.fieldCols = 8
            }
            if (viewWidth<560){
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
            this.amountFlags = this.allMines
            gameField.classList.add("middle");
             amountFlagsElement.lastElementChild.innerText = this.amountFlags
            this.field(gameField);
        } else if (fieldSize == "30x24") {
            this.fieldRows = 24;
            this.fieldCols = 30;
            this.allMines = 144;
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