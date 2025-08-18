export default async function handler(request, response) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  // --- COLE A URL DO SEU GOOGLE APPS SCRIPT AQUI ---
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXX8vZPKRLV14yI4HSho31t8lOKmRveZOil1J_5t9Se7Z82t0J3dpnSEl6gVWvG5n6/exec';

  try {
    const leadData = request.body;

    // Forward the data to your Google Apps Script
    const scriptResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadData),
      // Use redirect: 'follow' for Google Apps Script
      redirect: 'follow'
    });

    const scriptResult = await scriptResponse.json();

    // Check if the script executed successfully
    if (scriptResult.status === 'success') {
      return response.status(200).json({ message: 'Lead captured successfully!' });
    } else {
      // Log the error from the script and return a server error
      console.error('Google Apps Script Error:', scriptResult.message);
      return response.status(500).json({ message: 'Error saving lead data.' });
    }

  } catch (error) {
    console.error('Serverless Function Error:', error);
    return response.status(500).json({ message: 'An internal server error occurred.' });
  }
}