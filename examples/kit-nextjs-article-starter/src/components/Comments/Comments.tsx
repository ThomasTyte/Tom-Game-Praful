"use client";

import React, { useEffect, useState } from 'react';
import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

interface CommentItem {
  id: string;
  commentText: string;
  submissionDate: string;
  associatedGameId: string;
  username: string;
  userRole: string;
  gameImageUrl?: string;
}

interface GameOption {
  id: string;
  name: string;
  imageUrl: string;
}

interface CommentsProps {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields?: any;
}

export default function Comments({ fields }: CommentsProps): React.JSX.Element {
  const [loggedInUser, setLoggedInUser] = useState<string>('');
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [newCommentInput, setNewCommentInput] = useState<string>('');
  const [isTypingActive, setIsTypingActive] = useState<boolean>(false);
  
  const [availableGames, setAvailableGames] = useState<GameOption[]>([]);
  const [selectedGameId, setSelectedGameId] = useState<string>('');

  useEffect(() => {
    const rawResults = fields?.data?.item?.children?.results || fields?.items || [];
    const gamesRaw = fields?.data?.gamesLibrary?.children?.results || [];
    const profilesRaw = fields?.data?.userProfiles?.children?.results || [];

    const profilesLookup = profilesRaw.reduce((map: any, profile: any) => {
      if (profile.name) {
        map[profile.name.toLowerCase()] = profile.profileRole?.value || "Player Member";
      }
      return map;
    }, {});

    const dynamicGamesList: GameOption[] = gamesRaw.map((game: any) => ({
      id: game.name || "Unknown_Node",
      name: (game.name || "Unknown Node").replace(/_/g, ' '),
      imageUrl: game.gameThumbnail?.jsonValue?.value?.src || ""
    }));

    setAvailableGames(dynamicGamesList);
    
    if (dynamicGamesList.length > 0) {
      setSelectedGameId(dynamicGamesList[0].id);
    } else {
      setAvailableGames([
        { id: "Neo_Vanguard", name: "Neo Vanguard", imageUrl: "" },
        { id: "Apex_Predator_Island", name: "Apex Predator Island", imageUrl: "" }
      ]);
      setSelectedGameId("Neo_Vanguard");
    }

    const gamesLookup = gamesRaw.reduce((map: any, game: any) => {
      if (game.name) {
        map[game.name.toLowerCase()] = game.gameThumbnail?.jsonValue?.value?.src || "";
      }
      return map;
    }, {});
    
    if (Array.isArray(rawResults) && rawResults.length > 0) {
      const mapped = rawResults.map((item: any) => {
        const rawDate = item.submissionDate?.jsonValue?.value || item.submissionDate?.value || "";
        const parsedDate = rawDate && !isNaN(Date.parse(rawDate)) ? rawDate : new Date().toISOString();
        
        const assignedGame = item.associatedGameId?.jsonValue?.value || item.associatedGameId?.value || item.gameId?.value || "SYS_CATALOG_GENERIC";
        const dynamicImage = gamesLookup[assignedGame.toLowerCase()];
        const targetUsername = item.username?.jsonValue?.value || item.username?.value || item.userId?.value || "Anonymous Guest";

        return {
          id: item.id || Math.random().toString(),
          commentText: item.commentText?.jsonValue?.value || item.commentText?.value || item.content?.value || "Empty broadcast entry stream.",
          submissionDate: parsedDate,
          associatedGameId: assignedGame,
          username: targetUsername,
          userRole: profilesLookup[targetUsername.toLowerCase()] || "Player Member",
          gameImageUrl: dynamicImage || ""
        };
      });
      setCommentsList(mapped);
    } else {
      setCommentsList([
        {
          id: "seed-comm-1",
          commentText: "The asset frame-pacing matches the classic sci-fi survival horror environment loops perfectly. Solid performance metrics across testing nodes.",
          submissionDate: "2026-06-23T14:32:00Z",
          associatedGameId: "Neo_Vanguard",
          username: "ChronoTriggered",
          userRole: profilesLookup["chronotriggered"] || "Premium Executive",
          gameImageUrl: gamesLookup["neo_vanguard"] || "" 
        },
        {
          id: "seed-comm-2",
          commentText: "Network sync lag discovered near sectors 4 and 9 during drop drops. Patch expected in deployment matrix build 0.84.",
          submissionDate: "2026-06-24T01:15:44Z",
          associatedGameId: "Apex_Predator_Island",
          username: "ApexSurvivor_Island",
          userRole: profilesLookup["apexsurvivor_island"] || "Hardware Analyst",
          gameImageUrl: gamesLookup["apex_predator_island"] || ""
        }
      ]);
    }
  }, [fields]);

  const syncSessionUser = () => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isUserAuthenticated') === 'true';
      const currentUser = localStorage.getItem('authenticatedProfileId') || 'ChronoTriggered';
      setLoggedInUser(authStatus ? currentUser : 'ChronoTriggered');
    }
  };

  useEffect(() => {
    syncSessionUser();
    window.addEventListener('profileSessionChange', syncSessionUser);
    window.addEventListener('storage', syncSessionUser);
    window.addEventListener('navbarAuthUpdate', syncSessionUser);

    return () => {
      window.removeEventListener('profileSessionChange', syncSessionUser);
      window.removeEventListener('storage', syncSessionUser);
      window.removeEventListener('navbarAuthUpdate', syncSessionUser);
    };
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewCommentInput(e.target.value);
    setIsTypingActive(true);
    const timer = setTimeout(() => setIsTypingActive(false), 150);
    return () => clearTimeout(timer);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentInput.trim() || !loggedInUser || !selectedGameId) return;

    const chosenGameMeta = availableGames.find(g => g.id === selectedGameId);
    const currentProfilesRaw = fields?.data?.userProfiles?.children?.results || [];
    const foundProfile = currentProfilesRaw.find((p: any) => p.name?.toLowerCase() === loggedInUser.toLowerCase());
    const matchedRole = foundProfile?.profileRole?.value || "Premium Executive";

    const freshComment: CommentItem = {
      id: `user-broadcast-${Date.now()}`,
      commentText: newCommentInput.trim(),
      submissionDate: new Date().toISOString(),
      associatedGameId: selectedGameId,
      username: loggedInUser,
      userRole: matchedRole,
      gameImageUrl: chosenGameMeta ? chosenGameMeta.imageUrl : ""
    };

    setCommentsList([freshComment, ...commentsList]);
    setNewCommentInput('');
  };

  const formatBroadcastDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "REALTIME_STREAM";
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return "REALTIME_STREAM";
    }
  };

  const getGameThumbnail = (gameId: string, customUrl?: string) => {
    if (customUrl && customUrl.trim() !== "") return customUrl;
    
    const lowerId = gameId.toLowerCase();
    if (lowerId.includes('neo_vanguard') || lowerId.includes('vanguard')) {
      return "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=160&q=80";
    }
    if (lowerId.includes('apex_predator') || lowerId.includes('island')) {
      return "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=160&q=80";
    }
    return "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=160&q=80";
  };

  const isUserAuthenticated = loggedInUser && loggedInUser.trim() !== '';

  return (
    <div className="steam-matrix-ambient-wrapper" style={{ 
      width: '100%', 
      minHeight: '850px',
      padding: '80px 60px',
      boxSizing: 'border-box',
      background: 'radial-gradient(ellipse at top, rgba(27, 40, 56, 0.6) 0%, rgba(23, 26, 33, 0.98) 75%, #171a21 100%)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: '1px solid rgba(102, 192, 244, 0.12)',
      borderBottom: '1px solid rgba(102, 192, 244, 0.05)',
      display: 'flex',
      justifyContent: 'center'
    }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtleFloorPulse {
          0% { border-bottom-color: rgba(102, 192, 244, 0.25); box-shadow: inset 0 -3px 10px rgba(102, 192, 244, 0.03); }
          50% { border-bottom-color: rgba(102, 192, 244, 0.5); box-shadow: inset 0 -4px 14px rgba(102, 192, 244, 0.12); }
          100% { border-bottom-color: rgba(102, 192, 244, 0.25); box-shadow: inset 0 -3px 10px rgba(102, 192, 244, 0.03); }
        }
        
        .interactive-submit-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.15); box-shadow: 0 0 20px rgba(102, 192, 244, 0.4); }
        
        /* STANDARD PROFILE ROW HOVER */
        .steam-blue-card-row:not(.operator-self-card):hover { 
          border-color: rgba(102, 192, 244, 0.35) !important; 
          background: linear-gradient(135deg, #1d2c3d 0%, #171b24 100%) !important; 
        }

        /* LOGGED-IN OPERATOR ROW HOVER (DYNAMIC STANDOUT AESTHETIC) */
        .steam-blue-card-row.operator-self-card:hover {
          background: linear-gradient(135deg, #20354d 0%, #141c26 100%) !important;
          border-color: rgba(102, 192, 244, 0.7) !important;
          box-shadow: 0 20px 45px rgba(102, 192, 244, 0.08), inset 4px 0 0 #66c0f4 !important;
          transform: translateX(4px);
        }
        
        .interactive-terminal-box { 
          background: rgba(27, 40, 56, 0.35) !important;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important; 
        }
        .interactive-terminal-box:hover {
          background: rgba(15, 23, 32, 0.85) !important;
          border-color: rgba(102, 192, 244, 0.35) !important;
          box-shadow: inset 0 0 40px rgba(0,0,0,0.85), 0 0 20px rgba(102, 192, 244, 0.05) !important;
        }

        .live-textarea-feed { transition: border-color 0.3s, background 0.3s, box-shadow 0.3s ease-in-out !important; }
        .live-textarea-feed:focus {
          border-color: rgba(102, 192, 244, 0.45) !important;
          background: #111822 !important;
        }
        
        .live-textarea-feed.typing-pulse {
          animation: subtleFloorPulse 1s infinite ease-in-out;
        }
        
        .steam-dropdown-node {
          background: #172330;
          color: #c6d4df;
          border: 1px solid rgba(102, 192, 244, 0.4);
          border-radius: 4px;
          padding: 10px 18px;
          font-size: 0.95rem;
          font-family: monospace;
          outline: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .steam-dropdown-node:hover, .steam-dropdown-node:focus {
          border-color: #66c0f4;
          box-shadow: 0 0 12px rgba(102, 192, 244, 0.35);
          color: #ffffff;
        }
      `}} />

      <div style={{ width: '100%', maxWidth: '1600px' }}>
        
        {/* HEADER BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '44px', borderBottom: '2px solid rgba(102, 192, 244, 0.25)', paddingBottom: '28px' }}>
          <h3 style={{ fontSize: '1.75rem', color: '#c6d4df', fontWeight: 700, margin: 0, letterSpacing: '1.5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: '#66c0f4', textShadow: '0 0 15px rgba(102, 192, 244, 0.4)' }}>📡</span> User Communication Feed 
            
            <span style={{ 
              fontSize: '1rem', 
              color: '#66c0f4', 
              background: 'rgba(21, 38, 59, 0.8)', 
              padding: '8px 22px', 
              borderRadius: '4px', 
              marginLeft: '20px', 
              border: '1px solid rgba(102, 192, 244, 0.5)', 
              fontFamily: 'monospace',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 10px rgba(102, 192, 244, 0.15)'
            }}>
              <b style={{ color: '#ffffff', fontSize: '1.1rem' }}>{commentsList.length}</b> Network Pools
            </span>
          </h3>
        </div>

        {/* INPUT TERMINAL */}
        <div 
          className="interactive-terminal-box" 
          style={{ 
            border: '1px solid rgba(102, 192, 244, 0.2)', 
            borderRadius: '8px', 
            padding: '40px', 
            marginBottom: '54px', 
            boxShadow: 'inset 0 0 25px rgba(0,0,0,0.55)' 
          }}
        >
          {isUserAuthenticated ? (
            <form onSubmit={handlePostComment} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                
                <div style={{ 
                  fontSize: '0.9rem', 
                  background: 'linear-gradient(90deg, rgba(102, 192, 244, 0.15) 0%, rgba(27, 40, 56, 0.4) 100%)', 
                  color: '#66c0f4', 
                  padding: '10px 24px', 
                  borderRadius: '4px', 
                  fontWeight: 700, 
                  textTransform: 'uppercase', 
                  border: '1px solid rgba(102, 192, 244, 0.4)', 
                  fontFamily: 'monospace', 
                  letterSpacing: '1px',
                  boxShadow: '0 0 10px rgba(102, 192, 244, 0.1)'
                }}>
                  Terminal Operator Sync: <span style={{ color: '#ffffff', fontSize: '0.95rem', marginLeft: '6px' }}>{loggedInUser}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <label htmlFor="game-target-node" style={{ color: '#66c0f4', fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Target App Node:
                  </label>
                  <select
                    id="game-target-node"
                    className="steam-dropdown-node"
                    value={selectedGameId}
                    onChange={(e) => setSelectedGameId(e.target.value)}
                  >
                    {availableGames.map((game) => (
                      <option key={game.id} value={game.id} style={{ background: '#171a21', color: '#c6d4df' }}>
                        {game.name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>
              
              <textarea
                placeholder="Write a public comment review to link across global network nodes..."
                value={newCommentInput}
                onChange={handleTextChange}
                rows={5}
                className={`live-textarea-feed ${isTypingActive ? 'typing-pulse' : ''}`}
                style={{ 
                  width: '100%', 
                  boxSizing: 'border-box', 
                  background: '#121922', 
                  border: '1px solid rgba(102, 192, 244, 0.25)', 
                  borderRadius: '6px', 
                  padding: '20px', 
                  color: '#c6d4df', 
                  fontSize: '1.15rem', 
                  outline: 'none', 
                  resize: 'vertical', 
                  fontFamily: 'inherit', 
                  lineHeight: '1.6' 
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={!newCommentInput.trim()}
                  className="interactive-submit-btn"
                  style={{ padding: '16px 44px', fontSize: '1rem', borderRadius: '4px', border: 'none', fontWeight: 700, textTransform: 'uppercase', cursor: newCommentInput.trim() ? 'pointer' : 'not-allowed', background: newCommentInput.trim() ? 'linear-gradient(180deg, #417a9b 0%, #10568d 100%)' : 'rgba(42, 71, 94, 0.2)', color: newCommentInput.trim() ? '#ffffff' : '#455568', letterSpacing: '1px', transition: 'all 0.2s ease', borderBottom: newCommentInput.trim() ? '3px solid #083356' : 'none' }}
                >
                  Transmit Review
                </button>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(102, 192, 244, 0.45)', fontSize: '1.1rem', fontFamily: 'monospace' }}>
              🔒 Review Node Encrypted. Synchronize credential arrays in the <span style={{ color: '#ff5a5a', fontWeight: 600 }}>Profile Manager Console</span> to update database files.
            </div>
          )}
        </div>

        {/* FEED COMMENT MATRIX */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {commentsList.map((comm) => {
            const isOwnComment = loggedInUser.trim().toLowerCase() === comm.username.trim().toLowerCase();
            
            return (
              <div 
                key={comm.id}
                className={`steam-blue-card-row ${isOwnComment ? 'operator-self-card' : ''}`}
                style={{ 
                  background: isOwnComment 
                    ? 'linear-gradient(135deg, #1b2b3a 0%, #11161d 100%)' 
                    : 'linear-gradient(135deg, #172330 0%, #12171f 100%)', 
                  border: isOwnComment ? '1px solid rgba(102, 192, 244, 0.45)' : '1px solid rgba(102, 192, 244, 0.12)',
                  boxShadow: isOwnComment 
                    ? '0 16px 40px rgba(0, 0, 0, 0.65), inset 4px 0 0 rgba(102, 192, 244, 0.5)' 
                    : '0 16px 40px rgba(0, 0, 0, 0.55)',
                  borderRadius: '8px',
                  padding: '36px 44px',
                  display: 'flex',
                  gap: '40px',
                  alignItems: 'flex-start',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                {/* LEFT COLUMN: AVATAR & THUMBNAIL BADGES */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', flexShrink: 0, width: '130px' }}>
                  
                  <div style={{ 
                    width: '70px', 
                    height: '70px', 
                    borderRadius: '6px', 
                    background: isOwnComment ? 'linear-gradient(135deg, #213c5a 0%, #121f2f 100%)' : '#1a2736', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '1.4rem', 
                    fontWeight: 700, 
                    color: isOwnComment ? '#66c0f4' : '#67c1f5',
                    border: isOwnComment ? '2.5px solid rgba(102, 192, 244, 0.7)' : '1.5px solid rgba(102, 192, 244, 0.2)',
                    boxShadow: '0 6px 14px rgba(0,0,0,0.45)'
                  }}>
                    {comm.username.substring(0, 2).toUpperCase()}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '10px', 
                    width: '100%',
                    background: 'linear-gradient(180deg, rgba(255, 153, 0, 0.08) 0%, rgba(255, 153, 0, 0.02) 100%)', 
                    padding: '14px 10px', 
                    borderRadius: '6px', 
                    border: '1px solid rgba(255, 153, 0, 0.45)',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.45)'
                  }}>
                    <img 
                      src={getGameThumbnail(comm.associatedGameId, comm.gameImageUrl)} 
                      alt="Linked Game Node" 
                      style={{ 
                        width: '70px', 
                        height: '70px', 
                        borderRadius: '4px', 
                        objectFit: 'cover', 
                        border: '2px solid #ff9900',
                        boxShadow: '0 0 12px rgba(255, 153, 0, 0.4)'
                      }}
                    />
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontFamily: 'monospace', 
                      textTransform: 'uppercase', 
                      color: '#ff9900', 
                      fontWeight: 800, 
                      letterSpacing: '0.6px',
                      textAlign: 'center',
                      wordBreak: 'break-word',
                      lineHeight: '1.3',
                      padding: '0 4px'
                    }}>
                      {comm.associatedGameId.replace(/_/g, ' ')}
                    </span>
                  </div>

                </div>

                {/* RIGHT COLUMN: REVIEWS LARGE TEXT */}
                <div style={{ flex: 1, minWidth: 0, paddingTop: '4px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '1.3rem', 
                        color: isOwnComment ? '#ffffff' : '#c6d4df', 
                        letterSpacing: '0.6px',
                        textShadow: isOwnComment ? '0 0 10px rgba(102, 192, 244, 0.3)' : 'none'
                      }}>
                        {comm.username} {isOwnComment && <span style={{ fontSize: '0.85rem', color: '#66c0f4', fontWeight: 500, fontFamily: 'monospace' }}>(You)</span>}
                      </span>
                      
                      <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#a3cf06', background: 'rgba(163, 207, 6, 0.08)', padding: '4px 14px', borderRadius: '3px', fontWeight: 700, letterSpacing: '1px', border: '1px solid rgba(163, 207, 6, 0.25)' }}>
                        {comm.userRole}
                      </span>
                    </div>

                    <span style={{ fontSize: '0.95rem', color: '#4f6074', fontFamily: 'monospace', fontWeight: 500, letterSpacing: '0.5px' }}>
                      {formatBroadcastDate(comm.submissionDate)}
                    </span>
                  </div>

                  <p style={{ 
                    color: isOwnComment ? '#d1d7db' : '#acb2b8', 
                    margin: 0, 
                    fontSize: '1.15rem', 
                    lineHeight: '1.75', 
                    wordBreak: 'break-word', 
                    letterSpacing: '0.2px' 
                  }}>
                    "{comm.commentText}"
                  </p>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}