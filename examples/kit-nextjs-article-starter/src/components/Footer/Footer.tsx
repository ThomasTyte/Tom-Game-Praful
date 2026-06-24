import React from 'react';

export const Footer = (): React.JSX.Element => {
  const interactiveLinkStyle: React.CSSProperties = {
    color: '#66c0f4',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'all 0.2s',
    cursor: 'pointer'
  };

  return (
    <footer style={{ width: '100%', background: '#171a21', borderTop: '1px solid #2a475e', boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.4)', fontFamily: '"Motiva Sans", Sans-serif', boxSizing: 'border-box' }}>
      {/* Pure CSS Interaction Engine */}
      <style dangerouslySetInnerHTML={{__html: `
        .matrix-nav-link {
          color: #b8b6b4;
          text-decoration: none;
          font-size: 14px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 8px;
          font-family: inherit;
          transition: color 0.2s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .matrix-nav-link:hover {
          color: #fff !important;
        }
        .matrix-interactive-link:hover {
          color: #fff !important;
          text-decoration: underline !important;
        }
        
        /* Hidden Pipeline Trackers */
        .state-toggle {
          display: none !important;
        }

        /* Comment box panel layout */
        .matrix-comment-panel {
          display: none;
          margin-top: 12px;
          background: #0a0f16;
          border: 1px solid #2a475e;
          padding: 12px;
          border-radius: 4px;
          max-width: 350px;
          animation: slideDown 0.25s ease-out;
        }

        /* Success Display layout */
        .matrix-success-alert {
          display: none;
          margin-top: 12px;
          color: #a3cf06;
          font-weight: bold;
          font-size: 0.85rem;
          background: rgba(163, 207, 6, 0.1);
          border: 1px solid rgba(163, 207, 6, 0.3);
          padding: 8px 12px;
          border-radius: 3px;
          max-width: 350px;
          animation: slideDown 0.25s ease-out;
        }

        /* Reset control styling */
        .matrix-reset-btn {
          display: block;
          margin-top: 6px;
          font-size: 11px;
          color: #66c0f4;
          text-decoration: underline;
          cursor: pointer;
          font-weight: normal;
        }
        .matrix-reset-btn:hover {
          color: #fff;
        }

        /* STEP 1: Email clicked -> open comment interface */
        #comment-box-state:checked ~ .matrix-comment-panel {
          display: block !important;
        }

        /* STEP 2: Transmit clicked -> hide input, show success screen */
        #message-sent-state:checked ~ .matrix-comment-panel {
          display: none !important;
        }
        #message-sent-state:checked ~ .matrix-success-alert {
          display: block !important;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* TOP LAYER: BRANDING AND MAIN NAVIGATION LINKS */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#66c0f4', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '1px' }}>
              Corporate Platform Matrix
            </span>
            <h2 style={{ fontSize: '1.8rem', margin: '4px 0 0 0', fontWeight: 'bold', color: '#fff' }}>
              BOTG Solutions
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <a href="/" className="matrix-nav-link">Home</a>
            <a href="/blog" className="matrix-nav-link">Blog</a>
            <a href="/cart" className="matrix-nav-link">Cart</a>
          </div>
        </div>

        <hr style={{ border: '0', borderTop: '1px solid #2a3f5a', margin: '0' }} />

        {/* BOTTOM LAYER: TECHNICAL SUPPORT BOX AND GITHUB ATTACHMENT */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', justifyContent: 'space-between', alignItems: 'center' }}>
          
          <div style={{ background: '#0a0f16', padding: '20px 25px', borderRadius: '4px', border: '1px solid #1a2736', flex: '1 1 450px' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#66c0f4', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Active Support Parameters
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontFamily: 'monospace', fontSize: '0.9rem', color: '#acb2b8' }}>
              <div>
                <span style={{ color: '#66717e' }}>Linked Email Handshake:</span><br />
                
                {/* Checkbox state nodes */}
                <input type="checkbox" id="comment-box-state" className="state-toggle" />
                <input type="checkbox" id="message-sent-state" className="state-toggle" />
                
                {/* Trigger Label */}
                <label 
                  htmlFor="comment-box-state"
                  className="matrix-interactive-link"
                  style={interactiveLinkStyle}
                >
                  thomas@botgsolutions.com
                </label>
                
                {/* Text Input Panel */}
                <div className="matrix-comment-panel">
                  <div style={{ color: '#66c0f4', fontSize: '11px', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
                    Secure Encryption Link Open
                  </div>
                  <textarea 
                    placeholder="Enter message parameter payload here..."
                    style={{
                      width: '100%',
                      height: '70px',
                      background: '#141922',
                      border: '1px solid #2a475e',
                      borderRadius: '3px',
                      color: '#fff',
                      padding: '8px',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      resize: 'none',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                    <label
                      htmlFor="message-sent-state"
                      style={{
                        background: 'linear-gradient(to bottom, #a3cf06 0%, #7da302 100%)',
                        color: '#fff',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '6px 12px',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                      }}
                    >
                      Transmit Handshake
                    </label>
                  </div>
                </div>

                {/* Confirmation Status Screen with Reset trigger */}
                <div className="matrix-success-alert">
                  ✓ Message confirmation sent to thomas@botgsolutions.com!
                  {/* Clicking this reset button resets the checkboxes to initial loop states */}
                  <label htmlFor="message-sent-state" className="matrix-reset-btn">
                    ← Send another message
                  </label>
                </div>

              </div>
              <div>
                <span style={{ color: '#66717e' }}>Security Support Line:</span><br />
                <a 
                  href="tel:828-269-8895" 
                  className="matrix-interactive-link"
                  style={interactiveLinkStyle}
                >
                  828-269-8895
                </a>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '260px' }}>
            <div style={{ fontSize: '0.85rem', color: '#66c0f4', marginBottom: '6px', fontWeight: '500', textTransform: 'uppercase' }}>
              Core Repository Tracking
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <a
                href="https://github.com/ThomasTyte/Tom-Game-Praful"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px', 
                  fontSize: '12px', 
                  borderRadius: '3px', 
                  border: 'none', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  background: 'linear-gradient(to bottom, #47b2e4 0%, #177ddc 100%)',
                  color: '#fff', 
                  display: 'inline-block',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
              >
                Open GitHub Profile
              </a>

              <div style={{ fontSize: '11px', color: '#a3cf06', fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(163,207,6,0.1)', padding: '9px 14px', borderRadius: '3px', border: '1px solid rgba(163,207,6,0.25)', letterSpacing: '0.5px' }}>
                Build: Active Verified
              </div>
            </div>
            
            <div style={{ fontSize: '0.75rem', color: '#8f98a0', marginTop: '10px', fontFamily: 'monospace' }}>
              System Status: <span style={{ color: '#a3cf06', fontWeight: 'bold' }}>Online</span>
            </div>
          </div>

        </div>

        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#66717e', fontFamily: 'monospace', marginTop: '10px' }}>
          © {new Date().getFullYear()} BOTG SOLUTIONS // SOURCE CODE REGISTERED IN MATRIX RECORDS
        </div>

      </div>
    </footer>
  );
};

export default Footer;