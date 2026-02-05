export function createGameInstance(canvasElement, uiCallbacks) {
  if (!canvasElement) {
    console.error("Elemento canvas não fornecido para createGameInstance.");
    return { start: () => {}, restart: () => {}, continueNextLevel: () => {}, processKeyDown: () => {}, destroy: () => {} };
  }

  const ctx = canvasElement.getContext("2d");
  const gridSize = 30; 

  const initialCanvasWidth = 580;
  const initialCanvasHeight = 580;
  canvasElement.width = Math.floor(initialCanvasWidth / gridSize) * gridSize; 
  canvasElement.height = Math.floor(initialCanvasHeight / gridSize) * gridSize; 
  
  const foodScale = 1.3;
  const minFoodSeparationDistance = gridSize * 3; 
  const foodRevealInterval = 150; 
  const foodAppearAnimationDuration = 200; 

  let eatSoundSynth;
  let levelUpSoundSynth; 
  let gameOverSoundSynth; 
  let musicSynth; 
  let musicLoop;  

  try {
    if (typeof Tone !== 'undefined' && Tone && Tone.Synth && Tone.Loop && Tone.Transport) {
        eatSoundSynth = new Tone.Synth().toDestination();
        
        levelUpSoundSynth = new Tone.Synth({
            oscillator: { type: "triangle" },
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.5 }
        }).toDestination();
        levelUpSoundSynth.volume.value = -6;

        gameOverSoundSynth = new Tone.Synth({
            oscillator: { type: "triangle" }, 
            envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.6 } 
        }).toDestination();
        gameOverSoundSynth.volume.value = -7; 

        musicSynth = new Tone.Synth({
            oscillator: { type: "sine" }, 
            envelope: { attack: 0.05, decay: 0.1, sustain: 0.2, release: 0.3 }
        }).toDestination();
        musicSynth.volume.value = -16; // Volume da música de fundo

        // Melodia da música de fundo mais longa e aguda
        const melody = [ 
            // Compasso 1
            { time: "0:0:0", note: "G5", duration: "8n" }, 
            { time: "0:0:2", note: "E5", duration: "8n" }, 
            { time: "0:1:0", note: "C5", duration: "8n" }, 
            { time: "0:1:2", note: "E5", duration: "8n" },
            { time: "0:2:0", note: "D5", duration: "8n" }, 
            { time: "0:2:2", note: "B4", duration: "8n" },
            { time: "0:3:0", note: "C5", duration: "4n" }, // Nota mais longa no final do primeiro compasso
            // Compasso 2
            { time: "1:0:0", note: "A4", duration: "8n" },
            { time: "1:0:2", note: "C5", duration: "8n" },
            { time: "1:1:0", note: "E5", duration: "8n" },
            { time: "1:1:2", note: "D5", duration: "8n" },
            { time: "1:2:0", note: "B4", duration: "8n" },
            { time: "1:2:2", note: "G4", duration: "8n" },
            { time: "1:3:0", note: "A4", duration: "4n" }, // Nota mais longa no final do segundo compasso
        ];
        
        musicLoop = new Tone.Part((time, value) => {
            musicSynth.triggerAttackRelease(value.note, value.duration, time);
        }, melody);
        musicLoop.loop = true; 
        musicLoop.loopEnd = "2m"; // Loop de 2 compassos
        Tone.Transport.bpm.value = 110; // Velocidade da música

    } else {
        console.warn("Tone.js ou seus componentes (Synth, Loop, Transport) não estão disponíveis globalmente. Efeitos sonoros e música desabilitados.");
    }
  } catch (e) {
    console.error("Erro ao inicializar Tone.js ou seus componentes:", e);
    eatSoundSynth = null; 
    levelUpSoundSynth = null;
    gameOverSoundSynth = null; 
    musicSynth = null;
    musicLoop = null;
  }

  let snake;
  let dx;
  let dy;
  let score;
  let pointsThisLevel;
  let level;
  let gameSpeed;
  let gameLoopTimeout;
  let isGameCurrentlyOver;
  let foodsOnScreen = [];
  let snakeTargetFoodType = null; 
  let isWaitingForUserAction;
  let foodCountByType;
  let currentFood = null;

  const foodTypes = [
    { name: "papel", color: "#006aa4", displayName: "Papel (Azul)" }, 
    { name: "plastico", color: "#cb2716", displayName: "Plástico (Vermelho)" }, 
    { name: "vidro", color: "#295a0f", displayName: "Vidro (Verde)" }, 
    { name: "metal", color: "#d2ac0f", displayName: "Metal (Amarelo)" }, 
    { name: "organico", color: "#8b6139", displayName: "Orgânico (Marrom)" } 
  ];

  const foodImages = {};
  let imagesLoaded = 0;
  const totalImages = foodTypes.length;
  let onAllImagesLoadedCallback = () => {};

  foodTypes.forEach(type => {
    const img = new Image();
    img.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === totalImages && typeof onAllImagesLoadedCallback === 'function') {
        onAllImagesLoadedCallback();
      }
    };
    img.onerror = () => {
        console.error(`Erro ao carregar imagem: ${type.src}`);
        imagesLoaded++;
         if (imagesLoaded === totalImages && typeof onAllImagesLoadedCallback === 'function') {
            onAllImagesLoadedCallback();
        }
    };
    img.src = `/assets/imgs/${type.name === "organico" ? "maca" : type.name}.png`;
    foodImages[type.name] = img;
  });

  const {
    updateScoreDisplay,
    updateLevelDisplay,
    showGameOverScreen,
    hideGameOverScreen,
    showNextLevelScreenUI,
    hideNextLevelScreenUI
  } = uiCallbacks;

  function playEatSound() {
    if (eatSoundSynth && typeof Tone !== 'undefined' && Tone && Tone.now) { 
      try {
        if (Tone.context.state !== 'running') return; 
        eatSoundSynth.triggerAttackRelease("C5", "16n", Tone.now()); 
      } catch (e) { console.error("Erro ao tocar som de comer:", e); }
    }
  }

  function playLevelUpSound() {
    if (levelUpSoundSynth && typeof Tone !== 'undefined' && Tone && Tone.now) {
      try {
        if (Tone.context.state !== 'running') return;
        const now = Tone.now();
        levelUpSoundSynth.triggerAttackRelease("C4", "8n", now);
        levelUpSoundSynth.triggerAttackRelease("E4", "8n", now + 0.15);
        levelUpSoundSynth.triggerAttackRelease("G4", "8n", now + 0.3);
        levelUpSoundSynth.triggerAttackRelease("C5", "4n", now + 0.45); 
      } catch (e) { console.error("Erro ao tocar som de level up:", e); }
    }
  }

  function playGameOverSound() {
    if (gameOverSoundSynth && typeof Tone !== 'undefined' && Tone && Tone.now) {
      try {
        if (Tone.context.state !== 'running') return;
        const now = Tone.now();
        // MODIFICAÇÃO: Sequência descendente, "triste"
        gameOverSoundSynth.triggerAttackRelease("C5", "8n", now); 
        gameOverSoundSynth.triggerAttackRelease("G4", "8n", now + 0.2); 
        gameOverSoundSynth.triggerAttackRelease("E4", "8n", now + 0.4); 
        gameOverSoundSynth.triggerAttackRelease("C4", "4n", now + 0.6); // Nota final grave e mais longa
      } catch (e) { console.error("Erro ao tocar som de game over:", e); }
    }
  }

  function startMusic() {
    if (musicLoop && typeof Tone !== 'undefined' && Tone && Tone.Transport) {
        if (Tone.context.state === 'running') {
            if (Tone.Transport.state !== "started") {
                Tone.Transport.start(); 
            }
            if (!musicLoop.started) { 
                 musicLoop.start(0); 
            }
        } else {
            // console.warn("Contexto de áudio não iniciado, música não pode começar.");
        }
    }
  }

  function stopMusic() {
    if (musicLoop && typeof Tone !== 'undefined' && Tone && Tone.Transport) {
        if (musicLoop.started) {
            musicLoop.stop(0); 
        }
        if (Tone.Transport.state === "started") {
          Tone.Transport.pause(); 
        }
    }
  }


  function drawSnake() {
    if (!snake || snake.length === 0) return;
    ctx.fillStyle = snake[0].color; 
    const halfGrid = gridSize / 2;
    for (let i = 0; i < snake.length - 1; i++) {
        const seg1 = snake[i];
        const seg2 = snake[i+1];
        const centerX1 = seg1.x + halfGrid;
        const centerY1 = seg1.y + halfGrid;
        const centerX2 = seg2.x + halfGrid;
        const centerY2 = seg2.y + halfGrid;
        if (seg1.x === seg2.x) { 
            ctx.fillRect(seg1.x, Math.min(centerY1, centerY2), gridSize, Math.abs(centerY1 - centerY2));
        } else if (seg1.y === seg2.y) { 
            ctx.fillRect(Math.min(centerX1, centerX2), seg1.y, Math.abs(centerX1 - centerX2), gridSize);
        }
    }
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        ctx.beginPath();
        ctx.arc(segment.x + halfGrid, segment.y + halfGrid, halfGrid, 0, 2 * Math.PI);
        ctx.fill();
    }
  }

  function drawFood() {
    if (!ctx) return;
    
    const drawSingleFoodItem = (foodItem) => {
        if (!foodItem || !foodItem.type || !foodItem.isRevealed) return; 

        let currentScale = foodScale;
        let currentAlpha = 1.0;

        if (foodItem.revealStartTime) {
            const timeSinceReveal = Date.now() - foodItem.revealStartTime;
            if (timeSinceReveal < foodAppearAnimationDuration) {
                const progress = timeSinceReveal / foodAppearAnimationDuration;
                currentScale = foodScale * progress; 
                currentAlpha = progress; 
            } else {
                delete foodItem.revealStartTime; 
            }
        }
        
        const size = gridSize * currentScale;
        const offset = (size - gridSize) / 2;
        const image = foodImages[foodItem.type.name];

        ctx.globalAlpha = currentAlpha; 

        if (image && image.complete && image.naturalHeight !== 0) {
            try {
                ctx.drawImage(image, foodItem.x - offset, foodItem.y - offset, size, size);
            } catch (e) {
                ctx.fillStyle = foodItem.type.color;
                ctx.fillRect(foodItem.x, foodItem.y, gridSize * currentScale, gridSize * currentScale); 
            }
        } else {
            ctx.fillStyle = foodItem.type.color;
            ctx.fillRect(foodItem.x, foodItem.y, gridSize * currentScale, gridSize * currentScale); 
        }
        ctx.globalAlpha = 1.0; 
    };

    if (level === 1) {
        if (currentFood) drawSingleFoodItem(currentFood);
    } else {
        foodsOnScreen.forEach(drawSingleFoodItem);
    }
  }
  
  function internalUpdateScore() {
    if (typeof updateScoreDisplay === 'function') updateScoreDisplay(score);
  }

  function internalUpdateLevelDisplay() {
    if (typeof updateLevelDisplay === 'function') updateLevelDisplay(level);
  }

  function revealFoodsSequentially(foodItems) {
    if (!Array.isArray(foodItems)) foodItems = [foodItems]; 
    
    let revealDelay = 0;
    foodItems.forEach(food => {
      if (food) { 
        setTimeout(() => {
          if (food) { 
            food.isRevealed = true;
            food.revealStartTime = Date.now();
          }
        }, revealDelay);
        revealDelay += foodRevealInterval;
      }
    });
  }

  function moveSnake() {
    if (isGameCurrentlyOver || isWaitingForUserAction || !snake || snake.length === 0) return;

    const headX = snake[0].x + dx;
    const headY = snake[0].y + dy;

    if (headX < 0 || headX + gridSize > canvasElement.width || headY < 0 || headY + gridSize > canvasElement.height) {
      triggerGameOver();
      return;
    }

    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === headX && snake[i].y === headY) {
        triggerGameOver();
        return;
      }
    }

    let ateFood = false;
    let foodEatenThisTurn = null; 

    if (level === 1) {
      if (currentFood && currentFood.isRevealed && headX === currentFood.x && headY === currentFood.y) { 
        if (!snakeTargetFoodType || currentFood.type.name !== snakeTargetFoodType.name) { 
          triggerGameOver();
          return;
        }
        ateFood = true;
        foodEatenThisTurn = currentFood;
        currentFood = null; 
      }
    } else { 
      let foodIndexToRemove = -1;
      for (let i = 0; i < foodsOnScreen.length; i++) {
        const foodOnScreen = foodsOnScreen[i];
        if (foodOnScreen.isRevealed && headX === foodOnScreen.x && headY === foodOnScreen.y) { 
          if (!snakeTargetFoodType || foodOnScreen.type.name !== snakeTargetFoodType.name) { 
            triggerGameOver();
            return;
          }
          ateFood = true;
          foodEatenThisTurn = foodOnScreen;
          foodIndexToRemove = i;
          break;
        }
      }
      if (foodIndexToRemove !== -1) {
        foodsOnScreen.splice(foodIndexToRemove, 1);
      }
    }

    let newHeadColor = snake[0].color; 

    if (ateFood && foodEatenThisTurn) {
      playEatSound(); 
      score++;
      pointsThisLevel++;
      if (foodCountByType.hasOwnProperty(foodEatenThisTurn.type.name)) {
        foodCountByType[foodEatenThisTurn.type.name]++;
      }
      internalUpdateScore();

      snakeTargetFoodType = getRandomFoodType();
      newHeadColor = snakeTargetFoodType.color;

      if (pointsThisLevel >= 5) { 
        level++;
        internalUpdateLevelDisplay();
        triggerNextLevelScreen(); 
        const newHead = { x: headX, y: headY, color: newHeadColor }; 
        snake.unshift(newHead); 
        return; 
      }
      
      if (gameSpeed > 50) {
        gameSpeed -= 2; 
        if (gameSpeed < 50) gameSpeed = 50;
      }

      if (level === 1) {
        currentFood = spawnFood(snakeTargetFoodType, []); 
        if (currentFood) revealFoodsSequentially([currentFood]); 
        else { 
            const randomType = getRandomFoodType();
            currentFood = spawnFood(randomType, []); 
            if(currentFood) {
                revealFoodsSequentially([currentFood]);
                if(!snakeTargetFoodType || snakeTargetFoodType.name !== randomType.name){ 
                    snakeTargetFoodType = randomType;
                    newHeadColor = snakeTargetFoodType.color; 
                }
            }
        }
      } else { 
        prepareMultiFoodLevel(); 
      }
       const newHeadGrowing = { x: headX, y: headY, color: newHeadColor };
       snake.unshift(newHeadGrowing);

    } else { 
      snake.pop(); 
      const newHeadMoving = { x: headX, y: headY, color: newHeadColor }; 
      snake.unshift(newHeadMoving);
    }
  }

  function getRandomFoodType() {
    return foodTypes[Math.floor(Math.random() * foodTypes.length)];
  }

  function spawnFood(typeToSpawn, currentBatchFoods = []) {
    if (!typeToSpawn) return null;
    const drawnSize = gridSize * foodScale;
    const offset = (drawnSize - gridSize) / 2;
    const firstValidXCellIndex = Math.ceil(offset / gridSize);
    const lastValidXCellIndex = Math.floor((canvasElement.width - drawnSize + offset) / gridSize);
    const firstValidYCellIndex = Math.ceil(offset / gridSize);
    const lastValidYCellIndex = Math.floor((canvasElement.height - drawnSize + offset) / gridSize);

    if (lastValidXCellIndex < firstValidXCellIndex || lastValidYCellIndex < firstValidYCellIndex) return null;
    const numXCells = lastValidXCellIndex - firstValidXCellIndex + 1;
    const numYCells = lastValidYCellIndex - firstValidYCellIndex + 1;

    let newFoodData;
    let tries = 0;
    do {
        const randomXGridIndex = firstValidXCellIndex + Math.floor(Math.random() * numXCells);
        const randomYGridIndex = firstValidYCellIndex + Math.floor(Math.random() * numYCells);
        newFoodData = {
            x: randomXGridIndex * gridSize,
            y: randomYGridIndex * gridSize,
            type: typeToSpawn,
            isRevealed: false, 
            revealStartTime: null
        };
        tries++;
    } while (isOccupied(newFoodData.x, newFoodData.y, currentBatchFoods) && tries < 100); 
    return tries < 100 ? newFoodData : null;
  }

  function prepareMultiFoodLevel() {
    const localFoodsForThisLevel = []; 
    const foodCount = Math.min(level, foodTypes.length, 5);

    if (!snakeTargetFoodType) snakeTargetFoodType = getRandomFoodType();
    if (snake && snake.length > 0) snake[0].color = snakeTargetFoodType.color;
    else { triggerGameOver(); return; }
    
    const targetFood = spawnFood(snakeTargetFoodType, localFoodsForThisLevel); 
    if (targetFood) {
        localFoodsForThisLevel.push(targetFood);
    }

    const remainingSlotsToFill = foodCount - localFoodsForThisLevel.length;
    if (remainingSlotsToFill > 0) {
        let otherAvailableTypes = foodTypes.filter(ft => !snakeTargetFoodType || ft.name !== snakeTargetFoodType.name);
        for (let i = 0; i < remainingSlotsToFill; i++) {
            let typeToSpawn;
            if (otherAvailableTypes.length > 0) {
                const typeIndex = Math.floor(Math.random() * otherAvailableTypes.length);
                typeToSpawn = otherAvailableTypes.splice(typeIndex, 1)[0];
            } else typeToSpawn = getRandomFoodType(); 
            
            const food = spawnFood(typeToSpawn, localFoodsForThisLevel); 
            if (food) localFoodsForThisLevel.push(food);
        }
    }
    
    foodsOnScreen = [...localFoodsForThisLevel]; 

    let currentTargetIsActuallySpawned = foodsOnScreen.some(f => f.type.name === snakeTargetFoodType.name);
    if (foodsOnScreen.length === 0 || !currentTargetIsActuallySpawned) {
        console.warn(`Comida alvo (${snakeTargetFoodType.name}) não está na lista de spawn ou nenhuma comida gerada. Corrigindo...`);
        foodsOnScreen = []; 
        const forcedTargetFood = spawnFood(snakeTargetFoodType, []); 
        if (forcedTargetFood) {
            foodsOnScreen.push(forcedTargetFood);
        } else {
            let foundAndPlacedNewTarget = false;
            for (const possibleNewTarget of foodTypes) {
                const emergencyFood = spawnFood(possibleNewTarget, []); 
                if (emergencyFood) {
                    foodsOnScreen.push(emergencyFood);
                    snakeTargetFoodType = possibleNewTarget; 
                    if (snake && snake.length > 0) snake[0].color = snakeTargetFoodType.color; 
                    foundAndPlacedNewTarget = true; break; 
                }
            }
            if (!foundAndPlacedNewTarget) { triggerGameOver(); return; }
        }
    }
    
    if (foodsOnScreen.length > 0 && !foodsOnScreen.some(f => f.type.name === snakeTargetFoodType.name)) {
        console.warn("Ainda sem comida alvo na tela após fallback, ajustando para a primeira comida disponível.");
        snakeTargetFoodType = foodsOnScreen[0].type; 
        if (snake && snake.length > 0) snake[0].color = snakeTargetFoodType.color;
    }

    if (foodsOnScreen.length === 0 && foodCount > 0) { 
        console.error("Erro final: Nenhuma comida na tela após prepareMultiFoodLevel. Forçando Game Over.");
        triggerGameOver();
        return; 
    }

    revealFoodsSequentially(foodsOnScreen); 
  }

  function drawGameElements() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    drawSnake();
    drawFood();
  }

  function triggerGameOver() {
    clearTimeout(gameLoopTimeout);
    isGameCurrentlyOver = true;
    isWaitingForUserAction = true;
    stopMusic(); 
    playGameOverSound(); 
    const statsData = Object.entries(foodCountByType).map(([type, count]) => ({ type: foodTypes.find(ft => ft.name === type)?.displayName || type, count }));
    if (typeof showGameOverScreen === 'function') showGameOverScreen(score, statsData);
  }
  
  function triggerNextLevelScreen() {
    clearTimeout(gameLoopTimeout);
    isWaitingForUserAction = true; 
    stopMusic(); 
    playLevelUpSound(); 
    const statsData = Object.entries(foodCountByType).map(([type, count]) => ({ type: foodTypes.find(ft => ft.name === type)?.displayName || type, count }));
    if (typeof showNextLevelScreenUI === 'function') showNextLevelScreenUI(statsData);
  }

  function resetGameState() {
    snakeTargetFoodType = getRandomFoodType();
    snake = [{ x: 150, y: 150, color: snakeTargetFoodType.color }];
    dx = gridSize; dy = 0; score = 0; pointsThisLevel = 0; level = 1;
    gameSpeed = 150; isGameCurrentlyOver = false; isWaitingForUserAction = false;
    foodsOnScreen = [];
    foodCountByType = { plastico: 0, metal: 0, papel: 0, vidro: 0, organico: 0 };
    currentFood = null; 
    currentFood = spawnFood(snakeTargetFoodType, []); 
    if (currentFood) {
        revealFoodsSequentially([currentFood]); 
    } else {
        const randomType = getRandomFoodType(); currentFood = spawnFood(randomType, []); 
         if (!currentFood) { triggerGameOver(); }
         else {
            revealFoodsSequentially([currentFood]);
            if (currentFood.type.name !== snakeTargetFoodType.name) {
                snakeTargetFoodType = currentFood.type;
                if (snake && snake.length > 0) snake[0].color = snakeTargetFoodType.color;
            }
         }
    }
  }

  function gameLoop() {
    clearTimeout(gameLoopTimeout); 
    if (isGameCurrentlyOver || isWaitingForUserAction) {
      gameLoopTimeout = setTimeout(gameLoop, gameSpeed); 
      return;
    }
    
    moveSnake();
    drawGameElements();
    gameLoopTimeout = setTimeout(gameLoop, gameSpeed);
  }

  function isOccupied(x, y, currentBatchFoods = []) {
    if (snake) {
        for (let segment of snake) {
            if (segment.x === x && segment.y === y) return true;
        }
    }

    const globallyVisibleFoods = [];
    if (currentFood && level === 1 && currentFood.isRevealed) {
        globallyVisibleFoods.push(currentFood);
    }
    const currentGlobalFoods = foodsOnScreen; 
    currentGlobalFoods.forEach(f => { 
        if (f.isRevealed) globallyVisibleFoods.push(f);
    });

    for (let food of globallyVisibleFoods) {
        let isSelfInGlobal = false;
        if (currentBatchFoods.length > 0) { 
            const spawningFood = currentBatchFoods[currentBatchFoods.length -1]; 
            if (spawningFood === food) isSelfInGlobal = true;
        }
        if (!isSelfInGlobal) {
            if (food.x === x && food.y === y) return true; 
            const distanceSquared = Math.pow(x - food.x, 2) + Math.pow(y - food.y, 2);
            if (distanceSquared < Math.pow(minFoodSeparationDistance, 2)) {
                return true;
            }
        }
    }
    
    for (let batchFood of currentBatchFoods) {
        if (batchFood.x === x && batchFood.y === y && batchFood === currentBatchFoods[currentBatchFoods.length -1]) continue;
        if (batchFood.x === x && batchFood.y === y) return true; 
        const distanceSquared = Math.pow(x - batchFood.x, 2) + Math.pow(y - batchFood.y, 2);
        if (distanceSquared < Math.pow(minFoodSeparationDistance, 2)) {
            return true; 
        }
    }
    return false;
  }


  const publicApi = {
    start: () => {
      onAllImagesLoadedCallback = () => { 
        resetGameState();
        internalUpdateScore(); internalUpdateLevelDisplay();
        isWaitingForUserAction = false; 
        isGameCurrentlyOver = false;
        startMusic(); 
        clearTimeout(gameLoopTimeout); gameLoop();
      };
      if (imagesLoaded === totalImages) onAllImagesLoadedCallback();
    },
    restart: () => {
      if (typeof hideGameOverScreen === 'function') hideGameOverScreen();
      resetGameState();
      internalUpdateScore(); internalUpdateLevelDisplay();
      isWaitingForUserAction = false; 
      isGameCurrentlyOver = false;
      startMusic(); 
      clearTimeout(gameLoopTimeout); gameLoop();
    },
    continueNextLevel: () => {
      if (typeof hideNextLevelScreenUI === 'function') hideNextLevelScreenUI();
      isGameCurrentlyOver = false; 
      isWaitingForUserAction = false; 
      pointsThisLevel = 0; 
      prepareMultiFoodLevel(); 
      if (foodsOnScreen.length === 0) { triggerGameOver(); return; }
      startMusic(); 
      clearTimeout(gameLoopTimeout); gameLoop();
    },
    processKeyDown: (key) => { 
      if (isWaitingForUserAction || isGameCurrentlyOver) return; 
      if (snake && snake.length > 0) { 
        if (key === "ArrowUp" && dy === 0) { dx = 0; dy = -gridSize; }
        else if (key === "ArrowDown" && dy === 0) { dx = 0; dy = gridSize; }
        else if (key === "ArrowLeft" && dx === 0) { dx = -gridSize; dy = 0; }
        else if (key === "ArrowRight" && dx === 0) { dx = gridSize; dy = 0; }
      }
    },
    destroy: () => {
      clearTimeout(gameLoopTimeout);
      stopMusic(); 
      if (eatSoundSynth && typeof eatSoundSynth.dispose === 'function') {
        eatSoundSynth.dispose();
      }
      if (levelUpSoundSynth && typeof levelUpSoundSynth.dispose === 'function') {
        levelUpSoundSynth.dispose();
      }
      if (gameOverSoundSynth && typeof gameOverSoundSynth.dispose === 'function') {
        gameOverSoundSynth.dispose();
      }
      if (musicSynth && typeof musicSynth.dispose === 'function') {
        musicSynth.dispose();
      }
      if (musicLoop && typeof musicLoop.dispose === 'function') {
        musicLoop.dispose();
      }
      if (typeof Tone !== 'undefined' && Tone && Tone.Transport && Tone.Transport.state === "started") {
        Tone.Transport.stop();
        Tone.Transport.cancel(0); 
      }
    }
  };
  return publicApi;
}
