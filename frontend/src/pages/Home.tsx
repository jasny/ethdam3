import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Link } from "react-router-dom"
import backgroundImage from '../assets/hero-bg.jpg';
import oasisLogo from '../assets/oasis.png';
import ethdamLogo from '../assets/ethdam.png';

export default function Home() {
  return (
    <div className="flex flex-column">

      {/* HERO SECTION */}
      <div
        className="flex flex-column align-items-center justify-content-center text-center"
        style={{
          minHeight: '100vh',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          color: '#ffffff',
          padding: '4rem 2rem'
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Testament
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '700px', marginBottom: '2rem' }}>
          Secure your crypto legacy. Peace of mind for you and your loved ones.
        </p>
        <Link to="/create">
          <Button
            label="Get Started"
            icon="pi pi-arrow-right"
            className="p-button-lg p-button-rounded"
          />
        </Link>
      </div>

      <div className="grid p-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="col-12 text-center mb-5">
          <p className="font-bold">"Your legacy, safe and private—until it matters most."</p>

          <p>You’ve built something meaningful. A family, a community, or a financial legacy in the world of crypto. You want to pass it on with care. In the traditional world, you would visit a notary, who holds your last will securely, only to be revealed after your passing. No one could tamper with it. No one could pressure you to change it. No one even knew what was inside.</p>

          <p className="font-bold">Until now, that was impossible in Web3.</p>

          <p>With <strong>Testament</strong>, we’ve brought that trusted notary model to the blockchain. Using <strong>Oasis Sapphire’s confidential smart contract execution</strong>, your will remains completely hidden—even from the network itself—until the time comes. No nosy observers. No frontrunners. No risk of heirs or outsiders pressuring you to reveal or amend your testament while you’re alive.</p>

          <p>When you’re gone and no longer able to signal your presence, your testament becomes available to your beneficiaries exactly as you intended. Immutable. Transparent. Fair.</p>

          <p className="font-italic">It’s dignity, privacy, and finality—reimagined for the decentralized world.</p>
        </div>
      </div>

      <div className="p-6" style={{ backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 className="text-center mb-4">How it works</h2>

          <div className="grid">
            <div className="col-12 md:col-4 same-height-col">
              <Card title="① Create Your Will" className="same-height-card">
                <p>
                  Define your trusted beneficiaries and assign shares of your crypto legacy. Your instructions and message remain securely encrypted on Oasis Sapphire—hidden from everyone until the time comes.
                </p>
              </Card>
            </div>

            <div className="col-12 md:col-4 same-height-col">
              <Card title="② Deposit Assets" className="same-height-card">
                <p>
                  Deposit ETH (and soon ERC20 tokens) into your personal Vault contract. You stay in full control of your funds while you’re alive.
                </p>
              </Card>
            </div>

            <div className="col-12 md:col-4 same-height-col">
              <Card title="③ Stay Alive" className="same-height-card">
                <p>
                  Simply check in with a single click every once in a while. This keeps your will securely locked and ensures your assets remain under your control.
                </p>
              </Card>
            </div>

            <div className="col-12 md:col-4 same-height-col">
              <Card title="④ Pass Away" className="same-height-card">
                <p>
                  If you’re no longer able to check in, the system detects your inactivity. Your private testament is then revealed securely and automatically.
                </p>
              </Card>
            </div>

            <div className="col-12 md:col-4 same-height-col">
              <Card title="⑤ Execute Will" className="same-height-card">
                <p>
                  Anyone can trigger the distribution of your assets according to your last wishes. The Vault smart contract executes your will, transferring the assets directly to your beneficiaries.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-content-center align-items-center gap-5 p-6" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <a href="https://ethdam.com" target="_blank"><img src={ethdamLogo} alt="ETHDam III" style={{ height: '100px', objectFit: 'contain' }} /></a>
        <a href="https://oasis.net" target="_blank"><img src={oasisLogo} alt="Oasis Network" style={{ height: '200px', objectFit: 'contain' }} /></a>
      </div>
    </div>
  )
}
