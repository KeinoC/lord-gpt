import React, {useState, useEffect } from 'react';
import GridToolbar from './GridToolbar';
import './grid.css'

import { db } from '@/app/components/ChatWindow/firebase';
import { limit } from "firebase/firestore";
import { formatShortDateAndTime } from "@/app/utils/helpers/timestamp";


import {
    collection,
    addDoc,
    where,
    serverTimestamp,
    onSnapshot,
    query,
    orderBy,
    updateDoc,
    doc
} from "firebase/firestore";


const Grid = (selectedAdventure) => {
  const [gridWidth, setGridWidth] = useState(15);
  const [gridHeight, setGridHeight] = useState(15);
  const [mapImage, setMapImage] = useState("https://i.imgur.com/ppIn5BV.jpg");
  const adventureId = selectedAdventure.selectedAdventure.id
  const [selectedToken, setSelectedToken] = useState("")
  const [tokens, setTokens] = useState(selectedAdventure.selectedAdventure?.tokens)

  const adventuresRef = collection(db, "adventures");

  useEffect(() => {
    const queryMessages = query(adventuresRef, where("name", "==", selectedAdventure.selectedAdventure.name));
    const unsubscribe = onSnapshot(queryMessages, (snapshot) => {
        snapshot.forEach((doc) => {
            setTokens(doc.data()["tokens"])
        });
    });

    return () => unsubscribe();
  });


  const updateTokensField = async (updatedTokens) => {
    if (selectedAdventure.selectedAdventure.name != undefined) {
        const docRef = doc(db, "adventures", String(selectedAdventure.selectedAdventure.id));
    
        try {
        await updateDoc(docRef, {
            tokens: updatedTokens
        });
        console.log('token successfully updated!');
        } catch (error) {
        console.error('Error updating token: ', error);
        }
    }
  };

  // Character Token Functions
  const getPlayersAtPosition = (x,y, players) => {
    const isPlayerHere =  players?.filter(player => player.position?.x === x && player.position?.y === y )
    return isPlayerHere
  }

  const handleDragStart = (event, x, y) => {
    event.dataTransfer.setData('text/plain', JSON.stringify({ x, y }));
    event.target.position({x, y})
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event, x, y) => {
    event.preventDefault();

    if (selectedToken) {
      const updatedTokens = tokens.map(token => {
        if (token.id === selectedToken.id) {
          return {
            ...token,
            position: { x: x, y: y }
          };
        }
        return token;
      });

      setTokens(updatedTokens);
      setSelectedToken(updatedTokens.find(token => token.id === selectedToken.id));
      updateTokensField(updatedTokens)
    }
  };


  // Dynamic Grid Style Function
  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridWidth}, 1fr)`,
    display: 'relative'
  };

  // Grid Tiles
  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const playersHere = getPlayersAtPosition(x, y, tokens)

        grid.push(
          // Grid Tiles
          <div 
            key={`${x}-${y}`}
            className={` w-10 h-10 flex items-center justify-center z-20 relative
            ${playersHere && 'grabbable draggable'}`} 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, x, y)}
            >

              {/* Player Token Styles and Drag */}
              {playersHere && playersHere.map((tokensObj) => {
                return (
                  <img 
                    key={tokensObj.id} 
                    onDragStart={() => setSelectedToken(tokensObj)}
                    id={tokensObj.id} src={tokensObj.img} name={tokensObj.user} position={tokensObj.position} className="grabbable draggable absolute z-30"
                    />)}
                )
              }

              {/* Grid Lines + Drop */}
              {!playersHere.length && (
                <div
                  className="w-10 h-10 opacity-25 border-white border-[1px] absolute"
                  onDragStart={(e) => handleDragStart(e, x, y)}
                ></div>
              )}
              
          </div>
        );
      }
    }
    return grid;
  };

  return (
    // Grid Box
    <div className="flex flex-col items-center p-4 pb-8">
      {/* Grid */}
      <div className='grid relative overflow-hidden' style={gridContainerStyle}>
        
        {/* Map Image */}
        <img src={mapImage} className="absolute top-0 left-0 z-10"/>

        {/* Grid Tiles - See Above */}
        {renderGrid()}
      </div>

      <GridToolbar 
        gridWidth={gridWidth} setGridWidth={setGridWidth} 
        gridHeight={gridHeight} setGridHeight={setGridHeight} 
        mapImage={mapImage} setMapImage={setMapImage}
        tokens={tokens} setTokens={setTokens}
        selectedAdventure={selectedAdventure} />

    </div>
  );
};

export default Grid;