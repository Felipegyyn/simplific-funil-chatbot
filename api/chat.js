import { GoogleGenerativeAI } from '@google/generative-ai';

// As perguntas que guiarão nosso funil.
const questions = [
  "Primeiramente, me conta, qual é o seu maior desafio financeiro hoje?",
  "Você costuma anotar seus gastos, nem que seja em um papelzinho?",
  "Se a respostar anterior for 'sim' me diga como você costuma controlar seus gastos? Se a resposta anterior for 'Não', me diga o que te impede de controlar seus gastos?",
  "Entendi. Você guardar dinheiro regularmente para atingir alguma meta?",
  "Você consegue criar orçamentos mensais para evitar surpresas no fim do mês?",
  "Ok. E sobre dívidas e o uso do cartão de crédito, como está sua situação atual? Seja sincero",
  "Certo. E sobre o mundo dos investimentos, qual sua situação hoje?",
  "Estamos quase no fim. Como você se sente em relação à segurança do seu futuro financeiro?",
  "Agora, farei quatro perguntas que definirão seu futuro financeiro: Acompanhar suas finanças no whatsapp, te ajudaria?",
  "Registrar despesas, receitas, gastos no cartão, agendar compromissos, receber lembretes direto no whatsapp, seria uma boa ideia?",
  "Etendi! Receber dicas de como economizar, de como fazer um planejamento, de como controlar dívidas no cartão de crédito direto no whastapp, faria sentido?",
  "Última pergunta: Se eu te dissesse que posso de dosponibilizar um acessor financeiro com direito a tudo isso e ainda acesso a uma plataforma para chamar se SUA, você acreditaria?",
  "Obrigado pela honestidade. Em instantes você receberá um diagóstico completo da sua situação atual. Posso te enviar?"
];

// Inicializa o cliente da IA com a nossa chave de API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { history, currentQuestionIndex } = request.body;

    // Garante que não ultrapassemos o limite de perguntas
    if (currentQuestionIndex >= questions.length) {
      return response.status(400).json({ error: 'Fim do questionário.' });
    }

    // Seleciona a próxima pergunta a ser feita
    const nextQuestion = questions[currentQuestionIndex];

    // O "cérebro" do nosso prompt: as instruções para a IA
    const systemPrompt = `
      Você é o 'Simplific', um assessor financeiro amigável, informal, empático e especialista do Simplific Pro.
      Sua missão é guiar o usuário, de forma leve e informal, por um diagnóstico financeiro de 13 perguntas.
      Seja breve, humano e encorajador. NUNCA use jargões financeiros complexos.
      O histórico da nossa conversa está abaixo. Com base nele, sua tarefa é:
      1. Validar brevemente a última resposta do usuário, mostrando que você entendeu o sentimento dele e se mostrando um "ombro amigo"
      2. Fazer a próxima pergunta da lista de forma natural, informal e amigável.
      A próxima pergunta que você DEVE fazer é: "${nextQuestion}"
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const chat = model.startChat({
      history: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "Entendido! Estou pronto para ajudar." }] },
        ...history // Adiciona o histórico da conversa atual
      ],
      generationConfig: {
        maxOutputTokens: 150,
      },
    });

    // Pega a última mensagem do usuário para gerar a nova resposta
    const lastUserMessage = history[history.length - 1]?.parts[0]?.text || "Olá";

    const result = await chat.sendMessage(lastUserMessage);
    const aiResponse = result.response;
    const text = aiResponse.text();

    // Envia a resposta gerada pela IA de volta para o frontend
    response.status(200).json({ response: text });

  } catch (error) {
    console.error("Erro na API do Gemini:", error);
    response.status(500).json({ error: "Desculpe, não consegui processar sua resposta. Vamos tentar de novo." });
  }
}
