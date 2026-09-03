import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../utils/storage';
import { BUSINESS_TYPES, SUGGESTED_PRODUCTS } from '../data/businessData';
import logoGaia from '../Img/logoGaia.jpeg';
import BusinessIcon from '../Components/BusinessIcon';

export default function Setup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      setIsAnimating(true);
      setTimeout(() => {
        setGreeting(`¡Bienvenido, ${name.trim()}! 👋`);
        setStep(1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setIsAnimating(true);
    setTimeout(() => {
      setStep(2);
      setIsAnimating(false);
    }, 300);
  };

  const handleConfirm = () => {
    const business = {
      name: name.trim(),
      type: selectedType.id,
      typeLabel: selectedType.label,
      icon: selectedType.icon,
      createdAt: new Date().toISOString(),
    };
    storage.setBusiness(business);

    const suggestedProducts = SUGGESTED_PRODUCTS[selectedType.id] || [];
    const menuWithIds = suggestedProducts.map((p, i) => ({
      ...p,
      id: `suggested_${i}_${Date.now()}`,
    }));
    storage.setMenu(menuWithIds);

    navigate('/dashboard');
    window.location.reload();
  };

  return (
    <div className="setup-container">
      <div className="setup-bg">
        <div className="setup-bg-circle c1" />
        <div className="setup-bg-circle c2" />
        <div className="setup-bg-circle c3" />
      </div>

      <div className={`setup-card ${isAnimating ? 'fade-out' : 'fade-in'}`}>
        {step === 0 && (
          <div className="setup-step">
            <img src={logoGaia} alt="Gaia Dynamics" className="setup-logo" />
            <h1 className="setup-title">Gaia Dynamics</h1>
            <p className="setup-subtitle">
              Tu sistema inteligente de gestión de negocios
            </p>
            <form onSubmit={handleNameSubmit} className="setup-form">
              <label className="setup-label">
                ¿Cómo se llama tu empresa?
              </label>
              <input
                type="text"
                className="setup-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Mi Cafetería, El Rincón del Sabor..."
                autoFocus
              />
              <button
                type="submit"
                className="setup-btn primary"
                disabled={!name.trim()}
              >
                Continuar →
              </button>
            </form>
          </div>
        )}

        {step === 1 && (
          <div className="setup-step">
            <div className="setup-greeting">
              <h1>{greeting}</h1>
              <p className="setup-subtitle">
                Ahora dinos, ¿qué tipo de negocio tienes?
              </p>
            </div>
            <div className="business-types-grid">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type.id}
                  className={`business-type-card ${
                    selectedType?.id === type.id ? 'selected' : ''
                  }`}
                  onClick={() => handleTypeSelect(type)}
                >
                  <span className="business-type-icon">
                    <BusinessIcon type={type.icon} />
                  </span>
                  <span className="business-type-label">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedType && (
          <div className="setup-step">
            <div className="setup-confirm-header">
              <span className="setup-confirm-icon">
                <BusinessIcon type={selectedType.icon} />
              </span>
              <h1>¡Genial! Configuración de {selectedType.label}</h1>
              <p className="setup-subtitle">
                Se han sugerido{' '}
                <strong>
                  {SUGGESTED_PRODUCTS[selectedType.id]?.length || 0} productos
                </strong>{' '}
                para tu menú. Podrás editarlos, agregar más o eliminar los que
                no necesites.
              </p>
            </div>
            <div className="setup-preview-products">
              {SUGGESTED_PRODUCTS[selectedType.id]?.slice(0, 6).map(
                (product, i) => (
                  <div key={i} className="preview-product">
                    <span className="preview-product-name">
                      {product.name}
                    </span>
                    <span className="preview-product-price">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                )
              )}
              {(SUGGESTED_PRODUCTS[selectedType.id]?.length || 0) > 6 && (
                <div className="preview-more">
                  +{(SUGGESTED_PRODUCTS[selectedType.id]?.length || 0) - 6}{' '}
                  productos más...
                </div>
              )}
            </div>
            <button className="setup-btn primary large" onClick={handleConfirm}>
              ⚡ ¡Empezar a Usar Gaia Dynamics!
            </button>
          </div>
        )}
      </div>

      <div className="setup-steps-indicator">
        {[0, 1, 2].map((s) => (
          <div
            key={s}
            className={`step-dot ${step >= s ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
