import React from 'react';
import { ComponentParams, ComponentRendering } from '@sitecore-jss/sitecore-jss-nextjs';

import GameDetails from '../GameDetails/GameDetails';
import UserProfile from '../UserProfile/UserProfile';

interface GameDashboardContainerProps {
  rendering: ComponentRendering;
  params: ComponentParams;
  fields?: any;
}

const GameDashboardContainer = ({ fields, params, rendering }: GameDashboardContainerProps): React.JSX.Element => {
  
  // 1. Safely extract all array results returned by the GraphQL query data pool
  const rawResults = 
    fields?.data?.item?.children?.results || 
    fields?.item?.children?.results ||
    fields?.items || 
    [];

  // 2. Locate the real game entry by explicitly ignoring items with user fields
  const actualGameItem = rawResults.find((node: any) => {
    if (!node) return false;
    // Skip nodes that possess user profile field definitions
    if (node.Username || node.Email || node.Role || node.Saved_Payment_Methods) return false;
    if (node.name?.toLowerCase().includes('survivor') || node.name?.toLowerCase().includes('buyer')) return false;
    return true;
  }) || rawResults[0]; // Fallback to the first array node if structure varies

  // 3. Overwrite the fields payload so GameDetails receives an array containing ONLY that one game
  const strippedGameFields = {
    ...fields,
    data: {
      ...fields?.data,
      item: {
        ...fields?.data?.item,
        children: {
          ...fields?.data?.item?.children,
          results: actualGameItem ? [actualGameItem] : [] // Forces the length to exactly 1
        }
      }
    }
  };

  return (
    <div className="game-dashboard-wrapper" style={{ 
      background: '#1b2838', 
      minHeight: '85vh', 
      padding: '40px 20px',
      fontFamily: '"Motiva Sans", Sans-serif, Arial, Helvetica',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        display: 'grid', 
        gridTemplateColumns: '1fr 360px', 
        gap: '32px', 
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {/* LEFT COLUMN: Main Game Card (Receives exactly one game entry, preventing any extra loops or fallbacks) */}
        <div style={{ minWidth: '0', width: '100%' }}>
          <GameDetails fields={strippedGameFields} params={params} rendering={rendering} />
        </div>

        {/* RIGHT COLUMN: User Profile Card (Receives raw fields to find its matching profile user item) */}
        <div style={{ width: '360px' }}>
          <UserProfile fields={fields} params={params} rendering={rendering} />
        </div>

      </div>
    </div>
  );
};

export default GameDashboardContainer;