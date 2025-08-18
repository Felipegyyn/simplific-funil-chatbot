import { Resend } from 'resend';

// Inicializa o Resend com a chave da API que configuramos na Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXX8vZPKRLV14yI4HSho31t8lOKmRveZOil1J_5t9Se7Z82t0J3dpnSEl6gVWvG5n6/exec'; // Lembre-se de usar a sua URL
  const leadData = request.body;

  try {
    // --- TAREFA 1: Enviar lead para o Google Sheets (como antes) ---
    const scriptResponse = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData),
      redirect: 'follow'
    });
    
    const scriptResult = await scriptResponse.json();
    if (scriptResult.status !== 'success') {
      console.error('Google Apps Script Error:', scriptResult.message);
      // Mesmo com erro no sheets, vamos tentar enviar o e-mail
    }

    // --- TAREFA 2: Enviar e-mail de boas-vindas para o lead ---
    const userName = leadData.name || 'futuro expert em finanças'; // Usa o nome ou um texto padrão
    
    await resend.emails.send({
      from: 'Simplific Pro <contato@simplificpro.com.br>', // IMPORTANTE: O e-mail DEVE ser do seu domínio verificado
      to: [leadData.email],
      subject: 'Seu Diagnóstico Financeiro Simplific Pro está pronto!',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Olá, ${userName}!</h2>
          <p>Obrigado por completar nosso diagnóstico financeiro. Este é o primeiro passo para assumir o controle total da sua vida financeira e alcançar seus objetivos.</p>
          <p>Você demonstrou um grande interesse em organizar suas finanças, e estamos aqui para te ajudar nessa jornada.</p>
          <p>A solução completa para colocar tudo que você respondeu em prática, criar metas, controlar despesas e ter paz de espírito está a um clique de distância.</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://www.simplificpro.com.br" style="background-color: #28a745; color: white; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
              Conhecer o Simplific Pro Agora!
            </a>
          </p>
          <p>Não perca a chance de transformar sua relação com o dinheiro.</p>
          <br>
          <p>Atenciosamente,</p>
          <p><strong>Equipe Simplific Pro</strong></p>
        </div>
      `,
    });

    // Se tudo deu certo, retorna sucesso
    return response.status(200).json({ message: 'Lead captured and email sent successfully!' });

  } catch (error) {
    console.error('Serverless Function Error:', error);
    return response.status(500).json({ message: 'An internal server error occurred.' });
  }
}