import { useNavigate } from 'react-router-dom'
import { Menubar } from 'primereact/menubar'
import { Button } from 'primereact/button'
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"
import { shortAddress } from "../lib/utils.ts"

export function AppToolbar() {
  const navigate = useNavigate()

  const { address } = useAppKitAccount()
  const { open } = useAppKit();

  const connectWallet = async () => {
    try {
      await open({ view: address ? 'Account' : 'AllWallets', namespace: "eip155" })
    } catch (err) {
      console.error('Wallet connect failed:', err)
    }
  }

  const items = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      command: () => navigate('/'),
    },
    {
      label: 'Create Will',
      icon: 'pi pi-plus',
      command: () => navigate('/create'),
    },
    {
      label: "I'm still alive",
      icon: 'pi pi-heart',
      command: () => navigate('/ping'),
    },
    {
      label: 'Execute Will',
      icon: 'pi pi-check',
      command: () => navigate('/distribute'),
    },
  ]

  const end = (
    <Button
      label={address ? shortAddress(address) : 'Connect'}
      icon="pi pi-wallet"
      severity="secondary"
      size="small"
      onClick={connectWallet}
    />
  )

  return (
    <div style={{ position: 'sticky', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <Menubar model={items} end={end} />
    </div>
  )
}
