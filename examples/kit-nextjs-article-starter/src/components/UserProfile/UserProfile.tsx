"use client";

import React, { useEffect, useState } from 'react';
import { ComponentParams, ComponentRendering, Field } from '@sitecore-jss/sitecore-jss-nextjs';

interface SitecoreProfileItem {
  id: string;
  name: string;
  fields?: {
    Username?: { value: string } | Field<string>;
    Email?: { value: string } | Field<string>;
    Role?: { value: string } | Field<string>;
    Saved_Payment_Methods?: { value: string } | Field<string>;
  };
}

interface UserProfileProps {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields?: {
    items?: SitecoreProfileItem[];
    children?: SitecoreProfileItem[];
    Username?: { value: string } | Field<string>;
    Email?: { value: string } | Field<string>;
    Role?: { value: string } | Field<string>;
  } | any; 
}

const UserProfile = (props: UserProfileProps): React.JSX.Element => {
  const [loggedInUser, setLoggedInUser] = useState<string>('');
  const [activeProfileDetails, setActiveProfileDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [inputUsername, setInputUsername] = useState<string>('');
  const [inputPassword, setInputPassword] = useState<string>(''); 
  const [errorMessage, setErrorMessage] = useState<string>('');

  const getFieldValue = (fieldObj: any): string => {
    if (!fieldObj) return '';
    if (typeof fieldObj.value === 'string') return fieldObj.value;
    if (typeof fieldObj === 'string') return fieldObj;
    return '';
  };

  // Safe masking for payment string details to display last 4 digits
  const formatPaymentMethod = (rawPayment: string): string => {
    const cleanStr = rawPayment.trim().replace(/[-\s]/g, '');
    if (!cleanStr) return 'No Method Linked';
    if (cleanStr.length >= 4) {
      const lastFour = cleanStr.slice(-4);
      return `Visa •••• ${lastFour}`;
    }
    return cleanStr;
  };

  const rawProfilesList: any[] = 
    props?.fields?.items || 
    props?.fields?.children || 
    props?.fields?.data?.item?.children?.results ||
    [];

  // CORE AUTH CHECK & STATE ALIGNMENT
  const checkAuthSession = () => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('isUserAuthenticated') === 'true';
      const currentSessionUser = localStorage.getItem('authenticatedProfileId');
      
      if (!authStatus || !currentSessionUser || currentSessionUser.trim() === '') {
        setLoggedInUser('');
        setActiveProfileDetails(null);
        setLoading(false);
        return;
      }

      setLoggedInUser(currentSessionUser);

      let matchedNode = rawProfilesList.find((profile) => {
        const cmsUserVal = getFieldValue(profile?.fields?.Username || profile?.Username);
        const nameFallback = profile?.name || '';
        return (cmsUserVal || nameFallback).trim().toLowerCase() === currentSessionUser.trim().toLowerCase();
      });

      if (!matchedNode && props?.fields) {
        const directCmsUser = getFieldValue(props.fields.Username);
        if (directCmsUser.trim().toLowerCase() === currentSessionUser.trim().toLowerCase()) {
          matchedNode = { id: props.rendering?.dataSource, fields: props.fields };
        }
      }

      if (matchedNode) {
        setActiveProfileDetails(matchedNode);
      } else {
        setActiveProfileDetails({
          id: props.rendering?.dataSource || "Global Index Node",
          fields: {
            Role: { value: "Premium Executive Player" },
            Email: { value: "Synchronized via Login Session" },
            Saved_Payment_Methods: { value: "•••• •••• •••• 8842" }
          }
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuthSession();

    const handleAuthChange = () => {
      checkAuthSession();
    };

    window.addEventListener('profileSessionChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('navbarAuthUpdate', handleAuthChange);

    return () => {
      window.removeEventListener('profileSessionChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('navbarAuthUpdate', handleAuthChange);
    };
  }, [rawProfilesList, props?.fields]);

  const handleInlineLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submittedName = inputUsername.trim();
    const submittedPassword = inputPassword.trim().toLowerCase();

    if (!submittedName || !submittedPassword) {
      setErrorMessage("Please complete both Username and Password fields.");
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('isUserAuthenticated', 'true');
      localStorage.setItem('authenticatedProfileId', submittedName);
      
      setLoggedInUser(submittedName);
      setErrorMessage('');
      setInputUsername('');
      setInputPassword('');
      
      window.dispatchEvent(new Event('profileSessionChange'));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('navbarAuthUpdate'));
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isUserAuthenticated');
      localStorage.removeItem('authenticatedProfileId');
      
      setLoggedInUser('');
      setActiveProfileDetails(null);
      
      window.dispatchEvent(new Event('profileSessionChange'));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('navbarAuthUpdate'));
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#141b26', minHeight: '20vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'sans-serif' }}>
        <h3 style={{ color: 'rgba(255,255,255,0.7)', letterSpacing: '1px', fontSize: '1rem' }}>Connecting Account Handshakes...</h3>
      </div>
    );
  }

  const hasValidSession = loggedInUser && loggedInUser.trim() !== '';
  
  const rawPaymentVal = getFieldValue(
    activeProfileDetails?.fields?.Saved_Payment_Methods || 
    activeProfileDetails?.Saved_Payment_Methods
  );
  const paymentDisplay = rawPaymentVal ? formatPaymentMethod(rawPaymentVal) : "Visa •••• 4912";

  return (
    <div className="user-profile-component-container" style={{ padding: '30px 20px 10px 20px', background: '#141b26', fontFamily: 'sans-serif', color: '#fff', position: 'relative', overflow: 'hidden' }}>
      
      {/* KEYBOARD ACCENT LIGHT LINES GRID LAYER */}
      <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)', backgroundSize: '32px 32px', zIndex: '1', pointerEvents: 'none' }} />

      {/* COMPONENT CSS KEYFRAMES EMBED (FOR SHARP RINGS) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes avatarPulseGlow {
          0% { box-shadow: 0 0 12px rgba(102, 192, 244, 0.2), inset 0 0 8px rgba(102, 192, 244, 0.2); }
          50% { box-shadow: 0 0 24px rgba(102, 192, 244, 0.5), inset 0 0 14px rgba(102, 192, 244, 0.4); }
          100% { box-shadow: 0 0 12px rgba(102, 192, 244, 0.2), inset 0 0 8px rgba(102, 192, 244, 0.2); }
        }
        .glowing-profile-ring {
          animation: avatarPulseGlow 3s infinite ease-in-out;
        }
      `}} />

      {!hasValidSession ? (
        /* --- PROMPT SIGN IN LOCK --- */
        <div 
          className="access-protected-card"
          style={{ 
            maxWidth: '1100px', 
            margin: '0 auto', 
            background: 'linear-gradient(135deg, rgba(30, 42, 62, 0.5) 0%, rgba(14, 22, 35, 0.75) 100%)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 77, 77, 0.25)', 
            borderRadius: '14px', 
            padding: '30px 35px',
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.45), inset 0 0 20px rgba(255,255,255,0.02)',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: '2'
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(10, 15, 22, 0.6)', border: '1px solid rgba(255, 255, 255, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', fontWeight: 'bold', color: '#66c0f4', userSelect: 'none', flexShrink: 0 }} { ...{ className: "glowing-profile-ring" } as any }>
            ?
          </div>

          <div style={{ flex: '1 1 280px' }}>
            <h2 style={{ color: '#ff4d4d', margin: '0 0 6px 0', fontSize: '1.25rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', textShadow: '0 2px 10px rgba(255,77,77,0.2)' }}>
              Access Protected
            </h2>
            <p style={{ color: 'rgba(235, 240, 245, 0.75)', margin: '0', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Please enter your account details below or log in via the top navigation panel to access this database profile.
            </p>
            {errorMessage && (
              <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#ff4d4d', fontWeight: 'bold' }}>⚠️ {errorMessage}</div>
            )}
          </div>

          <form onSubmit={handleInlineLoginSubmit} style={{ display: 'flex', flexDirection: 'row', gap: '12px', flexShrink: 0, width: '100%', maxWidth: '520px', flexWrap: 'wrap' }}>
            <input 
              type="text"
              placeholder="Account Username..."
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              style={{ background: 'rgba(10, 15, 22, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '11px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none', flex: '1 1 150px' }}
            />
            <input 
              type="password"
              placeholder="Password..."
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              style={{ background: 'rgba(10, 15, 22, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '11px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none', flex: '1 1 150px' }}
            />
            <button
              type="submit"
              style={{ padding: '11px 24px', fontSize: '0.85rem', borderRadius: '6px', border: 'none', fontWeight: 'bold', textTransform: 'uppercase', cursor: 'pointer', background: 'linear-gradient(to bottom, #47b2e4 0%, #177ddc 100%)', color: '#fff', letterSpacing: '0.5px' }}
            >
              Sign In
            </button>
          </form>
        </div>
      ) : (
        /* --- SECURE DYNAMIC PREMIUM PROFILE CARD --- */
        <div 
          style={{ 
            maxWidth: '1100px', 
            margin: '0 auto', 
            background: 'linear-gradient(135deg, rgba(32, 46, 68, 0.45) 0%, rgba(15, 23, 38, 0.7) 100%)', 
            backdropFilter: 'blur(25px)',
            borderRadius: '16px', 
            padding: '35px 40px', 
            boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
            border: '1px solid rgba(255, 255, 255, 0.09)',
            position: 'relative',
            zIndex: '2'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
              
              {/* CHRONO/APEX HIGHLIGHTED AVATAR RING */}
              <div 
                { ...{ className: "glowing-profile-ring" } as any }
                style={{ 
                  width: '84px', 
                  height: '84px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #66c0f4 0%, #177ddc 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'center', 
                  fontSize: '2.2rem', 
                  fontWeight: '900', 
                  color: '#0e141f',
                  border: '3px solid rgba(255,255,255,0.15)',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  padding: '3px',
                  boxSizing: 'border-box'
                }} 
              >
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#121926', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#66c0f4' }}>
                  {loggedInUser.substring(0, 2).toUpperCase()}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#66c0f4', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '2px', textShadow: '0 0 10px rgba(102,192,244,0.3)' }}>
                  Apex Survivor Profile
                </span>
                <h1 style={{ fontSize: '2.5rem', margin: '2px 0 0 0', fontWeight: 'bold', color: '#fff', letterSpacing: '-0.5px' }}>
                  {loggedInUser}
                </h1>
              </div>
            </div>

            <button
              onClick={handleLogout}
              style={{ padding: '10px 22px', background: 'transparent', border: '1px solid rgba(255, 77, 77, 0.4)', color: '#ff4d4d', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,77,77,0.1)'; e.currentTarget.style.borderColor = '#ff4d4d'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 77, 77, 0.4)'; }}
            >
              Disconnect Session
            </button>
          </div>
          
          <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '30px 0' }} />
          
          {/* USER PARAMETERS CONTAINER ROW */}
          <div style={{ background: 'rgba(7, 10, 15, 0.5)', padding: '22px 30px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px', fontSize: '0.9rem' }}>
              
              <div>
                <span style={{ display: 'block', color: '#66717e', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.5px' }}>Security Matrix Matrix</span> 
                <span style={{ color: '#a3cf06', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🛡️ {getFieldValue(activeProfileDetails?.fields?.Role || activeProfileDetails?.Role) || "Premium Member"}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', color: '#66717e', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.5px' }}>Verified Gateway Handshake</span> 
                <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500', fontFamily: 'monospace' }}>
                  {getFieldValue(activeProfileDetails?.fields?.Email || activeProfileDetails?.Email) || "Verified secure link"}
                </span>
              </div>

              <div>
                <span style={{ display: 'block', color: '#66717e', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px', letterSpacing: '0.5px' }}>Linked Payment Vault</span> 
                <span style={{ color: '#66c0f4', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                  💳 {paymentDisplay}
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;