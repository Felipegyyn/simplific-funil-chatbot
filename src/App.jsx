import React, { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Checkbox } from './components/ui/checkbox';
import { 
  Bot, 
  Send, 
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    consent: false
  });
  const [showForm, setShowForm] = useState(false);
  const messagesEndRef = useRef(null);
  const formRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      scrollToBottom();
    }
  }, [messages, showForm]);

  // Mensagem inicial do chatbot
  useEffect(() => {
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        content: 'Olá! 👋 Sou o Simplific, seu novo assessor financeiro do Simplific Pro. Para começarmos seu diagnóstico exclusivo, por favor, me diga seu nome.',
      }
    ]);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    // --- INÍCIO DA CORREÇÃO ---
    // Adiciona a mensagem do usuário à tela primeiro em todos os casos
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput,
    };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput('');

    // Verifica se o usuário está respondendo à ÚLTIMA pergunta
    if (currentQuestionIndex >= 5) { // 5 é o total de perguntas
      setIsComplete(true);
      // Chama a etapa final DEPOIS de mostrar a resposta do usuário
      setTimeout(() => handleFinalStep(), 1500);
      return; // Para a função aqui, não precisa mais chamar a IA
    }
    // --- FIM DA CORREÇÃO ---

    setIsLoading(true);
    setIsTyping(true);

    // Constrói o histórico para enviar à IA (removendo a última mensagem do usuário que já adicionamos)
    const historyForApi = messages.map(msg => ({
      role: msg.type === 'bot' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    historyForApi.push({ role: 'user', parts: [{ text: userInput }] });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyForApi,
          currentQuestionIndex: currentQuestionIndex
        })
      });

      if (!res.ok) throw new Error('Falha na resposta da API');

      const data = await res.json();

      const newBotMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response
      };
      setMessages(prev => [...prev, newBotMessage]);

      // Avança para a próxima pergunta
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);

      // O bloco que verificava o fim da conversa foi removido daqui

    } catch (error) {
      console.error(error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "Desculpe, tive um problema para processar. Pode repetir, por favor?"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleFinalStep = () => {
    const finalBotMessage = {
      id: Date.now(),
      type: 'bot',
      content: 'Obrigado por compartilhar! Seu diagnóstico está quase pronto. Para que eu possa enviá-lo de forma personalizada e segura, por favor, preencha os campos abaixo.'
    };
    setMessages(prev => [...prev, finalBotMessage]);
    setShowForm(true);
  };
  
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.whatsapp || !formData.consent) {
      alert('Por favor, preencha todos os campos obrigatórios e aceite os termos.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `Pronto! Meus dados são: 📧 ${formData.email} | 📱 ${formData.whatsapp}`
    };
    setMessages(prev => [...prev, userMessage]);
    setShowForm(false);

    setTimeout(() => {
        const finalMessage = {
            id: Date.now() + 1,
            type: 'bot',
            content: `Perfeito, ${formData.name || 'tudo certo'}! 🎉 Estou compilando seu diagnóstico exclusivo e o enviarei para seu e-mail em instantes. Enquanto isso, que tal conhecer a solução completa que pode transformar sua vida financeira de vez?`,
            cta: true
        };
        setMessages(prev => [...prev, finalMessage]);
    }, 1500);

    const historyForApi = messages.map(msg => `${msg.type === 'bot' ? 'Simplific' : 'Usuário'}: ${msg.content}`).join('\n');
    
    const finalData = {
      name: formData.name,
      email: formData.email,
      whatsapp: formData.whatsapp,
      conversationHistory: historyForApi
    };

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead');
    }

    try {
      // Usaremos a API antiga para salvar o lead e enviar o e-mail (que precisará ser adaptada)
      await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });
      console.log("Dados enviados para o backend com sucesso em segundo plano!");
    } catch (error) {
      console.error("Falha ao enviar dados para o backend:", error);
    }
  };

  const handleCTAClick = () => {
    window.open('https://www.simplificpro.com.br', '_blank');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo Simplific Pro" className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h1 className="font-bold text-gray-900">Assessor Financeiro</h1>
              <p className="text-sm text-gray-600">Felipe do Simplific</p>
            </div>
            <div className="ml-auto">
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-8 flex">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-2">
                      <img src="/logo.png" alt="Logo Simplific Pro" className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm font-medium text-gray-700">Simplific</span>
                    </div>
                  )}
                  
                  <Card className={`${message.type === 'user' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-0' : 'bg-gray-50 border-gray-200'}`}>
                    <CardContent className="p-4">
                      <p className="whitespace-pre-line text-gray-800">
                        {message.content}
                      </p>
                      {message.cta && (
                        <div className="mt-4">
                          <Button
                            onClick={handleCTAClick}
                            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 transform hover:scale-105"
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Conhecer o Simplific Pro Agora!
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="/logo.png" alt="Logo Simplific Pro" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm font-medium text-gray-700">Simplific</span>
                  </div>
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {showForm && (
              <div ref={formRef} className="flex justify-start">
                <div className="max-w-[80%] w-full">
                   <div className="flex items-center gap-2 mb-2">
                      <img src="/logo.png" alt="Logo Simplific Pro" className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm font-medium text-gray-700">Simplific</span>
                    </div>
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <p className="text-gray-800 mb-4">{messages[messages.length - 1]?.content}</p>
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        {/* Campos do formulário aqui... */}
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                           <Input type="text" placeholder="Seu nome completo" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full" required/>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
                           <Input type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="w-full" required/>
                         </div>
                         <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                           <Input type="tel" placeholder="(11) 99999-9999" value={formData.whatsapp} onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))} className="w-full" required/>
                         </div>
                         <div className="flex items-start space-x-2">
                           <Checkbox id="consent" checked={formData.consent} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consent: checked }))} required/>
                           <label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">Autorizo o contato via e-mail e WhatsApp para receber meu diagnóstico e informações sobre o Simplific Pro. *</label>
                         </div>
                         <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200">
                           <CheckCircle className="w-4 h-4 mr-2" />
                           Receber Meu Diagnóstico Exclusivo
                         </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          {!isComplete && !showForm && (
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Digite sua resposta aqui..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isLoading}
                  className="flex-grow"
                />
                <Button type="submit" disabled={isLoading || !userInput.trim()} className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
