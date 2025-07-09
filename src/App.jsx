import React, { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

function App() {
  const [status, setStatus] = useState('Raccolta dati...');
  const params = new URLSearchParams(window.location.search);
  const discordId = params.get('discordId');
  const code = params.get('code');
  const robloxUsername = params.get('robloxUsername'); // o robloxId se preferisci

  useEffect(() => {
    if (!discordId || !code) {
      setStatus('Parametri mancanti. Contatta lo staff.');
      return;
    }

    async function collectAndSend() {
      try {
        // 1) fingerprint
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const fingerprint = result.visitorId;

        // 2) IP pubblico (opzionale)
        const ipResp = await fetch('https://api.ipify.org?format=json');
        const ipJson = await ipResp.json();
        const ip = ipJson.ip;

        // 3) invia al backend Render
        const res = await fetch('https://clarivex-verify-backend.onrender.com/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ discordId, code, fingerprint, ip, robloxUsername }),
        });
        const json = await res.json();

        if (json.success) {
          setStatus('✅ Dispositivo confermato! Torna su Discord per completare la verifica.');
        } else {
          setStatus('❌ Errore: ' + (json.error || 'Unknown error'));
        }
      } catch (err) {
        console.error(err);
        setStatus('❌ Errore nel processo, riprova.');
      }
    }

    collectAndSend();
  }, [discordId, code, robloxUsername]);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Clarivex Verification</h1>
      <p>Status: {status}</p>
      <p>Discord ID: {discordId}</p>
      <p>Code: {code}</p>
      <p>Roblox Username: {robloxUsername}</p>
    </div>
  );
}

export default App;
