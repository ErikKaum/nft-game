import React, { useEffect, useState } from 'react';
import SelectCharacter from './Components/SelectCharacter';
import myEpicGame from './utils/MyEpicGame.json';
import './App.css';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';
import { Toaster } from 'react-hot-toast';


const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkNetwork = async () => {
    try { 
      if (window.ethereum.networkVersion !== '4') {
        alert("Please connect to Rinkeby!")
      }
    } catch(error) {
      console.log(error)
    }
  }  

  const connectWallet = async () => {
    try{
      const { ethereum } = window
      
      if (!ethereum) {
        alert('No metamask')
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
      checkNetwork();
    }
    catch(error) {
      console.log(error)
    }
  }

  const rendering = () => {

    if (isLoading) {
      return <LoadingIndicator />;
    }
  
   if (!currentAccount) {
     return(
      <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
      >
        Connect Wallet
      </button>
     )
   } else if (currentAccount && characterNFT === null) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
   }
    else if (currentAccount && characterNFT !== null) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} currentAccount={currentAccount}/>
    }
  }

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);
  
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
      const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log('No character NFT found');
      }
      setIsLoading(false);
    };
  
    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }  
  }, [currentAccount])
 
  return (
    <div className="App">
      <Toaster/>
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Metaverse Adventure</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          <div className="connect-wallet-container">
            <img
              src="https://i.giphy.com/media/VGG8UY1nEl66Y/giphy.webp"
              alt="going on an adventure"
            />
          </div>
          {rendering()}
        </div>
        <div className="footer-container">
        </div>
      </div>
    </div>
  );
};

export default App;
