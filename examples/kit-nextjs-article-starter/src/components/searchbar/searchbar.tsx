"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

interface SitecoreChildItem {
  id: string;
  name: string;
  url: { path: string };
  gameTitle?: { value: string };
  titleAlternative?: { value: string };
  Username?: { value: string };
  Email?: { value: string };
}

interface SearchBarProps {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields?: any; 
}

export const Searchbar = ({ fields }: SearchBarProps): React.JSX.Element => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  
  // AUTH & MODAL STATES
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  
  // LOGIN FORM INPUT STATES
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // CORE AUTHENTICATION SYNC LAYER
  const syncAuthenticationState = () => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isUserAuthenticated') === 'true';
      const storedUser = localStorage.getItem('authenticatedProfileId') || '';
      
      // Instantly react to state transitions made by alternative profile layouts
      setIsLoggedIn(authStatus);
      setCurrentUsername(storedUser);
    }
  };

  useEffect(() => {
    // Run initial verification pass on component mount
    syncAuthenticationState();

    const handleGlobalAuthMessage = () => {
      syncAuthenticationState();
    };

    // Subscriptions connecting tracking channels between components
    window.addEventListener('profileSessionChange', handleGlobalAuthMessage);
    window.addEventListener('storage', handleGlobalAuthMessage);
    window.addEventListener('navbarAuthUpdate', handleGlobalAuthMessage);

    return () => {
      window.removeEventListener('profileSessionChange', handleGlobalAuthMessage);
      window.removeEventListener('storage', handleGlobalAuthMessage);
      window.removeEventListener('navbarAuthUpdate', handleGlobalAuthMessage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract Sitecore layout tree nodes safely
  const rawItems: any[] = fields?.data?.item?.children?.results || fields?.item?.children?.results || fields?.items || [];
  
  // Filter items to make sure we are only looking at valid game items, not data configurations
  const allGames = rawItems.filter(item => {
    const systemName = (item?.name || '').toLowerCase();
    return systemName !== 'data' && systemName !== 'games' && !item?.Username;
  });

  // Filter games based on what the user types into the input box
  const filteredGames = allGames.filter((game) => {
    const title = (game?.gameTitle?.value || game?.titleAlternative?.value || game?.name || '').toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  // Handle Search Submission (When pressing Enter or clicking the magnifying glass)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredGames.length > 0) {
      const firstGame = filteredGames[0];
      window.location.href = `/GameDetails?id=${firstGame.id}`;
    }
  };

  // ROBUST AUTH LOGIN HANDLER WITH AUTOMATIC TRANSMISSION BROADCASTS
  const handleModalLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const typedUser = usernameInput.trim();
    const typedPassword = passwordInput.trim();

    if (typedUser && typedPassword) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('isUserAuthenticated', 'true');
        localStorage.setItem('authenticatedProfileId', typedUser);
        
        setIsLoggedIn(true);
        setCurrentUsername(typedUser);
        setIsLoginModalOpen(false);
        
        // Wipe inputs to reset layout forms clean
        setUsernameInput('');
        setPasswordInput('');

        // Fire interlock alerts across active framework hooks
        window.dispatchEvent(new Event('profileSessionChange'));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new Event('navbarAuthUpdate'));
      }
    } else {
      setLoginError('Please enter a valid Account Username and Password.');
    }
  };

  const triggerLogoutAction = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isUserAuthenticated');
      localStorage.removeItem('authenticatedProfileId');
      
      setIsLoggedIn(false);
      setCurrentUsername('');
      setIsProfileDropdownOpen(false);
      
      // Fire teardown alerts across active framework hooks
      window.dispatchEvent(new Event('profileSessionChange'));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('navbarAuthUpdate'));
    }
  };

  const navItemStyle: React.CSSProperties = {
    color: '#b8b6b4',
    textDecoration: 'none',
    fontSize: '14px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    fontFamily: 'inherit',
    transition: 'color 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  };

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <div style={{ width: '100%', background: '#171a21', borderBottom: '1px solid #2a475e', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)', fontFamily: '"Motiva Sans", Sans-serif', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button type="button" onClick={() => { window.location.href = '/'; }} style={navItemStyle}>Home</button>
            <button type="button" onClick={() => { window.location.href = '/blog'; }} style={navItemStyle}>Blog</button>
            <button type="button" onClick={() => { window.location.href = '/cart'; }} style={navItemStyle}>Cart</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'flex-end', flexGrow: 1 }}>
            
            {/* SEARCH INPUT AND SEARCH BUTTON CONTAINER WITH STABLE ROUTING */}
            <form onSubmit={handleSearchSubmit} ref={searchContainerRef} style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative', width: '100%', maxWidth: '320px' }}>
              <div style={{ position: 'relative', flexGrow: 1 }}>
                <input
                  type="text"
                  placeholder="search the store"
                  value={searchQuery}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  style={{ padding: '8px 14px', fontSize: '14px', borderRadius: '3px 0 0 3px', border: '1px solid #000', borderRight: 'none', background: '#16202d', color: '#fff', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                />

                {/* SEARCH RESULTS DROPDOWN WITH FIXED ROUTING */}
                {isDropdownOpen && searchQuery.trim() !== '' && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#3d4450', border: '1px solid #4f5868', borderRadius: '4px', boxShadow: '0 4px 16px rgba(0,0,0,0.6)', zIndex: 5000, maxHeight: '280px', overflowY: 'auto' }}>
                    {filteredGames.length > 0 ? (
                      filteredGames.map((game, index) => {
                        const gameTitleString = game?.gameTitle?.value || game?.titleAlternative?.value || game?.name || 'Unnamed Game';
                        const linkPath = `/GameDetails?id=${game?.id}`;
                        
                        return (
                          <div
                            key={game.id || index}
                            onClick={() => {
                              window.location.href = linkPath;
                              setIsDropdownOpen(false);
                            }}
                            style={{ padding: '10px 14px', color: '#c6d4df', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#4c5463')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            {gameTitleString}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '12px 14px', color: '#8f98a0', fontSize: '13px', textAlign: 'center' }}>
                        No matches found
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SEARCH SUBMIT BUTTON */}
              <button
                type="submit"
                style={{
                  padding: '8px 14px',
                  background: 'linear-gradient(to bottom, #66c0f4 0%, #106093 100%)',
                  border: '1px solid #106093',
                  borderRadius: '0 3px 3px 0',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  outline: 'none'
                }}
              >
                🔍
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              
              {!isLoggedIn ? (
                <button 
                  type="button" 
                  onClick={() => { setLoginError(''); setIsLoginModalOpen(true); }}
                  style={{ ...navItemStyle, color: '#66c0f4', background: 'rgba(102, 192, 244, 0.1)', padding: '6px 16px', borderRadius: '3px', border: '1px solid rgba(102, 192, 244, 0.4)', fontWeight: 600 }}
                >
                  Login
                </button>
              ) : (
                <div ref={profileDropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#66c0f4', fontSize: '13px', fontWeight: 500, fontFamily: '"Motiva Sans", sans-serif' }}>
                    Welcome, <strong style={{ color: '#fff' }}>{currentUsername}</strong>
                  </span>
                  
                  <button type="button" onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '3px', background: 'linear-gradient(135deg, #a3cf06 0%, #106093 100%)', padding: '2px' }}>
                      <div style={{ width: '100%', height: '100%', background: '#141e28', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '160px', background: '#1d2a3a', border: '1px solid #2a475e', borderRadius: '4px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)', zIndex: 1000 }}>
                      <div style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', color: '#e1e7ee', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        Signed in
                      </div>
                      <button type="button" onClick={triggerLogoutAction} style={{ display: 'block', width: '100%', padding: '10px 14px', background: 'none', border: 'none', textAlign: 'left', color: '#ff4d4f', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
              
            </div>

          </div>
        </div>
      </div>

      {/* LOGIN POPUP MODAL */}
      {isLoginModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
          <div style={{ width: '100%', maxWidth: '400px', background: '#182433', borderRadius: '8px', border: '1px solid #2b475e', boxShadow: '0 12px 40px rgba(0,0,0,0.7)', padding: '32px', boxSizing: 'border-box', position: 'relative' }}>
            
            <button type="button" onClick={() => setIsLoginModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#8f98a0', fontSize: '20px', cursor: 'pointer' }}>✕</button>

            <h2 style={{ color: '#66c0f4', fontSize: '1.5rem', margin: '0 0 24px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Sign In</h2>
            
            {loginError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '13px', padding: '10px', borderRadius: '4px', marginBottom: '16px' }}>
                {loginError}
              </div>
            )}

            <form onSubmit={handleModalLoginSubmit}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: '#afb9c4', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Account Username</label>
              <input 
                type="text" 
                required
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#101722', border: '1px solid #000', borderRadius: '3px', color: '#fff', marginBottom: '20px', outline: 'none', boxSizing: 'border-box' }}
              />

              <label style={{ display: 'block', fontSize: '0.75rem', color: '#afb9c4', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 600 }}>Password (Linked Email)</label>
              <input 
                type="password" 
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '10px', background: '#101722', border: '1px solid #000', borderRadius: '3px', color: '#fff', marginBottom: '30px', outline: 'none', boxSizing: 'border-box' }}
              />

              <button type="submit" style={{ width: '100%', padding: '12px', background: 'linear-gradient(to bottom, #a3cf06 0%, #7a9b04 100%)', border: 'none', borderRadius: '3px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase' }}>
                Sign In
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Searchbar;