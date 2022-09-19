import { useEffect, useState } from 'react';
import './App.css'
import { ethers } from "ethers";
import abi from "./utils/SendLove.json"

function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  const [allHearts, setAllHearts] = useState([])
  // state variable for message
  const [message, setMessage] = useState("")
  const contractAddress = "0xCae8513A029C8d5CBb495273a6B1EF4eCEEDa972"

  const contractABI = abi.abi;

  const checkWalletIsConnected = async () => {
    
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        getAllHearts()
        console.log("We have the ethereum object", ethereum);
      }


      const accounts = await ethereum.request({ method: "eth_accounts" });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
    
    
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0])
    } catch (error) {
      console.log(error)
    }
  }

  const heart = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const sendLoveContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await sendLoveContract.getTotalHearts();
        console.log("Retrieved total heart count...", count.toNumber());

        const loveTxn = await sendLoveContract.sendLove(message)
        console.log("Mining...", loveTxn.hash)

        await loveTxn.wait();
        console.log("Mined -- ", loveTxn.hash)
        setMessage("")
        count = await sendLoveContract.getTotalHearts();
        console.log("Retrieved total heart count...", count.toNumber())

        // reset textarea
        // setMessage("")

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  // method that gets all hearts from contract
  const getAllHearts = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const sendLoveContract = new ethers.Contract(contractAddress, contractABI, signer);

        const hearts = await sendLoveContract.getAllHearts()

        let heartsCleaned = [];
        hearts.forEach(heart => {
          heartsCleaned.push({
            address: heart.loveSender,
            timestamp: new Date(heart.timestamp * 1000),
            message: heart.message
          })
        })
        setAllHearts(heartsCleaned)
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleChange = (event) => {
    setMessage(event.target.value)
    // console.log(message)
  }

  useEffect(() => {
    checkWalletIsConnected();
    
  }, [])

  // useEffect(() => {
  //   console.log(message)
  // }, [message])

  useEffect(() => {
    getAllHearts()
    // console.log("hello")
    // setMessage("")
  }, [allHearts])
  
  return (


    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          I am James. Show me some love by connecting your Ethereum wallet and sending me a sweet message and a heart!
        </div>

        <form>
          <textarea
            placeholder="Say something sweet"
            onChange={handleChange}
            name="message"
            value={message} 
            cols="30" 
            rows="10" 
          />
        </form>

        <button className="heartButton" onClick={heart}>
          Send me some love
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allHearts.map((heart, index) => {
          return (
            <div key={index}>
              <div>Address: {heart.address}</div>
              <div>Time: {heart.timestamp.toString()}</div>
              <div>Message: {heart.message}</div>
            </div>
          )
        })}

      </div>
    </div>
  )
}

export default App
