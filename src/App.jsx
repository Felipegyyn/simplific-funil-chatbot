import React, { useState, useEffect, useRef } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Checkbox } from './components/ui/checkbox';
import { 
  MessageCircle, 
  Bot, 
  User, 
  Send, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  DollarSign, 
  Shield,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import './App.css';

const CHAT_FLOW = {
  welcome: {
    type: 'bot',
    message: 'Opa! E aí? 👋 Sou o assessor Simplific. Estou aqui para te ajudar a ter liberdade financeira',
    delay: 1000,
    next: 'intro'
  },
  intro: {
    type: 'bot',
    message: 'Vou te fazer algumas perguntinhas rápidas para entender seu momento financeiro. Isso vai me ajudar muito a criar um diagnóstico personalizado para você. Vamos lá?',
    delay: 2000,
    options: [
      { text: 'Opa! vamos começar! 🚀', next: 'question1' },
      { text: 'Ainda tenho dúvidas...', next: 'doubts' }
    ]
  },
  doubts: {
    type: 'bot',
    message: 'Entendo suas dúvidas! Mas este diagnóstico é 100% gratuíto e leva menos de 1 minuto. Não vamos pedir informações sensíveis. Apenas algumas perguntas para entender seu perfil financeiro. Bora?',
    delay: 2500,
    options: [
      { text: 'Certo! Vamos lá! ✨', next: 'question1' },
      { text: 'Ainda não estou convencido(a)', next: 'convince' }
    ]
  },
  convince: {
    type: 'bot',
    message: 'Sem problemas! Mais de 10.000 pessoas já fizeram este diagnóstico e descobriram como organizar suas finanças. É rápido, seguro e pode ser o primeiro passo para sua transformação financeira. Que tal tentar?',
    delay: 2000,
    options: [
      { text: 'Está bem, vou tentar! Me convenceu 💪', next: 'question1' }
    ]
  },
  question1: {
    type: 'bot',
    message: 'Perfeito! Essa é a primeira pergunta: Como você se sente em relação ao controle das suas finanças no dia a dia?',
    icon: TrendingDown,
    delay: 1500,
    options: [
      { text: 'Me sinto completamente perdido(a) 😰', value: 'high', next: 'question2' },
      { text: 'Tenho algum controle, mas poderia ser melhor 😕', value: 'medium', next: 'question2' },
      { text: 'Me sinto no controle na maior parte do tempo 😊', value: 'low', next: 'question2' },
      { text: 'Tenho total controle das minhas finanças 😎', value: 'none', next: 'question2' }
    ]
  },
  question2: {
    type: 'bot',
    message: 'Entendi! Agora me conta: Você consegue guardar dinheiro regularmente para seus objetivos e sonhos?',
    icon: Target,
    delay: 1500,
    options: [
      { text: 'Não consigo guardar nada, o dinheiro sempre acaba 😔', value: 'high', next: 'question3' },
      { text: 'Consigo guardar pouco, mas não é consistente 😐', value: 'medium', next: 'question3' },
      { text: 'Consigo guardar uma quantia razoável todo mês 🙂', value: 'low', next: 'question3' },
      { text: 'Tenho uma reserva sólida e guardo regularmente 💪', value: 'none', next: 'question3' }
    ]
  },
  question3: {
    type: 'bot',
    message: 'Sobre dívidas e cartão de crédito... Como está sua situação?',
    icon: AlertTriangle,
    delay: 1500,
    options: [
      { text: 'Estou endividado(a) e preocupado(a) 😰', value: 'high', next: 'question4' },
      { text: 'Tenho algumas dívidas, mas nada muito grave 😕', value: 'medium', next: 'question4' },
      { text: 'Poucas dívidas, consigo pagar em dia 😊', value: 'low', next: 'question4' },
      { text: 'Não tenho dívidas significativas 😎', value: 'none', next: 'question4' }
    ]
  },
  question4: {
    type: 'bot',
    message: 'E sobre investimentos? Qual sua situação atual?',
    icon: DollarSign,
    delay: 1500,
    options: [
      { text: 'Não invisto, não sei nem por onde começar 😅', value: 'high', next: 'question5' },
      { text: 'Invisto pouco, gostaria de aprender mais 🤔', value: 'medium', next: 'question5' },
      { text: 'Invisto regularmente, mas quero otimizar 📈', value: 'low', next: 'question5' },
      { text: 'Sou um investidor experiente 🎯', value: 'none', next: 'question5' }
    ]
  },

  question5: {
    type: 'bot',
    message: 'Como você planeja?',
    icon: DollarSign,
    delay: 1500,
    options: [
      { text: 'Não planejo nada. Só gasto 😅', value: 'high', next: 'question6' },
      { text: 'Tento criar um orçamento, mas é dificil 🤔', value: 'medium', next: 'question6' },
      { text: 'Tento gastar o que planejo quase sempre 📈', value: 'low', next: 'question6' },
      { text: 'Só gasto exatamente o que está no meu orçamento 🎯', value: 'none', next: 'question6' }
    ]
  },

  question6: {
    type: 'bot',
    message: 'Última pergunta: Como você se sente sobre seu futuro financeiro?',
    icon: Shield,
    delay: 1500,
    options: [
      { text: 'Muito inseguro(a), não sei o que me espera 😟', value: 'high', next: 'analysis' },
      { text: 'Um pouco preocupado(a), mas esperançoso(a) 😐', value: 'medium', next: 'analysis' },
      { text: 'Confiante, mas sempre posso melhorar 🙂', value: 'low', next: 'analysis' },
      { text: 'Muito seguro(a) sobre meu futuro financeiro 😊', value: 'none', next: 'analysis' }
    ]
  },
  analysis: {
    type: 'bot',
    message: 'Analisando suas respostas... 🤖💭',
    delay: 2000,
    next: 'result'
  },
  result: {
    type: 'bot',
    message: '',
    delay: 1500,
    next: 'contact_request'
  },
  contact_request: {
    type: 'bot',
    message: 'Para enviar seu diagnóstico completo e dicas personalizadas, preciso do seu contato. Pode me informar?',
    delay: 2000,
    next: 'contact_form'
  },
  contact_form: {
    type: 'form',
    message: 'Preencha os dados abaixo para receber seu diagnóstico:',
    fields: ['name', 'email', 'whatsapp', 'consent'],
    next: 'final'
  },
  final: {
    type: 'bot',
    message: 'Perfeito! 🎉 Seu diagnóstico foi enviado para seu e-mail e em breve você receberá dicas exclusivas no WhatsApp.',
    delay: 1500,
    next: 'cta'
  },
  cta: {
    type: 'bot',
    message: 'Que tal conhecer agora mesmo a solução completa que pode transformar sua vida financeira de vez?',
    delay: 2000,
    cta: true
  }
};

function App() {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState('welcome');
  const [userResponses, setUserResponses] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    consent: false
  });
  const [showForm, setShowForm] = useState(false);
  const messagesEndRef = useRef(null);
  const formRef = useRef(null); // <-- ADICIONE ESTA LINHA

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // NOVO CÓDIGO COM A CORREÇÃO DE TIMING
useEffect(() => {
  if (showForm && formRef.current) {
    // A micro-pausa (setTimeout) garante que o DOM foi atualizado
    // antes de tentarmos rolar a tela para o formulário.
    // Isso resolve a "corrida" de renderização.
    setTimeout(() => {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100); // 100ms é uma pequena espera segura.
  } else {
    // Para todas as outras mensagens, a rolagem continua imediata.
    scrollToBottom();
  }
}, [messages, showForm]);

  useEffect(() => {
    if (currentStep) {
      handleBotMessage(currentStep);
    }
  }, [currentStep]);

  const calculatePainLevel = () => {
    const responses = Object.values(userResponses);
    const highCount = responses.filter(r => r === 'high').length;
    const mediumCount = responses.filter(r => r === 'medium').length;
    
    if (highCount >= 3) return 'high';
    if (highCount >= 2 || mediumCount >= 3) return 'medium';
    return 'low';
  };

  const getPainMessage = (level) => {
    const messages = {
      high: '🚨 Suas respostas indicam que você está enfrentando desafios significativos com suas finanças. Mas não se preocupe - você está no lugar certo para mudar isso! O Simplific Pro foi criado exatamente para pessoas como você.',
      medium: '⚠️ Você já tem algum controle financeiro, mas há muito espaço para melhorar. Com as ferramentas certas, você pode alcançar a estabilidade financeira que deseja.',
      low: '✅ Parabéns! Você já tem um bom controle financeiro. O Simplific Pro pode te ajudar a otimizar ainda mais e alcançar seus objetivos mais rapidamente.'
    };
    return messages[level];
  };

  const handleBotMessage = (step) => {
    const stepData = CHAT_FLOW[step];
    if (!stepData) return;

    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      
      let message = stepData.message;
      
      if (step === 'result') {
        const painLevel = calculatePainLevel();
        message = getPainMessage(painLevel);
      }

      const newMessage = {
        id: Date.now(),
        type: 'bot',
        content: message,
        icon: stepData.icon,
        options: stepData.options,
        cta: stepData.cta
      };

      setMessages(prev => [...prev, newMessage]);

      if (stepData.next && !stepData.options && !stepData.cta && step !== 'contact_form') {
        setTimeout(() => {
          setCurrentStep(stepData.next);
        }, 1000);
      }

      if (step === 'contact_form') {
        setShowForm(true);
      }
    }, stepData.delay || 1000);
  };

  const handleOptionClick = (option) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: option.text
    };
    setMessages(prev => [...prev, userMessage]);

    // Store response if it has a value
    if (option.value) {
      setUserResponses(prev => ({
        ...prev,
        [currentStep]: option.value
      }));
    }

    // Move to next step
    setTimeout(() => {
      setCurrentStep(option.next);
    }, 500);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.whatsapp || !formData.consent) {
      alert('Por favor, preencha todos os campos obrigatórios e aceite os termos.');
      return;
    }
  
    // Add user message with form data
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `📧 ${formData.email}\n📱 ${formData.whatsapp}${formData.name ? `\n👤 ${formData.name}` : ''}`
    };
    setMessages(prev => [...prev, userMessage]);
  
    // Prepare the complete data payload
    const painLevel = calculatePainLevel();
    const finalData = {
      name: formData.name,
      email: formData.email,
      whatsapp: formData.whatsapp,
      painLevel: painLevel,
      answers: {
        question1: userResponses.question1 || '',
        question2: userResponses.question2 || '',
        question3: userResponses.question3 || '',
        question4: userResponses.question4 || '',
        question5: userResponses.question5 || '',
      }
    };

    // --- Send data to our serverless function ---
    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        // If the server response is not ok, throw an error
        throw new Error(`Server responded with status: ${response.status}`);
      }

      console.log("Lead successfully sent to backend!");

    } catch (error) {
      // Log the error for debugging, but don't stop the user's flow
      console.error("Failed to submit lead:", error);
      // Optional: you could add a visual indicator for the user here
    }
  
    // Hide the form and continue the flow immediately
    setShowForm(false);
    setTimeout(() => {
      setCurrentStep('final');
    }, 500);
  };

  const handleCTAClick = () => {
    window.open('https://www.simplificpro.com.br', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
            src="/logo.png" 
            alt="Logo Simplific Pro" 
            className="w-10 h-10 rounded-full object-cover" 
            />
          <div>
              <h1 className="font-bold text-gray-900">Assessor Financeiro</h1>
              <p className="text-sm text-gray-600">Simplific Pro</p>
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
      <div className="flex-grow max-w-4xl w-full mx-auto px-4 py-8 flex">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-2">
                    <img 
                    src="/logo.png" 
                    alt="Logo Simplific Pro" 
                    className="w-8 h-8 rounded-full object-cover" 
                    />
                    <span className="text-sm font-medium text-gray-700">Simplific</span>
                  </div>
                  )}
                  
                  <Card className={`${message.type === 'user' ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-0' : 'bg-gray-50 border-gray-200'}`}>
                    <CardContent className="p-4">
                      <p className={`whitespace-pre-line ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                        {message.content}
                      </p>
                      
                      {message.options && (
                        <div className="mt-4 space-y-2">
                          {message.options.map((option, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="w-full justify-start text-left h-auto p-3 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                              onClick={() => handleOptionClick(option)}
                            >
                              {option.text}
                            </Button>
                          ))}
                        </div>
                      )}

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
              <div ref={formRef} className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                    src="/logo.png" 
                    alt="Logo Simplific Pro" 
                    className="w-8 h-8 rounded-full object-cover" 
                    />
                    <span className="text-sm font-medium text-gray-700">Assessor</span>
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
              <div className="flex justify-start">
                <div className="max-w-[80%] w-full">
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                    src="/logo.png" 
                    alt="Logo Simplific Pro" 
                    className="w-8 h-8 rounded-full object-cover" 
                    />
                    <span className="text-sm font-medium text-gray-700">Assistente</span>
                  </div>
                  <Card className="bg-gray-50 border-gray-200">
                    <CardContent className="p-4">
                      <p className="text-gray-800 mb-4">Preencha os dados abaixo para receber seu diagnóstico:</p>
                      <form onSubmit={handleFormSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome (opcional)
                          </label>
                          <Input
                            type="text"
                            placeholder="Como posso te chamar?"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            E-mail *
                          </label>
                          <Input
                            type="email"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            WhatsApp *
                          </label>
                          <Input
                            type="tel"
                            placeholder="(11) 99999-9999"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                            className="w-full"
                            required
                          />
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox
                            id="consent"
                            checked={formData.consent}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consent: checked }))}
                            required
                          />
                          <label htmlFor="consent" className="text-sm text-gray-600 leading-relaxed">
                            Autorizo o contato via e-mail e WhatsApp para receber meu diagnóstico e informações sobre o Simplific Pro. *
                          </label>
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all duration-200"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Receber Meu Diagnóstico
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-1 text-sm text-gray-500">
        <p>Powered by Simplific Pro • Seus dados estão seguros conosco</p>
      </div>
    </div>
  );
}

export default App;
