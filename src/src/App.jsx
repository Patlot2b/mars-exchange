import { useState } from 'react'

export default function App() {
  const [balance, setBalance] = useState(12500)
  const [amount, setAmount] = useState('')

  const coins = [
    { name: 'Bitcoin', symbol: 'BTC', price: 97432, change: '+2.4%' },
    { name: 'Ethereum', symbol: 'ETH', price: 3421, change: '+1.8%' },
    { name: 'Solana', symbol: 'SOL', price: 214, change: '-0.9%' },
    { name: 'Mars Coin', symbol: 'MARS', price: 1.24, change: '+12.5%' },
  ]

  return (
    <div style={{ background: '#0a0a0f', color: 'white', minHeight: '100vh', padding: 20, fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#ff4d2e' }}>🔴 MARS EXCHANGE</h1>
      <p>Saldo: <b>${balance.toLocaleString()}</b></p>

      <h2>Market</h2>
      {coins.map(c => (
        <div key={c.symbol} style={{ background: '#1a1a22', padding: 15, borderRadius: 12, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
          <div><b>{c.name}</b><br/><small>{c.symbol}</small></div>
          <div style={{ textAlign: 'right' }}><b>${c.price.toLocaleString()}</b><br/><span style={{ color: c.change.startsWith('+') ? '#22c55e' : '#ef4444' }}>{c.change}</span></div>
        </div>
      ))}

      <h2>Buy / Sell</h2>
      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Jumlah USD" type="number" style={{ padding: 12, width: '100%', borderRadius: 10, border: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => setBalance(balance + Number(amount || 0))} style={{ flex: 1, padding: 14, background: '#22c55e', border: 'none', borderRadius: 10, color: 'white', fontWeight: 'bold' }}>BUY</button>
        <button onClick={() => setBalance(balance - Number(amount || 0))} style={{ flex: 1, padding: 14, background: '#ef4444', border: 'none', borderRadius: 10, color: 'white', fontWeight: 'bold' }}>SELL</button>
      </div>
      <p style={{ color: '#888', fontSize: 12, marginTop: 20 }}>Demo MARS EXCHANGE - by Patlot2b</p>
    </div>
  )
}
