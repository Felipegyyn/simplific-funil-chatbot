import { Resend } from 'resend';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializa os clientes das APIs com as chaves de ambiente
const resend = new Resend(process.env.RESEND_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzXX8vZPKRLV14yI4HSho31t8lOKmRveZOil1J_5t9Se7Z82t0J3dpnSEl6gVWvG5n6/exec'; // Lembre-se de usar a sua URL
  const { name, email, whatsapp, conversationHistory } = request.body;

  try {
    // --- TAREFA 1: Gerar o diagnóstico personalizado com a IA ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Você é um especialista em finanças pessoais do Simplific Pro.
      A seguir, a transcrição de uma conversa com um potencial cliente chamado ${name}.
      Com base nas respostas dele, escreva um diagnóstico financeiro conciso e personalizado em 3 parágrafos para ser enviado por e-mail.
      O tom deve ser encorajador, profissional e direto.
      - No primeiro parágrafo, identifique o principal desafio ou sentimento financeiro dele com base na conversa.
      - No segundo, sugira uma ação prática e imediata que ele pode tomar para começar a resolver esse desafio. Obs: Não aconselhe a usar planilha, baixar aplicativos e etc. Pois a ideia é focar no Simplific Pro. 
      - No terceiro, explique brevemente como a plataforma Simplific Pro é a solução ideal para ajudá-lo de forma definitiva.
      Aqui está a conversa:
      ---
      ${conversationHistory}
      ---
    `;

    const result = await model.generateContent(prompt);
    const diagnosticText = result.response.text();

    // --- TAREFA 2: Enviar o e-mail personalizado via Resend ---
    await resend.emails.send({
      from: 'Simplific Pro <contato@simplificpro.com.br>',
      to: [email],
      subject: `Seu Diagnóstico Financeiro Exclusivo, ${name}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Olá, ${name}!</h2>
          <p>Obrigado por conversar com nosso assessor de IA. Com base no nosso papo, preparamos um diagnóstico exclusivo para você:</p>
          <div style="background-color: #f9f9f9; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
            ${diagnosticText.replace(/\n/g, '<br>')}
          </div>
          <p>Ter clareza é o primeiro passo. A solução completa para colocar tudo isso em prática, criar metas, controlar despesas e ter paz de espírito está a um clique de distância.</p>
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

    // --- TAREFA 3: Enviar lead para o Google Sheets ---
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, whatsapp, conversationHistory }),
      redirect: 'follow'
    });
    
    return response.status(200).json({ message: 'Lead captured and email sent successfully!' });

  } catch (error) {
    console.error('Serverless Function Error:', error);
    return response.status(500).json({ message: 'An internal server error occurred.' });
  }
}
