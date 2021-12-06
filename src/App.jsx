import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/Web3Guestbook.json';

const App = () => {
    const [currentAccount, setCurrentAccount] = useState("");
    const [waves, setWaves] = useState(0);
    const [loading, setLoading] = useState(false);

    const contractAddress = "0x30710ef7e2369F8332Fb7600b4F2b3C16daBC72F";
    const contractABI = abi.abi;

    /**
    * Get guestbook contract
    */
    const getContract = () => {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        return contract;
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

        } catch (error) {
            console.log(error)
        }
    }

    /**
    * Get waves
    */
    const getWaves = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const contract = getContract();
                let count = await contract.getTotalWaves();
                setWaves(count.toNumber());
                setLoading(false);
            }
            else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error)
        }
    }

    /**
    * Wave
    */
    const wave = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const contract = getContract();
                setLoading(true);
                const waveTxn = await contract.wave();
                console.log("Mining...", waveTxn.hash);

                await waveTxn.wait();
                console.log("Mined -- ", waveTxn.hash);

                getWaves();
                
            } else {
                console.log("Ethereum object doesn't exist!");
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getWaves();
        checkIfWalletIsConnected();
    }, [])

    return (
        <div className="main-container">
            <div className="header-container">
                <div className="logo">
                    <img src="https://brandongray.dev/img/misc/logo.png" alt="logo" />brandongray.dev
                </div>
                <div className="header">
                    📖 Web3 Guestbook
                </div>
            </div>

            <div className="data-container">
                <div className="intro">
                    <p>
                        Welcome to my guestbook, powered by the Ethereum blockchain! Built using Hardhat and Solidity, this guestbook was developed to familiarize myself with Web3 technologies. Connect your  wallet, and sign using a gasless meta-transaction!
                    </p>
                </div>

                {!currentAccount && (
                    <button className="button" onClick={connectWallet}>
                        Connect Wallet
                    </button>
                )}

                <p className="center">Visitors have waved <strong>{waves}</strong> times!</p>

                <button className="button" onClick={wave} disabled={loading}>
                    {loading ? "Sending wave..." : "Send a wave!"}
                </button>

            </div>

            <div className="footer-container">
                Made with ❤️ by <a href="https://brandongray.dev" target="_blank">Brandon Gray</a>.
            </div>

            <ul className="circles">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    );
}

export default App;