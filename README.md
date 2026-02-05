# 🐍 Eco Snake: O Jogo da Cobrinha Sustentável

Bem-vindo ao Eco Snake! Uma releitura moderna e educativa do clássico jogo da cobrinha, desenvolvida com o objetivo de promover a conscientização ambiental de forma divertida e interativa.

## Sobre o Jogo

Eco Snake desafia os jogadores a controlar uma cobra que precisa coletar diferentes tipos de resíduos recicláveis, seguindo uma legenda de cores que corresponde ao tipo de material que deve ser "comido". Cada item correto aumenta a pontuação e o tamanho da cobra, enquanto erros podem levar ao fim do jogo. A dificuldade aumenta progressivamente com os níveis, introduzindo mais itens e desafios.

O projeto conta com autenticação de usuários, permitindo que os jogadores salvem seu progresso (funcionalidade futura) e aprendam mais sobre sustentabilidade.

## 🌎 Conscientização Ambiental e ODS

O principal objetivo do Eco Snake vai além do entretenimento. Buscamos ser uma ferramenta de **conscientização** sobre temas cruciais como:

* **Coleta Seletiva e Reciclagem**: O núcleo do jogo é ensinar de forma prática quais materiais (papel, plástico, metal, vidro, orgânico) são recicláveis e a importância de seu descarte correto. Ao associar cores a tipos de resíduos, o jogador internaliza essa diferenciação.
* **Impacto Ambiental**: O jogo sutilmente demonstra como ações individuais (coletar o lixo correto) contribuem para um ambiente mais limpo e sustentável.
* **Objetivos de Desenvolvimento Sustentável (ODS) da ONU**: O Eco Snake foi pensado para se alinhar com vários ODS, incluindo:
    * **ODS 4 (Educação de Qualidade)**: Promovendo aprendizado sobre sustentabilidade.
    * **ODS 11 (Cidades e Comunidades Sustentáveis)**: Incentivando práticas que tornam os ambientes urbanos mais limpos.
    * **ODS 12 (Consumo e Produção Responsáveis)**: Educando sobre o ciclo de vida dos materiais e a importância da gestão de resíduos.
    * **ODS 13 (Ação Contra a Mudança Global do Clima)**: Destacando como a reciclagem e a correta destinação do lixo ajudam a mitigar os impactos climáticos.

Acreditamos que, ao transformar o aprendizado em uma experiência lúdica, podemos inspirar jogadores de todas as idades a adotarem hábitos mais ecológicos e a se tornarem agentes de mudança em suas comunidades.

## 🚀 Tecnologias Utilizadas

* **Frontend**: React com Vite
* **Autenticação**: Firebase Authentication
* **Lógica do Jogo**: HTML5 Canvas e JavaScript puro
* **Estilização**: CSS3

## 🛠️ Como Executar o Projeto Localmente

Para executar este projeto em sua máquina local, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO_AQUI]
    cd ecosnake-login 
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```
    ou, se você usa Yarn:
    ```bash
    yarn install
    ```

3.  **Configure o Firebase:**
    * Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
    * Adicione um aplicativo da web ao seu projeto Firebase.
    * Copie as credenciais de configuração do Firebase (o objeto `firebaseConfig`).
    * Crie um arquivo `src/services/firebase.js` (se já não existir com o conteúdo correto do Canvas) e cole suas credenciais lá, similar a este exemplo:
      ```javascript
      import { initializeApp } from "firebase/app";
      import { getFirestore } from "firebase/firestore"; // Se for usar Firestore
      import { getAuth } from "firebase/auth";       // Para Autenticação

      const firebaseConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
      };

      // Inicializa o Firebase
      const app = initializeApp(firebaseConfig);

      // Exporta os serviços que você vai usar
      const db = getFirestore(app); // Exemplo para Firestore
      const auth = getAuth(app);   // Para Autenticação

      export { app, auth, db };
      ```
    * Certifique-se de habilitar a "Autenticação por e-mail/senha" e "Google" como provedores de login no seu console do Firebase.


4.  **⚙️ Configuração Local:**
    Este projeto utiliza o Firebase. Para rodar localmente, siga os passos:
    * Crie um arquivo chamado `.env` na raiz do projeto.
    * Copie o conteúdo abaixo e cole no seu arquivo `.env`:
    ```javascript
    VITE_FIREBASE_API_KEY=sua_chave_aqui
    VITE_FIREBASE_AUTH_DOMAIN=seu_dominio_aqui
    VITE_FIREBASE_PROJECT_ID=seu_id_aqui
    VITE_FIREBASE_STORAGE_BUCKET=seu_bucket_aqui
    VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id_aqui
    VITE_FIREBASE_APP_ID=seu_app_id_aqui
    VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id_aqui
    ```
    * Substitua os valores `sua/seu_aqui` pelas suas credenciais do Console do Firebase.
 
5.  **Execute o projeto:**
    ```bash
    npm run dev
    ```
    ou
    ```bash
    yarn dev
    ```
    O projeto estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).