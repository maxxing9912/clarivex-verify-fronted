import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

function App() {
  const [status, setStatus] = useState('Waiting for data...');
  const [params, setParams] = useState({});

  useEffect(() => {
    // Prendi parametri dalla URL
    const urlParams = new URLSearchParams(window.location.search);
    const discordId = urlParams.get('discordId');
    const robloxId = urlParams.get('robloxId');
    const code = urlParams.get('code');

    if (!discordId || !code) {
      setStatus('Missing required parameters in URL');
      return;
    }
    setParams({ discordId, robloxId, code });

    // Carica fingerprint
    FingerprintJS.load().then(fp => {
      fp.get().then(result => {
        const fingerprint = result.visitorId;

        // Ottieni IP pubblico via API (opzionale)
        fetch('https://api.ipify.org?format=json')
          .then(res => res.json())
          .then(data => {
            const ip = data.ip;

            // Invia al backend
            fetch('https://clarivex-verify-backend.onrender.com/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ discordId, robloxId, code, fingerprint, ip }),
            })
              .then(res => res.json())
              .then(json => {
                if (json.success) {
                  setStatus('Device and IP confirmed! Verification in progress...');
                } else {
                  setStatus('Verification failed: ' + (json.error || 'Unknown error'));
                }
              })
              .catch(() => setStatus('Network error sending verification'));
          })
          .catch(() => setStatus('Could not fetch IP address'));
      });
    });
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Verification</h1>
      <p>Status: {status}</p>
      <p>Discord ID: {params.discordId}</p>
      <p>Roblox ID: {params.robloxId}</p>
      <p>Code: {params.code}</p>
    </div>
  );
}

export default App;