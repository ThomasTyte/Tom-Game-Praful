"use client";

import React, { useEffect, useState, useRef } from 'react';
import { ComponentParams, ComponentRendering, Image } from '@sitecore-jss/sitecore-jss-nextjs';

interface GameDetailsProps {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields?: any; 
  searchParams?: { [key: string]: string | string[] | undefined };
}

const formatSitecoreDate = (dateString: string) => {
  if (!dateString || dateString === "TBA") return dateString;
  try {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (error) {
    return dateString;
  }
};

const GameDetails = ({ fields, rendering, params, searchParams }: GameDetailsProps): React.JSX.Element => {
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // --- USER & RATING PROFILE STATES ---
  const [loggedInUser, setLoggedInUser] = useState<string>('');
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // --- INTERACTIVE VISUAL STOREFRONT STATES ---
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalZoom, setModalZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isCardHovered, setIsCardHovered] = useState<boolean>(false);
  
  const hoverContainerRef = useRef<HTMLDivElement>(null);
  const modalImgRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // CORE AUTH SYNC LAYER
  const syncProfileSessionState = (targetId: string | null) => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isUserAuthenticated') === 'true';
      const currentSessionUser = authStatus ? (localStorage.getItem('authenticatedProfileId') || '') : '';
      
      setLoggedInUser(currentSessionUser);
      const resolvedId = targetId || activeId;

      if (resolvedId && currentSessionUser && currentSessionUser.trim() !== '') {
        const savedScore = localStorage.getItem(`rating_${resolvedId}_${currentSessionUser}`);
        if (savedScore) {
          setUserRating(parseInt(savedScore, 10));
          setIsSubmitted(true);
        } else {
          setUserRating(0);
          setIsSubmitted(false);
        }
      } else {
        setUserRating(0);
        setIsSubmitted(false);
      }
    }
  };

  useEffect(() => {
    let standardId: string | null = null;
    const localParamId = params?.GameId || params?.gameId || rendering?.params?.GameId;
    
    if (localParamId) {
      standardId = localParamId;
    } else if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const idFromUrl = urlParams.get('id') || urlParams.get('ID');
      standardId = idFromUrl || (searchParams?.id as string) || null;
    }

    setActiveId(standardId);
    syncProfileSessionState(standardId);

    const handleGlobalAuthMessage = () => syncProfileSessionState(standardId);
    window.addEventListener('profileSessionChange', handleGlobalAuthMessage);
    window.addEventListener('storage', handleGlobalAuthMessage);
    window.addEventListener('navbarAuthUpdate', handleGlobalAuthMessage);

    return () => {
      window.removeEventListener('profileSessionChange', handleGlobalAuthMessage);
      window.removeEventListener('storage', handleGlobalAuthMessage);
      window.removeEventListener('navbarAuthUpdate', handleGlobalAuthMessage);
    };
  }, [searchParams, params, rendering]);

  useEffect(() => {
    syncProfileSessionState(null);
  }, [loggedInUser, activeId]);

  useEffect(() => {
    const gameNodes = fields?.data?.item?.children?.results || fields?.item?.children?.results || fields?.items || [];
    if (gameNodes.length > 0) {
      const matchedGame = gameNodes.find((game: any) => game.id?.toLowerCase() === activeId?.toLowerCase());
      setGameData(matchedGame || gameNodes[0]); 
    } else if (fields?.gameTitle || fields?.Developer) {
      setGameData(fields);
    } else {
      setGameData(null);
    }
    setLoading(false);
  }, [activeId, fields]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeTheaterModal();
    };
    if (isModalOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = hoverContainerRef.current;
    if (!container) return;
    
    const { left, top, width, height } = container.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    const imgEl = container.querySelector('.interactive-display-target') as HTMLElement;
    if (imgEl) {
      imgEl.style.transformOrigin = `${x}% ${y}%`;
      imgEl.style.transform = 'scale(1.1)';
    }
  };

  const handleMouseLeave = () => {
    setIsCardHovered(false);
    const container = hoverContainerRef.current;
    if (!container) return;
    const imgEl = container.querySelector('.interactive-display-target') as HTMLElement;
    if (imgEl) {
      imgEl.style.transform = 'scale(1)';
      imgEl.style.transformOrigin = 'center center';
    }
  };

  const handleModalMouseDown = (e: React.MouseEvent) => {
    if (modalZoom === 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
  };

  const handleModalMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleModalMouseUp = () => {
    setIsDragging(false);
  };

  const closeTheaterModal = () => {
    setIsModalOpen(false);
    setModalZoom(1);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleRatingSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!loggedInUser || loggedInUser.trim() === '') return;
    if (userRating === 0) return;
    setIsSubmitted(true);
    if (typeof window !== 'undefined' && activeId) {
      localStorage.setItem(`rating_${activeId}_${loggedInUser}`, userRating.toString());
    }
  };

  const handleChangeRatingClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitted(false);
  };

  if (loading) {
    return (
      <div style={{ background: '#141b26', minHeight: '30vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
        <h2>Loading Catalog Asset Metadata...</h2>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div style={{ background: '#141b26', minHeight: '30vh', padding: '20px', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', background: '#1c2535', padding: '30px', borderRadius: '8px', border: '1px dashed #4f5d73', textAlign: 'center' }}>
          <h2 style={{ color: '#ff4d4d' }}>No Game Content Found</h2>
        </div>
      </div>
    );
  }

  const title = gameData.gameTitle?.value || gameData.name || "Untitled Game";
  const developer = gameData.Developer?.value || "Unknown Developer";
  const rawReleaseDate = gameData.ReleaseDate?.value || "TBA";
  const description = gameData.GameDescription?.value || "No description available.";
  const baseStaticRating = gameData.AverageRating?.value || "Unrated";
  const formattedReleaseDate = formatSitecoreDate(rawReleaseDate);
  const imageField = gameData.jpeg?.jsonValue;

  const isUserLoggedIn = loggedInUser && loggedInUser.trim() !== '';

  const cleanTitleStr = title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const isChronoBound = cleanTitleStr.includes('chronobound') || cleanTitleStr.includes('coronabound');
  const isApexPredator = cleanTitleStr.includes('apexpredator') || cleanTitleStr.includes('apexisland');
  const isEligibleForSale = isChronoBound || isApexPredator;

  return (
    /* --- OPTIMIZED LIGHTER GRAY-BLUE BACKDROP WRAPPER --- */
    <div className="game-details-viewer-wrapper" style={{ background: '#141b26', padding: '50px 20px', color: '#fff', fontFamily: 'sans-serif', position: 'relative', overflow: 'hidden', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
      
      {/* --- STEAM BLUE GRADIENT RADIAL UNDERLAY --- */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '1000px', height: '700px', background: 'radial-gradient(circle, rgba(102, 192, 244, 0.12) 0%, rgba(20, 27, 38, 0) 70%)', zIndex: '1', pointerEvents: 'none' }} />

      {/* --- DYNAMIC FADED ARTWORK GLOW BACKDROP --- */}
      {imageField?.value?.src && (
        <div style={{ position: 'absolute', top: '-5%', left: '-5%', width: '110%', height: '110%', backgroundImage: `url(${imageField.value.src})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(110px) opacity(0.14)', zIndex: '2', pointerEvents: 'none' }} />
      )}

      {/* --- HIGH-TECH BOXED LINE PATTERN BACKGROUND LAYER --- */}
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '32px 32px', backgroundPosition: 'center center', zIndex: '3', pointerEvents: 'none', opacity: '0.9' }} />

      {/* --- MAIN TRANSLUCENT CONTAINER CARD WITH GRADIENT FRAMING --- */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', background: 'linear-gradient(135deg, rgba(27, 38, 56, 0.75) 0%, rgba(16, 24, 39, 0.85) 100%)', backdropFilter: 'blur(24px)', borderRadius: '14px', overflow: 'hidden', boxShadow: isCardHovered ? '0 25px 55px rgba(0,0,0,0.7), 0 0 40px rgba(102, 192, 244, 0.22), inset 0 0 25px rgba(255,255,255,0.04)' : '0 15px 35px rgba(0,0,0,0.5), inset 0 0 15px rgba(255,255,255,0.02)', display: 'flex', flexWrap: 'wrap', position: 'relative', zIndex: '4', border: isCardHovered ? '1px solid rgba(102, 192, 244, 0.45)' : '1px solid rgba(255, 255, 255, 0.07)', transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
        
        {isEligibleForSale && (
          <div style={{ position: 'absolute', top: '20px', left: '20px', background: 'linear-gradient(45deg, #ff0055, #ff5500)', color: '#fff', padding: '8px 22px', fontWeight: 'bold', borderRadius: '4px', fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(255, 0, 85, 0.4)', zIndex: '10', letterSpacing: '1px', textTransform: 'uppercase' }}>
            🔥 SPECIAL WEEKEND SALE
          </div>
        )}

        {/* COMPONENT PREVIEW CONTAINER VIEWPORT */}
        <div 
          ref={hoverContainerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsCardHovered(true)}
          onMouseLeave={handleMouseLeave}
          onClick={() => imageField?.value?.src && setIsModalOpen(true)}
          style={{ flex: '1 1 420px', background: 'rgba(10, 15, 22, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '480px', position: 'relative', overflow: 'hidden', cursor: imageField?.value?.src ? 'zoom-in' : 'default', borderRight: '1px solid rgba(255,255,255,0.04)' }}
        >
          {imageField?.value?.src ? (
            <>
              <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: isCardHovered ? 'radial-gradient(circle, rgba(0,0,0,0) 20%, rgba(7,10,15,0.2) 100%)' : 'radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(7,10,15,0.5) 100%)', zIndex: '3', transition: 'all 0.3s ease', pointerEvents: 'none' }} />
              
              <div className="interactive-display-target" style={{ width: '100%', height: '100%', transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)' }}>
                <Image field={imageField} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              
              <div style={{ position: 'absolute', bottom: '25px', right: '25px', background: isCardHovered ? 'linear-gradient(135deg, #66c0f4 0%, #177ddc 100%)' : 'rgba(23, 32, 48, 0.85)', padding: '9px 18px', borderRadius: '6px', fontSize: '0.75rem', color: isCardHovered ? '#fff' : '#66c0f4', fontWeight: 'bold', pointerEvents: 'none', border: isCardHovered ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(102,192,244,0.15)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', transition: 'all 0.3s ease', zIndex: '4', letterSpacing: '0.5px' }}>
                🔍 METADATA ZOOM PREVIEW
              </div>
            </>
          ) : (
            <div style={{ color: '#4f5d73', textAlign: 'center', padding: '20px' }}>🎮<p>No Artwork Preview Available</p></div>
          )}
        </div>

        {/* TRANSLUCENT LIGHT WHITE AND GRAY ACCENTED CONTENT LAYER */}
        <div style={{ flex: '1 2 580px', padding: '45px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, rgba(255,255,255,0) 100%)' }}>
          <div>
            <h1 style={{ fontSize: '3rem', margin: '0 0 12px 0', fontWeight: 'bold', letterSpacing: '-0.5px', textShadow: '0 4px 15px rgba(0,0,0,0.4)', color: '#fff' }}>{title}</h1>
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', marginBottom: '25px', fontSize: '0.9rem', color: '#66c0f4', fontWeight: '500' }}>
              <div><strong>Developer:</strong> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{developer}</span></div>
              <div><strong>Released:</strong> <span style={{ color: 'rgba(255,255,255,0.85)' }}>{formattedReleaseDate}</span></div>
            </div>
            <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '25px' }} />
            <div style={{ color: 'rgba(235, 240, 245, 0.8)', lineHeight: '1.7', fontSize: '1.1rem', marginBottom: '35px' }}>
              <p>{description}</p>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)', padding: '22px 32px', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.03)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#66717e', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Avg Rating</div>
              <div style={{ fontSize: '1.4rem', color: '#ffcc00', fontWeight: 'bold' }}>⭐ {baseStaticRating}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '0.85rem', color: '#66c0f4', marginBottom: '6px', fontWeight: '500' }}>
                {!isUserLoggedIn ? "Ratings Locked" : isSubmitted ? "Your Submitted Score" : "Rate This Game"}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit = hoverRating ? star <= hoverRating : star <= userRating;
                    const disableStarInteraction = !isUserLoggedIn || isSubmitted;
                    return (
                      <button
                        key={star}
                        type="button"
                        disabled={disableStarInteraction}
                        onClick={() => setUserRating(star)}
                        onMouseEnter={() => !disableStarInteraction && setHoverRating(star)}
                        onMouseLeave={() => !disableStarInteraction && setHoverRating(0)}
                        style={{ background: 'none', border: 'none', cursor: disableStarInteraction ? 'default' : 'pointer', padding: '0', fontSize: '1.6rem', color: isLit ? '#ffcc00' : 'rgba(255,255,255,0.12)', opacity: !isUserLoggedIn ? 0.25 : 1, outline: 'none', transition: 'transform 0.1s ease' }}
                      >
                        ★
                      </button>
                    );
                  })}
                </div>

                {!isUserLoggedIn ? (
                  <span style={{ fontSize: '11px', color: '#ff4d4d', fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(255,77,77,0.08)', padding: '7px 14px', borderRadius: '4px', border: '1px solid rgba(255,77,77,0.2)' }}>
                    Log in to rate game
                  </span>
                ) : !isSubmitted ? (
                  <button
                    type="button"
                    onClick={handleRatingSubmit}
                    disabled={userRating === 0}
                    style={{ padding: '8px 18px', fontSize: '12px', borderRadius: '4px', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', cursor: userRating === 0 ? 'not-allowed' : 'pointer', background: userRating > 0 ? 'linear-gradient(to bottom, #47b2e4 0%, #177ddc 100%)' : 'rgba(255,255,255,0.05)', color: userRating > 0 ? '#fff' : '#4f5d73', transition: 'all 0.2s' }}
                  >
                    Submit Rating
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#a3cf06', fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(163,207,6,0.08)', padding: '7px 14px', borderRadius: '4px', border: '1px solid rgba(163,207,6,0.2)', letterSpacing: '0.5px' }}>
                      Rating Recorded!
                    </span>
                    <button
                      type="button"
                      onClick={handleChangeRatingClick}
                      style={{ padding: '7px 14px', fontSize: '11px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {isEligibleForSale ? (
                <>
                  <div style={{ fontSize: '0.8rem', color: '#a3cf06', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '0.5px' }}>Save 33% Now</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through', fontWeight: '500' }}>$29.99</span>
                    <span style={{ fontSize: '2.4rem', color: '#a3cf06', fontWeight: 'bold', textShadow: '0 0 15px rgba(163,207,6,0.4)' }}>$19.99</span>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '0.8rem', color: '#66717e', textTransform: 'uppercase', marginBottom: '4px' }}>Price</div>
                  <div style={{ fontSize: '1.9rem', color: '#a3cf06', fontWeight: 'bold' }}>
                    {gameData.Price?.value || "Free to Play"}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* --- AUDIO-VISUAL THEATER MEDIA VIEWPORT --- */}
      {isModalOpen && (
        <div 
          onClick={(e) => e.target === e.currentTarget && closeTheaterModal()}
          style={{ position: 'fixed', top: '0', left: '0', width: '100vw', height: '100vh', background: 'rgba(4, 6, 9, 0.98)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: '99999', backdropFilter: 'blur(20px)', padding: '20px' }}
        >
          <div style={{ width: '100%', maxWidth: '1050px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', padding: '0 10px' }}>
            <h4 style={{ margin: '0', color: '#fff', fontSize: '1.2rem', fontWeight: '600', letterSpacing: '0.5px' }}>{title} — Asset Preview Layout</h4>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#171a21', padding: '6px 18px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <button onClick={() => setModalZoom(prev => Math.max(1, prev - 0.25))} style={{ background: 'none', border: 'none', color: '#66c0f4', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
              <input type="range" min="1" max="3" step="0.1" value={modalZoom} onChange={(e) => setModalZoom(parseFloat(e.target.value))} style={{ accentColor: '#66c0f4', width: '130px', cursor: 'ew-resize' }} />
              <button onClick={() => setModalZoom(prev => Math.min(3, prev + 0.25))} style={{ background: 'none', border: 'none', color: '#66c0f4', fontSize: '1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
              <span style={{ fontSize: '0.8rem', color: '#acb2b8', minWidth: '35px', fontFamily: 'monospace' }}>{Math.round(modalZoom * 100)}%</span>
              {modalZoom > 1 && (
                <button onClick={() => { setModalZoom(1); setDragOffset({ x: 0, y: 0 }); }} style={{ background: '#2a475e', border: 'none', color: '#fff', padding: '4px 10px', borderRadius: '4px', fontSize: '0.70rem', cursor: 'pointer', fontWeight: 'bold' }}>RESET</button>
              )}
            </div>

            <button 
              onClick={closeTheaterModal}
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#c1272d'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
            >
              ✕ CLOSE <span style={{ opacity: '0.4', fontSize: '0.7rem', fontWeight: 'normal' }}>[ESC]</span>
            </button>
          </div>

          <div 
            ref={modalImgRef}
            onMouseDown={handleModalMouseDown}
            onMouseMove={handleModalMouseMove}
            onMouseUp={handleModalMouseUp}
            onMouseLeave={handleModalMouseUp}
            style={{ width: '100%', maxWidth: '1050px', height: '75vh', background: '#030508', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 60px rgba(0,0,0,0.95)', cursor: modalZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '90%', height: '90%', transform: 'translate(-50%, -50%)', backgroundImage: `url(${imageField.value.src})`, backgroundSize: 'cover', filter: 'blur(120px) opacity(0.18)', pointerEvents: 'none', zIndex: '0' }} />

            <div style={{ width: '100%', height: '100%', transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) scale(${modalZoom})`, transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1), translate 0.2s cubic-bezier(0.25, 1, 0.5, 1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: '1' }}>
              <Image field={imageField} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }} />
            </div>

            {modalZoom > 1 && (
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(0,0,0,0.85)', padding: '6px 14px', borderRadius: '4px', fontSize: '0.75rem', color: '#66c0f4', pointerEvents: 'none', border: '1px solid rgba(102,192,244,0.2)' }}>
                🖐️ Panning texturing array enabled
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetails;