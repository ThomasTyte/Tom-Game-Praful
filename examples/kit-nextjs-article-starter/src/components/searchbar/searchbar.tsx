"use client"; // 💡 CRITICAL: Tells Next.js this is a Client Component so useState & alert don't crash the server

import React, { useState } from 'react';
import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

// Fully type the Sitecore child items coming from your resolver
interface SitecoreChildItem {
  id: string;
  name: string;
  url: string;
}

interface SearchBarProps {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields: {
    items?: SitecoreChildItem[];
  };
}

// 💡 CHANGED: Renamed from GameSearchBar to Searchbar to match your 'Searchbar.tsx' file name exactly!
export const Searchbar = ({ fields }: SearchBarProps): React.JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<string>('');

  // Fallback array typed explicitly for TypeScript safety
  const allGames: SitecoreChildItem[] = fields?.items || [];

  // Filter logic
  const filteredGames = allGames.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Slice exactly the top 5 compatible games
  const initialDropdownGames = allGames.slice(0, 5);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const targetGame = selectedGame || searchQuery;
    if (targetGame) {
      alert(`Searching for game matching: ${targetGame}`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', fontFamily: 'sans-serif' }}>
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label htmlFor="game-search" style={{ fontWeight: 'bold' }}>Find a Game</label>
        
        <input
          id="game-search"
          type="text"
          placeholder="Type game name..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
            setSelectedGame('');
          }}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <select
          value={selectedGame}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedGame(e.target.value);
            setSearchQuery(e.target.value);
          }}
          style={{ padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">-- Quick Select (Top 5 Games) --</option>
          {initialDropdownGames.map((game) => (
            <option key={game.id} value={game.name}>
              {game.name}
            </option>
          ))}
        </select>

        <button 
          type="submit" 
          style={{ padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Search
        </button>
      </form>

      {searchQuery && (
        <div style={{ marginTop: '15px', border: '1px solid #eee', borderRadius: '4px', padding: '10px' }}>
          <small style={{ color: '#666' }}>Matching Results ({filteredGames.length}):</small>
          <ul style={{ paddingLeft: '20px', margin: '5px 0' }}>
            {filteredGames.map((game) => (
              <li key={game.id} style={{ padding: '3px 0', color: '#333' }}>
                {game.name}
              </li>
            ))}
            {filteredGames.length === 0 && <li style={{ color: 'red', listStyle: 'none' }}>No games found</li>}
          </ul>
        </div>
      )}
    </div>
  );
};