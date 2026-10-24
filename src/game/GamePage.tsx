import React,{useEffect,useRef} from 'react';
import { Game } from './engine/Game';

export default function GamePage(){const canvas=useRef<HTMLCanvasElement>(null);useEffect(()=>{if(!canvas.current)return;const game=new Game(canvas.current);game.start();return()=>game.stop();},[]);return <main className="portal-game" aria-label="Baymax Portal Escape"><canvas ref={canvas} className="portal-game__canvas" aria-label="Baymax Portal Escape game canvas"/><p className="portal-game__hint">A/D move · Space jump · Shift run · J fist · P pause · R retry · F3 debug</p></main>}
