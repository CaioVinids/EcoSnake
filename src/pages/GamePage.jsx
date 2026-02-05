import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './pagesCss/GamePage.css'; 
import { createGameInstance } from '../game/gameLogic';

const legendaImagePath = '/assets/imgs/legenda.png';

const GamePage = () => {
  const canvasRef = useRef(null);
  const gameInstanceRef = useRef(null);
  const countdownIntervalRef = useRef(null); 

  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOverVisible, setIsGameOverVisible] = useState(false);
  const [isNextLevelVisible, setIsNextLevelVisible] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [stats, setStats] = useState([]);
  
  const [countdownValue, setCountdownValue] = useState(null); 
  const [isCountdownVisible, setIsCountdownVisible] = useState(false);

  const updateScoreDisplayCb = useCallback((newScore) => setScore(newScore), []);
  const updateLevelDisplayCb = useCallback((newLevel) => setLevel(newLevel), []);
  
  const showGameOverScreenCb = useCallback((fScore, fStats) => {
    setFinalScore(fScore);
    setStats(fStats);
    setIsGameOverVisible(true);
    setIsNextLevelVisible(false);
    setIsCountdownVisible(false); 
  }, []);

  const hideGameOverScreenCb = useCallback(() => setIsGameOverVisible(false), []);

  const showNextLevelScreenUICb = useCallback((lvlStats) => {
    setStats(lvlStats);
    setIsNextLevelVisible(true);
    setIsGameOverVisible(false);
    setIsCountdownVisible(false); 
  }, []);

  const hideNextLevelScreenUICb = useCallback(() => setIsNextLevelVisible(false), []);

  const uiCallbacks = useMemo(() => ({
    updateScoreDisplay: updateScoreDisplayCb,
    updateLevelDisplay: updateLevelDisplayCb,
    showGameOverScreen: showGameOverScreenCb,
    hideGameOverScreen: hideGameOverScreenCb,
    showNextLevelScreenUI: showNextLevelScreenUICb,
    hideNextLevelScreenUI: hideNextLevelScreenUICb,
  }), [
    updateScoreDisplayCb, 
    updateLevelDisplayCb, 
    showGameOverScreenCb, 
    hideGameOverScreenCb, 
    showNextLevelScreenUICb, 
    hideNextLevelScreenUICb
  ]);

  const startNextLevelCountdown = useCallback(() => {
    setIsNextLevelVisible(false); 
    setIsCountdownVisible(true);  
    setCountdownValue(3);

    if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdownValue(prevCountdown => {
        const nextVal = prevCountdown !== null ? prevCountdown - 1 : null;
        if (nextVal !== null && nextVal < 1) { 
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
          setIsCountdownVisible(false);
          if (gameInstanceRef.current) {
            gameInstanceRef.current.continueNextLevel();
          }
          return null; 
        }
        return nextVal;
      });
    }, 1000);
  }, [setIsNextLevelVisible, setIsCountdownVisible, setCountdownValue]); 

  const restartGameHandler = useCallback(() => {
    setIsGameOverVisible(false); 
    if (gameInstanceRef.current) {
      gameInstanceRef.current.restart();
    }
  }, [setIsGameOverVisible]); 


  const continueToNextLevelHandler = useCallback(() => {
    startNextLevelCountdown();
  }, [startNextLevelCountdown]);

  const handleKeyDownRef = useRef(null);

  const handleKeyDown = useCallback((event) => {
    if (isCountdownVisible) {
      return; 
    }

    if (event.key === " ") { 
      if (isNextLevelVisible) {
        startNextLevelCountdown();
        event.preventDefault(); 
        return; 
      }
      if (isGameOverVisible) {
        restartGameHandler(); 
        event.preventDefault();
        return;
      }
    }
    
    if (gameInstanceRef.current && !isNextLevelVisible && !isGameOverVisible && !isCountdownVisible) {
      gameInstanceRef.current.processKeyDown(event.key);
    }
  }, [isCountdownVisible, isNextLevelVisible, isGameOverVisible, startNextLevelCountdown, restartGameHandler]);

  useEffect(() => {
    handleKeyDownRef.current = handleKeyDown;
  }, [handleKeyDown]);

  useEffect(() => {
    if (canvasRef.current) {
      const game = createGameInstance(canvasRef.current, uiCallbacks);
      gameInstanceRef.current = game;
      game.start();

      const eventListener = (event) => {
        if (handleKeyDownRef.current) {
          handleKeyDownRef.current(event);
        }
      };
      
      document.addEventListener('keydown', eventListener);

      return () => {
        document.removeEventListener('keydown', eventListener);
        
        if (gameInstanceRef.current) {
          gameInstanceRef.current.destroy();
        }
        gameInstanceRef.current = null;
        if (countdownIntervalRef.current) { 
            clearInterval(countdownIntervalRef.current);
        }
      };
    }
  }, [uiCallbacks]); 


  return (
    <>
      <header className="game-header">
        <div className="game-header-content">
          <h1>Eco Snake Game</h1>
          <Link to="/" className="game-inicio-btn">🏠 Início</Link>
        </div>
      </header>

      <div className="game-body-container">
        <div className="game-main-and-side-container">
            <div className="game-main-layout">
                <div className="game-container">
                    <canvas id="gameCanvas" ref={canvasRef}></canvas>
                    <div id="score" className="game-score-display">
                        Pontuação: <span id="scoreValue">{score}</span> |
                        Nível: <span id="levelValue">{level}</span>
                    </div>

                    {isCountdownVisible && countdownValue !== null && (
                        <div className="game-countdown-overlay">
                            <div className="countdown-number">{countdownValue}</div>
                        </div>
                    )}

                    {isGameOverVisible && (
                        <div id="gameOverScreen" className="game-overlay-screen">
                            <div className="overlay-content">
                                <h2 className="overlay-title">Fim de Jogo!</h2>
                                <p className="overlay-message">Lembre-se: coma apenas itens da cor da legenda.</p>
                                <p className="overlay-final-score">Sua pontuação final: <strong>{finalScore}</strong></p>
                                <div className="overlay-stats">
                                    <h3>Itens Coletados:</h3>
                                    <ul>
                                        {stats.length > 0 ? stats.map(stat => (
                                            <li key={stat.type}><span>{stat.type}:</span> <strong>{stat.count}</strong></li>
                                        )) : <li>Nenhum item coletado.</li>}
                                    </ul>
                                </div>
                                <button onClick={restartGameHandler} className="overlay-button">
                                    Reiniciar Jogo
                                </button>
                            </div>
                        </div>
                    )}

                    {isNextLevelVisible && (
                        <div id="nextLevelScreen" className="game-overlay-screen">
                           <div className="overlay-content">
                                <h2 className="overlay-title">Nível Concluído!</h2>
                                <p className="overlay-message">Prepare-se, o próximo nível será mais desafiador!</p>
                                <p className="overlay-message">Use a legenda para saber qual item comer.</p>
                                <div className="overlay-stats">
                                    <h3>Itens Coletados (Total):</h3>
                                    <ul>
                                        {stats.length > 0 ? stats.map(stat => (
                                            <li key={stat.type}><span>{stat.type}:</span> <strong>{stat.count}</strong></li>
                                        )) : <li>Nenhum item coletado até agora.</li>}
                                    </ul>
                                </div>
                                <button onClick={continueToNextLevelHandler} className="overlay-button overlay-button-continue">
                                    Continuar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="game-side-panel">
                <div className="game-controls-instruction">
                    <p>Use as <strong>SETAS</strong> para mover e <strong>ESPAÇO</strong> para continuar/reiniciar.</p>
                </div>
                <div className="game-side-image">
                    <img src={legendaImagePath} alt="Legenda do jogo" />
                </div>
            </div>
        </div>
      </div>
    </>
  );
};

export default GamePage;
