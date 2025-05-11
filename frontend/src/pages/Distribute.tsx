import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

export default function Distribute() {
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleGo = () => {
    if (!address || address.length < 5) return; // simple check
    navigate(`/distribute/${address}`);
  };

  return (
    <div className="flex justify-content-center align-items-center min-h-screen">
      <Card title="Execute Will">
        <div className="flex flex-column gap-3 w-30rem">
          <span className="p-float-label">
            <InputText
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full"
            />
            <label htmlFor="address">Testator Wallet Address</label>
          </span>
          <Button
            label="Check Will"
            icon="pi pi-search"
            onClick={handleGo}
            disabled={!address}
          />
        </div>
      </Card>
    </div>
  );
}
