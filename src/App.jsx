import { useEffect, useState } from 'react';
import './App.css'
import { ethers } from "ethers";
import abi from "./utils/SendLove.json"

function App() {
  const [currentAccount, setCurrentAccount] = useState("");

  const [allHearts, setAllHearts] = useState([])
  // console.log(allHearts)
  // state variable for message
  const [message, setMessage] = useState("")
  const contractAddress = "0xc27A027d725c20FbbB8c9aB2b5f38e0AA73A5A6A"

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
        setAllHearts(heartsCleaned) // this is the part that causes render loop
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
    getAllHearts() // remove this because this changes the state
    // console.log(allHearts)
    // setMessage("")
  }, [allHearts])
  return (


    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there! I'm James.
        </div>

        <div className="bio">
          I'm currently learning about blockchain development. Show me some love by connecting your Ethereum wallet and sending me a sweet message!
        </div>

        {currentAccount && (<form>
          <textarea
            placeholder="Say something sweet"
            onChange={handleChange}
            name="message"
            value={message} 
            cols="50" 
            rows="10" 
          />
        </form>)}

        {currentAccount && (<button className="loveButton" onClick={heart}>
          ❤️ Send me some love
        </button>)}

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="loveButton" onClick={connectWallet}>
            <img src="https://fellaz.xyz/img/icon-sign-metamask.ecf6606d.svg" alt="MetaMask Icon" />Connect Wallet
          </button>
        )}

        <div className='messages'>
          {allHearts.map((heart, index) => {
            return (
              <div key={index} className="message">
                <div className='message--sender'>Sender: <a href={`https://goerli.etherscan.io/address/${heart.address}`}>{heart.address}</a></div>
                <div className='message--time'>Time: <span>{heart.timestamp.toString()}</span></div>
                <div className='message--text'>Message: <span>{heart.message}</span></div>
              </div>
            )
          })}
        </div>

        

      </div>
    </div>
  )
}

export default App
