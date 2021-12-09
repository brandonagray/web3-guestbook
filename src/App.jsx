import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button, Form, Spinner } from 'react-bootstrap';
import Particles from 'react-tsparticles';
import { ethers } from "ethers";
import './App.css';
import abi from './utils/Web3Guestbook.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const contractAddress = "0x82648521f2bFBcBFc0C160594d273Ac02744FcA2";
  const contractABI = abi.abi;

  const inputRef = useRef(undefined);

  /**
  * Get guestbook contract
  */
  const getContract = () => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      return contract;
    }
    else {
      console.log("Ethereum object doesn't exist!");
    }
  }

  /**
  * Check if wallet is connected
  */
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Please install MetaMask and try again!");
        return;
      } else {
        console.log("Ethereum object found:", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found.")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Connect wallet
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask and try again!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      getWaves();
    } catch (error) {
      console.log(error)
    }
  }

  /**
  * Get waves
  */
  const getWaves = async () => {
    try {
      const contract = getContract();
      const waves = await contract.getAllWaves();

      /*
       * Pick out address, timestamp and message
       */
      let wavesCleaned = [];
      waves.forEach(wave => {
        wavesCleaned.push({
          address: wave.waver,
          timestamp: new Date(wave.timestamp * 1000),
          message: wave.message
        });
      });

      /*
       * Store data in state
       */
      setAllWaves(wavesCleaned);
      setLoading(false);
    } catch (error) {
      console.log(error)
    }
  }

  /**
  * Wave
  */
  const wave = async () => {
    try {
      const contract = getContract();

      setLoading(true);
      const waveTxn = await contract.wave(inputRef.current.value, { gasLimit: 300000 });
      console.log("Mining...", waveTxn.hash);

      await waveTxn.wait();
      console.log("Mined -- ", waveTxn.hash);

      getWaves();
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }

  const particlesInit = (main) => {
    // Do something...
  };

  const particlesLoaded = (container) => {
    // Do something...
  };

  const SubmitButton = () => {
    return (
      <Button className="center" onClick={wave} disabled={isLoading} variant="flat">
        {isLoading ?
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          : "Sign guestbook"}
      </Button>
    );
  };

  const MessageArea = () => {
    const [message, setMessage] = useState();
    const onChangeInput = useCallback(
      (e) => {
        setMessage(e.target.value);
      },
      [message]
    );
    return (
      <Form>
        <Form.Group className="mb-3" controlId="message">
          <Form.Label>Your message</Form.Label>
          <Form.Control as="textarea" rows={5} value={message} onChange={onChangeInput} ref={inputRef} />
        </Form.Group>
      </Form>
    );
  }

  useEffect(() => {
    checkIfWalletIsConnected();
    getWaves();
  }, []);

  /**
   * Listen for emitter events
   */
  useEffect(() => {
    let guestbookContract;

    const onNewWave = (from, timestamp, message) => {
      console.log('New wave', from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      guestbookContract = new ethers.Contract(contractAddress, contractABI, signer);
      guestbookContract.on('NewWave', onNewWave);
    }

    return () => {
      if (guestbookContract) {
        guestbookContract.off('NewWave', onNewWave);
      }
    };
  }, []);

  return (
    <div>
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "#F7FAFC",
            },
          },
          fpsLimit: 60,
          interactivity: {
            events: {
              onClick: {
                enable: false,
                mode: "push",
              },
              onHover: {
                enable: true,
                mode: "grab",
              },
              resize: true,
            },
            modes: {
              bubble: {
                distance: 400,
                duration: 2,
                opacity: 0.8,
                size: 40,
              },
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#85CEE8",
            },
            links: {
              color: "#85CEE8",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: false,
            },
            move: {
              direction: "none",
              enable: true,
              outMode: "out",
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                value_area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              random: true,
              value: 5,
            },
          },
          detectRetina: true,
        }}
      />

      <div className="main-container">
        <div className="header-container">
          <div className="logo">
            <img src="src/images/logo.png" />
          </div>
          <div className="header">
            📖 <span>Web3 Guestbook</span>
          </div>
        </div>

        <div className="data-container">
          <div className="intro">
            <p>
              Welcome to my guestbook, powered by the Ethereum blockchain! Built using Hardhat and Solidity.</p><p>Connect your wallet and sign!</p>
          </div>

          {!currentAccount && (
            <Button className="center" variant={"flat"} onClick={connectWallet}>
              Connect Wallet
            </Button>
          )}

          {currentAccount && (
            <>
              <MessageArea />
              <SubmitButton />

              <div className="wave-container">
                <p className="center">
                  Visitors have waved <strong>{allWaves ? allWaves.length : 0}</strong> times!
                </p>

                {allWaves.map((wave, index) => {
                  return (
                    <div key={index} style={{ backgroundColor: "#FFFFFF", marginTop: "16px", padding: "1rem", boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px" }}>
                      <p><strong>Address:</strong> {wave.address}</p>
                      <p><strong>Time:</strong> {wave.timestamp.toString()}</p>
                      <p><strong>Message:</strong> {wave.message}</p>
                    </div>)
                })}
              </div>
            </>
          )}
        </div>

        <div className="footer-container">
          Made with ❤️ by <a href="https://etherscan.io/address/0xe790e9ddbc54e7b15c006d2f5dbf0654d38e6071" target="_blank" >bgray.eth
          </a>.
        </div>
      </div>
    </div>
  );
}

export default App;