import { useState } from 'react'
import './index.css'

export default function App() {
  const [wallet, setWallet] = useState(null)
  const [balance, setBalance] = useState(12501)
  const [coins, setCoins] = useState([
    { name: 'Bitcoin', symbol: 'BTC', price: 97432, change: 2.4, amount: 0.05 },
    { name: 'Ethereum', symbol: 'ETH', price: 3421, change: 1.8, amount: 1.2 },
    { name: 'Solana', symbol: 'SOL', price: 214, change: -0.9, amount: 5 },
    { name: 'Mars Coin', symbol: 'MARS', price: 12.45, change: 15.2, amount: 100 },
  ])

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        setWallet(accounts[0])
      } catch (e) { alert('Failed to connect wallet') }
    } else {
      const demo = '0x' + Math.random().toString(16).slice(2, 10) + '...Mars'
      setWallet(demo)
      alert('MetaMask not detected, using Demo Wallet for now! Install MetaMask to connect a real wallet.')
    }
  }

  function buy(coin) {
    if (balance < coin.price) return alert('Insufficient balance!')
    setBalance(s => s - coin.price)
    setCoins(cs => cs.map(c => c.symbol === coin.symbol ? {...c, amount: c.amount + 1} : c))
  }
  function sell(coin) {
    if (coin.amount < 1) return alert('Not enough coins!')
    setBalance(s => s + coin.price)
    setCoins(cs => cs.map(c => c.symbol === coin.symbol ? {...c, amount: c.amount - 1} : c))
  }

  return (
    <div style={{ background: '#0a0a0f', color: 'white', minHeight: '100vh', padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🚀 MARS EXCHANGE</h1>
        <button onClick={connectWallet} style={{ background: wallet ? '#22c55e' : '#f59e0b', color: 'black', border: 'none', padding: '12px 20px', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>
          {wallet ? '✅ ' + wallet.slice(0, 6) + '...' + wallet.slice(-4) : '🔗 Connect Wallet'}
        </button>
      </div>

      <div style={{ background: '#1a1a2e', padding: 20, borderRadius: 15, marginTop: 20 }}>
        <p>Your Balance {wallet ? '(Wallet Connected)' : '(Not Connected)'}</p>
        <h2 style={{ fontSize: 36, color: '#4ade80' }}>${balance.toLocaleString()}</h2>
        {wallet && <p style={{ fontSize: 12, color: '#aaa' }}>{wallet}</p>}
      </div>

      <h2 style={{ marginTop: 30 }}>Market</h2>
      {coins.map(c => (
        <div key={c.symbol} style={{ background: '#1a1a2e', padding: 15, borderRadius: 12, marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><b>{c.name} ({c.symbol})</b><br/><span style={{ color: '#aaa' }}>Holdings: {c.amount} {c.symbol}</span></div>
          <div style={{ textAlign: 'right' }}><b>${c.price.toLocaleString()}</b><br/><span style={{ color: c.change >= 0 ? '#4ade80' : '#f87171' }}>{c.change}%</span></div>
          <div><button onClick={() => buy(c)} style={{ background: '#22c55e', border: 'none', padding: '8px 15px', borderRadius: 8, marginRight: 5, fontWeight: 'bold' }}>BUY</button><button onClick={() => sell(c)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: 8, fontWeight: 'bold' }}>SELL</button></div>
        </div>
      ))}
      {!wallet && <p style={{ marginTop: 20, textAlign: 'center', color: '#f59e0b' }}>👆 Connect your Wallet above to start trading!</p>}
    </div>
  )
}
