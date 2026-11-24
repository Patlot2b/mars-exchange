import { useState } from 'react'
import { createPublicClient, http, createWalletClient, custom, parseUnits, formatUnits } from 'viem'
import './index.css'

const CHAIN_ID = 91342
const RPC = 'https://sepolia-rpc.giwa.io'
// GANTI alamat ini pake token GIWA Sepolia yang beneran ada pool-nya!
// Jangan pake alamat ngarang, cek di sepolia-explorer.giwa.io
const TOKENS = [
  { symbol: 'WETH', name: 'Wrapped ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
  { symbol: 'MARS', name: 'Mars Coin', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
]

const publicClient = createPublicClient({ chain: { id: CHAIN_ID, name: 'GIWA Sepolia', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } }, transport: http(RPC) })

export default function App() {
  const [wallet, setWallet] = useState(null)
  const [from, setFrom] = useState(TOKENS[0])
  const [to, setTo] = useState(TOKENS[1])
  const [amount, setAmount] = useState('0.001')
  const [quote, setQuote] = useState(null)
  const [status, setStatus] = useState('Connect wallet to GIWA Sepolia (91342) to get real Ammora quote')
  const [loading, setLoading] = useState(false)

  async function connectWallet() {
    if (!window.ethereum) return alert('Install MetaMask!')
    const [acc] = await window.ethereum.request({ method: 'eth_requestAccounts' })
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x16456' }] }) // 91342
    } catch {
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [{ chainId: '0x16456', chainName: 'GIWA Sepolia', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: [RPC], blockExplorerUrls: ['https://sepolia-explorer.giwa.io'] }] })
    }
    setWallet(acc)
    setStatus('Wallet connected to GIWA Sepolia ✅')
  }

  async function getQuote() {
    if (!wallet) return alert('Connect Wallet dulu!')
    if (from.address.startsWith('0x0000')) return alert('Isi dulu alamat token WETH & MARS yang beneran di kode! Jangan pake 0x000... itu placeholder.')
    setLoading(true)
    try {
      const { AmmoraRouteClient } = await import('@ammora-protocol/sdk')
      const ammora = await AmmoraRouteClient.create({ chainId: CHAIN_ID })
      const q = await ammora.quoteExactIn({
        tokenIn: from.address,
        tokenOut: to.address,
        amountIn: parseUnits(amount || '0', from.decimals),
        from: wallet,
      })
      setQuote(q)
      setStatus('Real quote from Ammora ✅ : ' + JSON.stringify(q).slice(0, 200))
    } catch (e) {
      console.error(e)
      setStatus('Quote failed: ' + e.message + ' — cek pool-nya ada atau nggak di GIWA Sepolia')
    }
    setLoading(false)
  }

  async function doSwap() {
    if (!quote) return alert('Get Quote dulu!')
    // Ammora SDK: SDK yang plan, wallet yang sign.
    // quote dari AmmoraRouteClient berisi tx {to, data, value} — kirim lewat wallet:
    const tx = quote.tx || quote.transaction || quote.calldata
    if (!tx) return alert('Quote ini tidak bawa tx. Buka docs.ammora.org/examples -> pilih contoh swap ALMM/ARL yang sesuai pool kamu, dan pake tx dari contoh itu.')
    try {
      const walletClient = createWalletClient({ chain: { id: CHAIN_ID, name: 'GIWA Sepolia', nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }, rpcUrls: { default: { http: [RPC] } } }, transport: custom(window.ethereum) })
      const hash = await walletClient.sendTransaction({ account: wallet, to: tx.to, data: tx.data, value: BigInt(tx.value || 0) })
      setStatus('Swap sent! Hash: ' + hash)
      alert('Swap terkirim! Cek di sepolia-explorer.giwa.io/tx/' + hash)
    } catch (e) { alert('Swap gagal: ' + e.message) }
  }

  function flip() { setFrom(to); setTo(from); setQuote(null) }

  return (
    <div style={{ background: '#0a0a0f', color: 'white', minHeight: '100vh', padding: 20, fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: 520, margin: '0 auto' }}>
        <h2>🚀 MARS<span style={{ color: '#ff4d6d' }}>DEX</span> <span style={{ fontSize: 12, color: '#888' }}>x Ammora SDK 0.3.9 • GIWA 91342</span></h2>
        <button onClick={connectWallet} style={{ background: wallet ? '#22c55e' : '#ff4d6d', color: 'white', border: 'none', padding: '10px 16px', borderRadius: 20, fontWeight: 'bold' }}>{wallet ? '✅ ' + wallet.slice(0, 6) + '...' : 'Connect Wallet'}</button>
      </div>

      <div style={{ background: '#15151f', border: '1px solid #2a2a3a', borderRadius: 20, padding: 16, maxWidth: 520, margin: '20px auto' }}>
        <p style={{ color: '#888', fontSize: 12 }}>You Pay</p>
        <div style={{ background: '#0d0d14', borderRadius: 16, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <input value={amount} onChange={e => setAmount(e.target.value)} style={{ background: 'none', border: 'none', color: 'white', fontSize: 28, width: '60%', outline: 'none' }} />
            <select value={from.symbol} onChange={e => setFrom(TOKENS.find(t => t.symbol === e.target.value))} style={{ background: '#222', color: 'white', border: 'none', borderRadius: 20, padding: 8 }}>{TOKENS.map(t => <option key={t.symbol}>{t.symbol}</option>)}</select>
          </div>
          <p style={{ color: '#888', fontSize: 11 }}>{from.address.slice(0, 10)}... • {from.decimals} decimals</p>
        </div>

        <div style={{ textAlign: 'center' }}><button onClick={flip} style={{ background: '#ff4d6d', border: 'none', color: 'white', width: 40, height: 40, borderRadius: '50%', margin: '8px 0', cursor: 'pointer' }}>↓↑</button></div>

        <p style={{ color: '#888', fontSize: 12 }}>You Receive (Real Ammora Quote)</p>
        <div style={{ background: '#0d0d14', borderRadius: 16, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 24 }}>{quote ? JSON.stringify(quote).slice(0, 60) + '...' : '—'}</span>
            <select value={to.symbol} onChange={e => setTo(TOKENS.find(t => t.symbol === e.target.value))} style={{ background: '#222', color: 'white', border: 'none', borderRadius: 20, padding: 8 }}>{TOKENS.map(t => <option key={t.symbol}>{t.symbol}</option>)}</select>
          </div>
        </div>

        <button onClick={getQuote} style={{ width: '100%', background: '#333', color: 'white', border: 'none', padding: 14, borderRadius: 14, marginTop: 12, fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Getting Quote...' : 'GET REAL QUOTE'}</button>
        <button onClick={doSwap} style={{ width: '100%', background: wallet ? '#ff4d6d' : '#222', color: 'white', border: 'none', padding: 14, borderRadius: 14, marginTop: 8, fontWeight: 'bold', cursor: 'pointer' }}>SWAP ON GIWA</button>
        <p style={{ color: '#f59e0b', fontSize: 12, marginTop: 12 }}>{status}</p>
      </div>
      <p style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>MARS DEX • Ammora SDK 0.3.9 • GIWA Sepolia Testnet • Faucet ETH di GIWA dulu sebelum swap</p>
    </div>
  )
}
