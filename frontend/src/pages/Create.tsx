import { Card } from 'primereact/card'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputNumber } from 'primereact/inputnumber'
import { Button } from 'primereact/button'
import { Divider } from 'primereact/divider'
import { Chart } from 'primereact/chart'
import { useState, useMemo } from 'react'
import { useAppKit, useAppKitAccount } from "@reown/appkit/react"

interface Beneficiary {
  address: string
  points: number
}

export default function Create() {
  const [message, setMessage] = useState('')
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])

  const { open: openWallet } = useAppKit()
  const { isConnected } = useAppKitAccount()

  const addBeneficiary = () => {
    setBeneficiaries([...beneficiaries, { address: '', points: 0 }])
  }

  const removeBeneficiary = (index: number) => {
    setBeneficiaries(beneficiaries.filter((_, i) => i !== index))
  }

  const updateBeneficiaryAddress = (index: number, value: string) => {
    const updated = [...beneficiaries]
    updated[index].address = value
    setBeneficiaries(updated)
  }

  const updateBeneficiaryPoints = (index: number, value: number) => {
    const updated = [...beneficiaries]
    updated[index].points = value
    setBeneficiaries(updated)
  }

  const handleSave = () => {
    if (!isConnected) {
      openWallet({ view: 'AllWallets', namespace: "eip155" }).then()
      return
    }

    alert(
      JSON.stringify({
        message,
        beneficiaries,
      }, null, 2)
    )
  }

  const chartData = useMemo(() => {
    const total = beneficiaries.reduce((sum, b) => sum + b.points, 0)
    if (total === 0) return null

    return {
      labels: beneficiaries.map((b, i) => b.address || `Beneficiary ${i + 1}`),
      datasets: [
        {
          data: beneficiaries.map(b => b.points),
          backgroundColor: [
            '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043', '#26A69A', '#7E57C2'
          ],
          hoverBackgroundColor: [
            '#64B5F6', '#81C784', '#FFB74D', '#BA68C8', '#FF8A65', '#4DB6AC', '#B39DDB'
          ]
        }
      ]
    }
  }, [beneficiaries])

  return (
    <div className="flex justify-content-center align-items-center" style={{ marginTop: '100px' }}>
      <Card title="Create Crypto Will" className="w-auto" style={{ maxWidth: '800px' }}>
        <div className="grid">
          {/* Message */}
          <div className="col-12">
            <label htmlFor="message" className="block mb-2">Last Message</label>
            <InputTextarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>

          <Divider />

          {/* Beneficiaries */}
          <div className="col-12 flex justify-content-between align-items-center">
            <h5 className="m-0">Beneficiaries</h5>
            <Button icon="pi pi-plus" outlined label="Add" size="small" onClick={addBeneficiary} />
          </div>

          {beneficiaries.map((b, index) => (
            <div key={index} className="col-12 p-3">
              <div className="flex align-items-center">
                <div className="flex-1 mr-2">
                  <label className="block mb-2">Wallet Address</label>
                  <InputText
                    value={b.address}
                    onChange={(e) => updateBeneficiaryAddress(index, e.target.value)}
                    className="w-full"
                    placeholder="0x..."
                  />
                </div>
                <div className="mr-2" style={{ width: '8rem' }}>
                  <label className="block mb-2">Points</label>
                  <InputNumber
                    value={b.points}
                    onValueChange={(e) => updateBeneficiaryPoints(index, e.value ?? 0)}
                    min={0}
                    className="w-full"
                  />
                </div>
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  rounded
                  size="small"
                  onClick={() => removeBeneficiary(index)}
                  aria-label="Remove"
                  className="mt-4"
                />
              </div>
            </div>
          ))}

          <Divider />

          <div className="col-12">
            <Button
              label="Save Will"
              icon="pi pi-check"
              className="w-full"
              onClick={handleSave}
              disabled={beneficiaries.length === 0}
            />
          </div>
        </div>
      </Card>

      {chartData && (
        <Card className="ml-4">
          <h5>Distribution Preview</h5>
          <Chart type="pie" data={chartData} />
        </Card>
      )}
    </div>
  )
}
