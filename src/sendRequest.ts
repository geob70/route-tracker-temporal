import fetch from 'node-fetch';

const API_URL = 'http://localhost:8000/api/monitor-routes';

const payload = [
  {
    origin: [51.5074, -0.1278], // London
    destination: [52.4862, -1.8904], // Birmingham
    threshold: 300,
    recipient: 'sylvester.ola.george@gmail.com',
  },
  // {
  //   origin: [53.4808, -2.2426], // Manchester
  //   destination: [55.9533, -3.1883], // Edinburgh
  //   threshold: 600,
  //   recipient: 'sylvester.ola.george@gmail.com',
  // },
  // {
  //   origin: [51.4545, -2.5879], // Bristol
  //   destination: [50.7192, -1.8808], // Bournemouth
  //   threshold: 240,
  //   recipient: 'sylvester.ola.george@gmail.com',
  // },
  // {
  //   origin: [51.752, -1.2577], // Oxford
  //   destination: [52.2053, 0.1218], // Cambridge
  //   threshold: 180,
  //   recipient: 'sylvester.ola.george@gmail.com',
  // },
];

async function sendTestRequest() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Request failed:', data);
    } else {
      console.log('✅ Workflows started:', data);
    }
  } catch (err) {
    console.error('❌ Error sending request:', err);
  }
}

sendTestRequest();
