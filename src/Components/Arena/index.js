import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from "../../Components/LoadingIndicator";
import toast from 'react-hot-toast';


const Arena = ({ characterNFT, setCharacterNFT, currentAccount }) => {

  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [owners, setOwners] = useState('');
  const [tokenIds, setTokenIds] = useState('');
  const [characters, setCharacters] = useState([]);

  // UseEffects
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  useEffect(() => {
    const fetchOwners = async () => {
      const ownerArray = await gameContract.getOwners()
      const owners = ownerArray[0]
      const tokenArray = ownerArray[1]

      const tokenIds = tokenArray.map((element) => {
        return element.toString();
      })
      setOwners(owners)
      setTokenIds(tokenIds)

      const charactersTxn = await gameContract.getAllDefaultCharacters();
      const characters = charactersTxn.map((characterData) =>
        transformCharacterData(characterData)
      );
      setCharacters(characters);
    }

    if (gameContract) {
      fetchOwners()
    }
  }, [gameContract])

  useEffect(() => {
    
    const fetchBoss = async () => {
        const bossTxn = await gameContract.getBigBoss();
        console.log('Boss:', bossTxn);
        setBoss(transformCharacterData(bossTxn));
    };

    const onAttackComplete = (from, newBossHp, newPlayerHp) => {
        const bossHp = newBossHp.toNumber();
        const playerHp = newPlayerHp.toNumber();
        const sender = from.toString();

        console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);
    
        if (currentAccount === sender.toLowerCase()) {
            setBoss((prevState) => {
                return { ...prevState, hp: bossHp };
            });
            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp };
            });
        } else {
            setBoss((prevState) => {
                return { ...prevState, hp: bossHp };
            });
        }
    }
    if (gameContract) {
        fetchBoss();
        gameContract.on('AttackComplete', onAttackComplete);
    }
    return () => {
        if (gameContract) {
            gameContract.off('AttackComplete', onAttackComplete);
        }
    }
  }, [gameContract])
      

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        await gameContract.requestRandomWords();
        const criticalNum = await gameContract.s_randomnum();

        let critical;
        if (5 === criticalNum.toNumber()) {
          critical = true;
        } else {
          critical = false;
        }

        console.log('Attacking boss...');
        const attackTxn = await gameContract.attackBoss(critical);
        await attackTxn.wait();
        console.log('attackTxn:', attackTxn);

        if (critical) {
          toast('Critical hit, whadda Ninja!', {
            icon: '🥷',
          });          
        } else {
          toast('Good hit, Keep em coming!', {
            icon: '👊',
          });           
        }

        setAttackState('hit');
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
      setAttackState('');
    }
  };


  return (
    <div className="arena-container">
      {/* Boss */}
      {boss && (
    <div className="boss-container">
      <div className={`boss-content  ${attackState}`}>
        <h2>🔥 {boss.name} 🔥</h2>
        <div className="image-content">
          <img
            src={`https://ipfs.io/ipfs/${boss.imageURI}`}
            alt={`Boss ${boss.name}`} />
          <div className="health-bar">
            <progress value={boss.hp} max={boss.maxHp} />
            <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
          </div>
        </div>
      </div>
      <div className="attack-container">
        <button className="cta-button" onClick={runAttackAction}>
          {`💥 Attack ${boss.name}`}
        </button>
      </div>
      {/* Add this right under your attack button */}
      {attackState === 'attacking' && (
        <div className="loading-indicator">
          <LoadingIndicator />
          <p>Attacking ⚔️</p>
        </div>
      )}
    </div>

      )}
  
      {characterNFT && (
        <div className="players-container">
          <div className="player-container">
            <h2>Your Character</h2>
            <div className="player">
              <div className="image-content">
                <h2>{characterNFT.name}</h2>
                <img
                  src={`https://ipfs.io/ipfs/${characterNFT.imageURI}`}
                  alt={`Character ${characterNFT.name}`}
                />
                <div className="health-bar">
                  <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                  <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                </div>
              </div>
              <div className="stats">
                <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="players-container">
        <div className="player-container">
          <h2>Other Players</h2>
          {owners && currentAccount && characters && owners.map((owner, index) => {
                        
            if (owner.toLowerCase() === currentAccount.toLowerCase()) {
              return(<></>)
            }
            else {
            let temp = tokenIds[index]
            return(
              <div className="player">
                <div className="image-content">
                  <p>{owner}</p>
                  <img src={`https://ipfs.io/ipfs/${characters[temp]?.imageURI}`} alt={'img'}/>
                  </div>
                </div>
            )
          }})}
        </div>
      </div>
    </div>
  );
  

};

export default Arena;
