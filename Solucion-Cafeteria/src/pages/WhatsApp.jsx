import { useState, useRef, useEffect } from 'react';
import { storage } from '../utils/storage';

const BOT_RESPONSES = {
  greeting: [
    '¡Hola! 👋 Bienvenido a {businessName}. ¿En qué podemos ayudarte hoy?',
  ],
  menu: [
    '📋 ¡Claro! Aquí está nuestro menú destacado:',
  ],
  hours: [
    '🕐 Nuestros horarios son:\n🕐 Lunes a Viernes: 7:00 AM - 10:00 PM\n🕐 Sábados: 8:00 AM - 11:00 PM\n🕐 Domingos: 8:00 AM - 9:00 PM',
  ],
  location: [
    '📍 Estamos ubicados en:\nCalle Principal #123, Centro\n¡Te esperamos! 🎉',
  ],
  reservation: [
    '📅 ¡Perfecto! Para hacer una reservación necesito los siguientes datos:\n\n1️⃣ Nombre completo\n2️⃣ Fecha\n3️⃣ Hora\n4️⃣ Número de personas\n\nPuedes hacer tu reservación directamente desde nuestra plataforma o llamarnos al +52 123 456 7890 📞',
  ],
  contact: [
    '📞 Puedes contactarnos por:\n\n📱 WhatsApp: +52 123 456 7890\n📧 Email: info@{businessName}.com\n📱 Instagram: @{businessName}\n📱 Facebook: {businessName}\n\n¡Estamos para servirte! 😊',
  ],
  thanks: [
    '¡Gracias por escribirnos! 🙏 Pronto nos pondremos en contacto contigo. ¡Que tengas un excelente día! 😊☕',
  ],
  default: [
    'Gracias por tu mensaje 😊 Déjame conectarte con alguien que pueda ayudarte mejor. ¡Un momento por favor!',
    'Interesante pregunta 🤔 Déjame consultar eso. Mientras tanto, ¿necesitas algo más?',
    '¡Entendido! 💪 Haremos todo lo posible para ayudarte. ¿Hay algo más en lo que podamos asistirte?',
  ],
};

function processMessage(input, businessName) {
  const lower = input.toLowerCase();

  if (
    lower.includes('hola') ||
    lower.includes('buenos') ||
    lower.includes('buenas') ||
    lower.includes('hello') ||
    lower.includes('hi')
  ) {
    return BOT_RESPONSES.greeting[0].replace('{businessName}', businessName);
  }
  if (
    lower.includes('menú') ||
    lower.includes('menu') ||
    lower.includes('producto') ||
    lower.includes('qué tienen') ||
    lower.includes('que tienen') ||
    lower.includes('carta')
  ) {
    const menu = storage.getMenu();
    const topItems = menu.slice(0, 5);
    let msg = BOT_RESPONSES.menu[0] + '\n\n';
    topItems.forEach((item, i) => {
      msg += `${i + 1}. ${item.name} - $${item.price.toFixed(2)}\n   ${item.description}\n\n`;
    });
    msg += '💡 ¿Te gustaría ver el menú completo o hacer un pedido?';
    return msg;
  }
  if (
    lower.includes('horario') ||
    lower.includes('hora') ||
    lower.includes('abren') ||
    lower.includes('cierran') ||
    lower.includes('cuándo')
  ) {
    return BOT_RESPONSES.hours[0];
  }
  if (
    lower.includes('ubicación') ||
    lower.includes('dónde') ||
    lower.includes('donde') ||
    lower.includes('dirección') ||
    lower.includes('direccion') ||
    lower.includes('lugar')
  ) {
    return BOT_RESPONSES.location[0];
  }
  if (
    lower.includes('reserva') ||
    lower.includes('reservar') ||
    lower.includes('mesa') ||
    lower.includes('mesas')
  ) {
    return BOT_RESPONSES.reservation[0];
  }
  if (
    lower.includes('contacto') ||
    lower.includes('contactar') ||
    lower.includes('teléfono') ||
    lower.includes('telefono') ||
    lower.includes('whatsapp') ||
    lower.includes('instagram') ||
    lower.includes('facebook') ||
    lower.includes('email')
  ) {
    return BOT_RESPONSES.contact[0].replace(/{businessName}/g, businessName);
  }
  if (
    lower.includes('gracias') ||
    lower.includes('thank') ||
    lower.includes('thanks')
  ) {
    return BOT_RESPONSES.thanks[0];
  }

  const defaults = BOT_RESPONSES.default;
  return defaults[Math.floor(Math.random() * defaults.length)];
}

function TypingIndicator() {
  return (
    <div className="chat-typing">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </div>
  );
}

function ChatMessage({ message }) {
  return (
    <div className={`chat-message ${message.sender}`}>
      <div className="chat-message-avatar">
        {message.sender === 'bot' ? '🤖' : '👤'}
      </div>
      <div className="chat-message-content">
        <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
        <span className="chat-message-time">
          {new Date(message.time).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
}

export default function WhatsApp() {
  const business = storage.getBusiness();
  const businessName = business?.name || 'Nuestro Negocio';

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: `¡Hola! 👋 Bienvenido a *${businessName}*. Soy tu asistente virtual.\n\n¿En qué puedo ayudarte hoy? Puedo:\n\n📋 Mostrarte el menú\n🕐 Decirte nuestros horarios\n📍 Darte nuestra ubicación\n📅 Ayudarte con reservaciones\n📞 Darte nuestros datos de contacto`,
      time: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: input.trim(),
      time: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = processMessage(userMessage.text, businessName);
      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response,
        time: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1500);
  };

  const handleQuickReply = (text) => {
    setInput(text);
    setTimeout(() => {
      document.getElementById('chat-input-form')?.requestSubmit();
    }, 100);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Simulador WhatsApp</h1>
          <p className="page-subtitle">
            Chatbot simulado para {businessName}
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? 'Cerrar Chat' : '💬 Abrir Chat'}
        </button>
      </div>

      <div className="whatsapp-container">
        <div className={`whatsapp-phone ${isOpen ? 'open' : ''}`}>
          <div className="whatsapp-status-bar">
            <span>WhatsApp</span>
            <span>●</span>
          </div>

          <div className="whatsapp-chat-header">
            <div className="whatsapp-chat-avatar">🤖</div>
            <div className="whatsapp-chat-info">
              <span className="whatsapp-chat-name">Asistente {businessName}</span>
              <span className="whatsapp-chat-status">en línea</span>
            </div>
          </div>

          <div className="whatsapp-messages">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isTyping && (
              <div className="chat-message bot">
                <div className="chat-message-avatar">🤖</div>
                <div className="chat-message-content">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="whatsapp-quick-replies">
            <button onClick={() => handleQuickReply('¿Cuál es el menú?')}>
              📋 Menú
            </button>
            <button onClick={() => handleQuickReply('¿Cuáles son sus horarios?')}>
              🕐 Horarios
            </button>
            <button onClick={() => handleQuickReply('¿Dónde están ubicados?')}>
              📍 Ubicación
            </button>
            <button onClick={() => handleQuickReply('Quiero hacer una reservación')}>
              📅 Reservar
            </button>
            <button onClick={() => handleQuickReply('¿Cómo puedo contactarlos?')}>
              📞 Contacto
            </button>
          </div>

          <form
            id="chat-input-form"
            className="whatsapp-input-bar"
            onSubmit={handleSend}
          >
            <input
              type="text"
              id="chat-input"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="whatsapp-send-btn" disabled={!input.trim()}>
              ➤
            </button>
          </form>
        </div>

        <div className="whatsapp-info">
          <h3>ℹ️ Acerca del Chatbot</h3>
          <p>
            Esta es una <strong>simulación</strong> del chatbot de WhatsApp que
            interactuaría con tus clientes. El bot responde automáticamente
            consultas frecuentes como menú, horarios, ubicación y reservaciones.
          </p>
          <div className="whatsapp-features">
            <div className="whatsapp-feature">
              <span>🤖</span>
              <div>
                <strong>Respuestas Automáticas</strong>
                <p>Responde las 24/7 las preguntas más frecuentes</p>
              </div>
            </div>
            <div className="whatsapp-feature">
              <span>📋</span>
              <div>
                <strong>Menú Digital</strong>
                <p>Muestra el menú completo con precios</p>
              </div>
            </div>
            <div className="whatsapp-feature">
              <span>📅</span>
              <div>
                <strong>Reservaciones</strong>
                <p>Ayuda a los clientes a reservar mesas</p>
              </div>
            </div>
            <div className="whatsapp-feature">
              <span>🙏</span>
              <div>
                <strong>Cierre Amable</strong>
                <p>Se despide con un mensaje de agradecimiento</p>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16, width: '100%' }}
            onClick={() => {
              window.open(
                `https://wa.me/521234567890?text=${encodeURIComponent(
                  `Hola! Me gustaría saber más sobre ${businessName}`
                )}`,
                '_blank'
              );
            }}
          >
            📱 Contactar por WhatsApp (Demo)
          </button>
        </div>
      </div>
    </div>
  );
}
