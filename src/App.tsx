import { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { LobbyScreen } from './components/LobbyScreen';
import { OnlineGameBoard } from './components/OnlineGameBoard';
import type { PlayerId } from './types/onlineTypes';

type AppState =
  | { mode: 'lobby' }
  | { mode: 'local' }
  | { mode: 'online'; roomId: string; playerId: PlayerId; playerName: string };

function App() {
  const [appState, setAppState] = useState<AppState>({ mode: 'lobby' });

  const handleJoinGame = (roomId: string, playerId: PlayerId, playerName: string) => {
    setAppState({ mode: 'online', roomId, playerId, playerName });
  };

  const handlePlayLocal = () => {
    setAppState({ mode: 'local' });
  };

  const handleLeaveGame = () => {
    setAppState({ mode: 'lobby' });
  };

  return (
    <div className="min-h-screen">
      {appState.mode === 'lobby' && (
        <LobbyScreen
          onJoinGame={handleJoinGame}
          onPlayLocal={handlePlayLocal}
        />
      )}

      {appState.mode === 'local' && (
        <GameBoard />
      )}

      {appState.mode === 'online' && (
        <OnlineGameBoard
          roomId={appState.roomId}
          playerId={appState.playerId}
          playerName={appState.playerName}
          onLeave={handleLeaveGame}
        />
      )}
    </div>
  );
}

export default App;
