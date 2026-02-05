import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'; 
import './pagesCss/AboutPage.css'; 
import '../components/Layout/Header/Header.css';
import '../components/Layout/Footer/Footer.css';
import '../components/ui/Button/Button.css';

const AboutPage = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentOds, setCurrentOds] = useState(null);

  const odsInfo = {
    "ods4.png": {
      titulo: "ODS 4 - Educação de Qualidade",
      descricao: "Assegurar a educação inclusiva, equitativa e de qualidade, e promover oportunidades de aprendizagem ao longo da vida para todos.",
      conexaoJogo: "Nosso jogo oferece uma experiência educativa e acessível, ensinando sobre reciclagem de maneira lúdica e envolvente. Ao separar corretamente os resíduos no jogo, os jogadores acumulam pontos que representam o conhecimento adquirido sobre práticas sustentáveis, promovendo aprendizado contínuo e inclusivo para todas as idades.",
      imagemJogo: "/assets/imgs/exemplo2.png", 
      dicasReciclagem: [
        "Ensine as crianças e adultos sobre a importância da reciclagem.",
        "Engaje-se em programas de educação ambiente na sua comunidade.",
        "Divulgue informações sobre a correta separação de resíduos."
      ]
    },
    "ods11.png": {
      titulo: "ODS 11 - Cidades e Comunidades Sustentáveis",
      descricao: "Tornar as cidades e os assentamentos inclusivos, seguros, resilientes e sustentáveis.",
      conexaoJogo: "No jogo, a cobrinha limpa a cidade virtual, representando como pequenas ações individuais contribuem para ambientes urbanos mais limpos e sustentáveis.",
      imagemJogo: "/assets/imgs/exemplo1.png",
      dicasReciclagem: [
        "Utilize os pontos de coleta seletiva de sua cidade",
        "Participe de mutirões de limpeza urbana",
        "Denuncie descarte irregular de lixo em sua comunidade"
      ]
    },
    "ods12.png": {
      titulo: "ODS 12 - Consumo e Produção Responsáveis",
      descricao: "Assegurar padrões de produção e de consumo sustentáveis.",
      conexaoJogo: "No jogo a cobrinha coleta itens que devem ser descartados corretamente, ensinando sobre consumo consciente e a escolha de produtos com menor impacto ambiental.",
      imagemJogo: "/assets/imgs/exemplo3.png", 
      dicasReciclagem: [
        "Prefira produtos com embalagens recicláveis",
        "Reduza o consumo de descartáveis",
        "Repense suas compras - você realmente precisa disso?"
      ]
    },
    "ods13.png": {
      titulo: "ODS 13 - Ação Contra a Mudança Global do Clima",
      descricao: "Tomar medidas urgentes para combater a mudança do clima e seus impactos.",
      conexaoJogo: "No jogo, separar o lixo corretamente ajuda a reduzir resíduos em aterros, diminuindo emissões de gases que agravam o clima.",
      imagemJogo: "/assets/imgs/exemplo5.jpg", 
      dicasReciclagem: [
        "Recicle para reduzir a extração de matéria-prima virgem",
        "Composte resíduos orgânicos para reduzir metano nos aterros",
        "Prefira produtos com menor pegada de carbono"
      ]
    }
  };

  const handleOdsImageClick = (odsKey, imgSrc) => {
    const info = odsInfo[odsKey];
    if (info) {
      setCurrentOds({ ...info, imgSrc });
      setModalOpen(true);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentOds(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add('modal-open-no-scroll');
    } else {
      document.body.classList.remove('modal-open-no-scroll');
    }

    const handleClickOutside = (event) => {
      if (modalOpen && event.target.classList.contains('modal')) {
        closeModal();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [modalOpen]);

  return (
    <>
      {/* Cabeçalho */}
      <header className="app-header">
        <div className="app-header-content">
          <h1>Sobre o projeto</h1>
          <button onClick={handleLogout} className="app-header-inicio-btn"> ↩ Voltar</button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="about-page-container">
        <article className="about-page-card">

          {/* Seção Missão */}
          <section className="mission-section">
            <div className="mission-container">
              <div className="mission-header">
                <h2><span className="highlight">Nossa Missão</span></h2>
              </div>

              <div className="mission-content">
                <p className="mission-lead">O Eco Snake nasceu com o propósito de transformar a educação ambiental por meio da tecnologia e da diversão. Acreditamos que a sustentabilidade pode ser aprendida de maneira divertida, acessível e tão cativante quanto um jogo viciante!</p>
                <div className="mission-card">
                  <div className="mission-card-content">
                    <h3>Por que jogar o EcoSnake?</h3>
                    <p>Inspirado no clássico jogo da cobrinha, o EcoSnake foi criado para transformar diversão em aprendizado! Mergulhe nessa experiência interativa que:</p>
                    <ul className="mission-list">
                      <li>Ensina a separação correta de resíduos de forma intuitiva</li>
                      <li>Mostra na prática, o impacto positivo da reciclagem no meio ambiente.</li>
                      <li>Torna o aprendizado sobre sustentabilidade tão divertido quanto jogar seu jogo favorito.</li>
                      <li>Estimula o jogador a se tornar um agente de transformação no mundo real</li>
                    </ul>
                  </div>
                  <div className="mission-card-image">
                    <img src="/assets/imgs/logo.png" alt="Exemplo do jogo da cobrinha sustentável" />
                  </div>
                </div>

                <div className="mission-values">
                  <h3>Valores que nos guiam:</h3>
                  <div className="values-grid">
                    <div className="value-item">
                      <div className="value-icon">🌍</div>
                      <h4>Impacto Real</h4>
                      <p>Cada ponto conquistado no jogo representa um conhecimento que pode ser aplicado na vida real.</p>
                    </div>
                    <div className="value-item">
                      <div className="value-icon">🎯</div>
                      <h4>Objetivos Claros</h4>
                      <p>Comprometimento com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU, contribuindo para um futuro mais sustentável.</p>
                    </div>
                    <div className="value-item">
                      <div className="value-icon">💡</div>
                      <h4>Inovação Contínua</h4>
                      <p>A jogabilidade evolui junto com os desafios ambientais, oferecendo sempre novas formas de aprender e se engajar.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Seção Equipe */}
          <section className="team-section">
            <h2>Conheça nossa equipe</h2>
            <div className="team-grid">
              <div className="profile">
                <img src="/assets/imgs/dallison.png" alt="Dallison Silveira" />
                <h3>Dallison Silveira</h3>
                <p>DevOps Engineering</p>
              </div>
              <div className="profile">
                <img src="/assets/imgs/thales.jpg" alt="Thales Dionizio" />
                <h3>Thales Dionizio</h3>
                <p>Desenvolvedor Full Stack</p>
              </div>
              <div className="profile">
                <img src="/assets/imgs/caio.png" alt="Caio Vinicius" />
                <h3>Caio Vinicius</h3>
                <p>Designer Front-End</p>
              </div>
              <div className="profile">
                <img src="/assets/imgs/julia.png" alt="Julia Luciano" />
                <h3>Julia Luciano</h3>
                <p>Gerente de Projeto</p>
              </div>
              <div className="profile">
                <img src="/assets/imgs/luiz.jpg" alt="Luis Felipe" />
                <h3>Luis Felipe</h3>
                <p>Desenvolvedor Back-End</p>
              </div>
              <div className="profile">
                <img src="/assets/imgs/kevin.jpg" alt="Kevin Santos" />
                <h3>Kevin Santos</h3>
                <p>Desenvolvedor Back-End</p>
              </div>
            </div>
          </section>

          {/* Seção ODS */}
          <section className="ods-section">
            <h2>Objetivos de Desenvolvimento Sustentável</h2>
            <p>Nosso Eco Snake foi criado com base nos Objetivos de Desenvolvimento Sustentável da ONU:</p>

            <div className="ods-images">
              <img src="/assets/imgs/ods4.png" alt="ODS 4 - Educação de Qualidade" onClick={() => handleOdsImageClick("ods4.png", "/assets/imgs/ods4.png")} />
              <img src="/assets/imgs/ods11.png" alt="ODS 11 - Cidades Sustentáveis" onClick={() => handleOdsImageClick("ods11.png", "/assets/imgs/ods11.png")} />
              <img src="/assets/imgs/ods12.png" alt="ODS 12 - Consumo Responsável" onClick={() => handleOdsImageClick("ods12.png", "/assets/imgs/ods12.png")} />
              <img src="/assets/imgs/ods13.png" alt="ODS 13 - Ação Climática" onClick={() => handleOdsImageClick("ods13.png", "/assets/imgs/ods13.png")} />
            </div>

            <p className="ods-link">
              Saiba mais sobre os ODS no site oficial da ONU:
              <a href="https://brasil.un.org/pt-br/sdgs" target="_blank" rel="noopener noreferrer">Objetivos de Desenvolvimento Sustentável</a>
            </p>
          </section>
        </article>
      </main>

      {/* Modal ODS */}
      {modalOpen && currentOds && (
        <div id="odsModal" className="modal-ods" style={{ display: 'block' }}>
          <div className="modal-ods-content">
            <span className="modal-ods-close" onClick={closeModal}>&times;</span>
            <h2 className="ods-details-title">{currentOds.titulo}</h2>
            <img id="ods-img" src={currentOds.imgSrc} alt="Imagem ODS" className="modal-ods-image-display" />

            <div className="ods-details">
              <p className="ods-details-description">{currentOds.descricao}</p>

              <div id="ods-game-connection" className="game-connection">
                <h3>Como esta ODS se relaciona com nosso jogo:</h3>
                <p className="game-connection-text">{currentOds.conexaoJogo}</p>
                <img id="ods-game-img" src={currentOds.imagemJogo} alt="Exemplo no jogo" className="game-example-img" />
              </div>

              <div className="recycling-info">
                <h3>Dicas de Reciclagem Relacionadas:</h3>
                <ul id="ods-recycling-tips">
                  {currentOds.dicasReciclagem.map((dica, index) => (
                    <li key={index}>{dica}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rodapé */}
      <footer className="footer">
        <p>© 2025 ProjetoA3. Todos os direitos reservados</p>
      </footer>
    </>
  );
};

export default AboutPage;