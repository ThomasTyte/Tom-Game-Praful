import React from 'react';

// --- TYPE DEFINITIONS FOR SITECORE GRAPHQL DATA ---
interface GraphQLField {
  name: string;
  value: string;
  jsonValue?: {
    src?: string;
    alt?: string;
    width?: string;
    height?: string;
  };
}

interface SitecoreItemResult {
  name: string;
  fields: GraphQLField[];
}

interface GraphQLFolderNode {
  results: SitecoreItemResult[];
}

export interface SitecoreSteamOrderData {
  orders?: GraphQLFolderNode;
  games?: GraphQLFolderNode;
  profiles?: GraphQLFolderNode;
}

interface OrdersProps {
  renderingData?: SitecoreSteamOrderData;
}

// --- FIELD VALUE EXTRACTION HELPERS ---
const getFieldValue = (fields: GraphQLField[], fieldName: string): string => {
  return fields.find((f) => f.name === fieldName)?.value || '';
};

const getFieldJsonValue = (fields: GraphQLField[], fieldName: string) => {
  return fields.find((f) => f.name === fieldName)?.jsonValue || {};
};

// --- MAIN ORDERS COMPONENT ---
function Orders({ renderingData }: OrdersProps) {
  
  // Static Fallbacks for Sitecore Experience Editor rendering preview
  const data = renderingData || {
    orders: {
      results: [
        {
          name: "Order_3",
          fields: [
            { name: "ID", value: "User_008" },
            { name: "Username", value: "ApexSurvivor_Island" },
            { name: "Total_Price", value: "39.99" },
            { name: "Status", value: "Completed" },
            { name: "Created", value: "6/24/2026" },
            { name: "Currency_Type", value: "USD" },
            { name: "Email", value: "jwoods@survivalist.com" }
          ]
        }
      ]
    },
    games: {
      results: [
        {
          name: "Game_CyberNet_Overdrive",
          fields: [
            { name: "Title", value: "CyberNet Overdrive" },
            { name: "Price", value: "39.99" },
            { name: "SKU", value: "SKU # 314122" },
            { name: "Release_Date", value: "6/9/2026" },
            { name: "Rating", value: "4.7" },
            { name: "Developer", value: "Neon Byte Games" },
            { name: "Value_Studio", value: "Legendary" },
            { name: "Game_Image", value: "", jsonValue: { src: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600", alt: "CyberNet" } }
          ]
        }
      ]
    },
    profiles: {
      results: [
        {
          name: "Profile_User_008",
          fields: [
            { name: "ID", value: "User_008" },
            { name: "Username", value: "ApexSurvivor_Island" },
            { name: "Email", value: "jwoods@survivalist.com" },
            { name: "Role", value: "MEMBER" }
          ]
        }
      ]
    }
  };

  const activeOrder = data.orders?.results?.[0];
  const activeProfile = data.profiles?.results?.[0];
  const purchasedGame = data.games?.results?.[0];

  if (!activeOrder || !activeProfile) {
    return <div style={{ color: '#fff', padding: '20px' }}>Waiting for configuration data...</div>;
  }

  const orderFields = activeOrder.fields;
  const profileFields = activeProfile.fields;

  return (
    <div style={styles.componentContainer}>
      {/* Container is completely un-headed and un-footed, ready for your custom wrappers */}
      <div style={styles.mainLayout}>
        
        {/* User Account Context Box */}
        <div style={styles.contentBlock}>
          <h2 style={styles.blockHeading}>User Account Matrix</h2>
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>User Token ID:</span>
            <span style={styles.metaValue}>{getFieldValue(profileFields, 'ID')}</span>
          </div>
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Email Node:</span>
            <span style={styles.metaValue}>{getFieldValue(profileFields, 'Email')}</span>
          </div>
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Tier Clearance:</span>
            <span style={{...styles.metaValue, color: '#00f0ff', fontWeight: 'bold'}}>{getFieldValue(profileFields, 'Role')}</span>
          </div>
        </div>

        {/* Invoice Receipt Box */}
        <div style={styles.contentBlock}>
          <div style={styles.receiptHeader}>
            <span style={styles.orderNumber}>
              DATA NODE REFERENCE: {activeOrder.name} &bull; STATE VERIFIED
            </span>
            <h1 style={styles.mainTitle}>Transaction Receipt</h1>
            <div style={styles.dateStamp}>Timestamp: {getFieldValue(orderFields, 'Created')}</div>
          </div>

          <h2 style={styles.blockHeading}>Items Processed</h2>
          
          {purchasedGame && (
            /* Premium Flashy Showcard Component Upgrade */
            <div style={styles.flashyProductCard}>
              <div style={styles.productThumb}>
                <img 
                  src={getFieldJsonValue(purchasedGame.fields, 'Game_Image')?.src} 
                  alt={getFieldJsonValue(purchasedGame.fields, 'Game_Image')?.alt || "Title Thumbnail"} 
                  style={styles.imgFluid}
                />
              </div>
              <div style={styles.productDetails}>
                <div style={styles.productTitle}>{getFieldValue(purchasedGame.fields, 'Title')}</div>
                <div style={styles.studioMeta}>
                  Studio: <b style={{ color: '#fff' }}>{getFieldValue(purchasedGame.fields, 'Developer')}</b> [{getFieldValue(purchasedGame.fields, 'Value_Studio')}]
                </div>
                <div style={styles.specMeta}>
                  SKU: <b>{getFieldValue(purchasedGame.fields, 'SKU')}</b> | Global Rating: <span style={styles.ratingBadge}>{getFieldValue(purchasedGame.fields, 'Rating')} / 5</span>
                </div>
                <div style={styles.priceTag}>
                  {getFieldValue(purchasedGame.fields, 'Price')} {getFieldValue(orderFields, 'Currency_Type')}
                </div>
              </div>
            </div>
          )}

          <div style={styles.totalBlock}>
            <span style={styles.totalLabel}>Wallet Deduction:</span>
            <span style={styles.totalPrice}>
              {getFieldValue(orderFields, 'Total_Price')} {getFieldValue(orderFields, 'Currency_Type')}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- FLAT STEAM PLATFORM THEME INTERFACE STYLES ---
const styles: { [key: string]: React.CSSProperties } = {
  componentContainer: {
    backgroundColor: '#1b2838',
    color: '#c6d4df',
    minHeight: '100vh',
    paddingTop: '40px',
    paddingBottom: '40px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  mainLayout: {
    width: '90%',
    maxWidth: '800px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  contentBlock: {
    backgroundColor: '#101822',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  blockHeading: {
    color: '#fff',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginTop: 0,
    marginBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '8px',
  },
  metaRow: {
    display: 'flex',
    fontSize: '14px',
    marginBottom: '8px',
  },
  metaLabel: {
    color: '#8f98a0',
    width: '140px',
  },
  metaValue: {
    color: '#fff',
  },
  receiptHeader: {
    borderBottom: '2px solid #1a3a54',
    paddingBottom: '16px',
    marginBottom: '20px',
  },
  orderNumber: {
    color: '#00f0ff',
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  mainTitle: {
    color: '#fff',
    fontSize: '32px',
    margin: '6px 0',
    fontWeight: 'normal',
    letterSpacing: '-0.5px',
  },
  dateStamp: {
    color: '#8f98a0',
    fontSize: '13px',
  },
  
  /* NEW FLASHY SHOWCARD STYLE MATRIX */
  flashyProductCard: {
    display: 'flex',
    gap: '24px',
    background: 'linear-gradient(135deg, #162432 0%, #0d1622 100%)',
    padding: '20px',
    borderRadius: '8px',
    // Neon electric accent line with a clean shadow drop drop
    border: '1px solid #00f0ff',
    boxShadow: '0 0 15px rgba(0, 240, 255, 0.25), inset 0 0 20px rgba(0, 240, 255, 0.05)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  productThumb: {
    width: '200px',
    height: '115px',
    borderRadius: '4px',
    backgroundColor: '#000',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  imgFluid: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productDetails: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  productTitle: {
    color: '#fff',
    fontSize: '22px',
    fontWeight: 800,
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
    letterSpacing: '0.5px',
  },
  studioMeta: {
    fontSize: '13px',
    color: '#8f98a0',
    marginTop: '6px',
  },
  specMeta: {
    fontSize: '13px',
    color: '#b8b6b4',
    marginTop: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  ratingBadge: {
    color: '#00f0ff',
    fontWeight: 'bold',
  },
  priceTag: {
    fontSize: '18px',
    color: '#fff',
    fontWeight: 'bold',
    marginTop: '12px',
  },
  totalBlock: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '20px',
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  totalLabel: {
    color: '#8f98a0',
    fontSize: '16px',
  },
  totalPrice: {
    color: '#00f0ff',
    fontSize: '26px',
    fontWeight: 'bold',
    textShadow: '0 0 10px rgba(0, 240, 255, 0.4)',
  },
};

// --- EXPLICIT STABLE DEFAULT EXPORT ---
export default Orders;