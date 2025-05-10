import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Create from './pages/Create'
import { AppToolbar } from "./components/AppToolbar.tsx"

import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { sapphireTestnet, arbitrumSepolia } from "@reown/appkit/networks";
import Ping from "./pages/Ping.tsx"
import Distribute from "./pages/Distribute.tsx"

const projectId = "a728aadc5ab4cd2410577c034a75ac60";

const metadata = {
  name: "ETHDam III Testament",
  description: "Crypto will for the ETHDam III hackathon",
  url: "https://testament.jasny.net",
  icons: [],
};

createAppKit({
  adapters: [new EthersAdapter()],
  networks: [sapphireTestnet, arbitrumSepolia],
  metadata,
  projectId,
  features: {
    analytics: true, // Optional - defaults to your Cloud configuration
  },
});

function App() {
  return (
    <BrowserRouter>
      <AppToolbar />
      <div className="p-m-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/ping" element={<Ping />} />
          <Route path="/distribute" element={<Distribute />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
