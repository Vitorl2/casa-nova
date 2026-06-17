/* ===================================================================
   CONEXÃO COM O FIREBASE (banco de dados na nuvem)
   ===================================================================
   Este bloco é PÚBLICO de propósito (vai no site). A segurança real
   está nas REGRAS do Firestore + no LOGIN do painel.
   Projeto: casa-nova-c6806  |  Conta: vitorsiqueira834@gmail.com
   =================================================================== */
const firebaseConfig = {
  apiKey: "AIzaSyBgYSqS6XatJSfa9gzAmgQtde91FbpOXyc",
  authDomain: "casa-nova-c6806.firebaseapp.com",
  projectId: "casa-nova-c6806",
  storageBucket: "casa-nova-c6806.firebasestorage.app",
  messagingSenderId: "327059227836",
  appId: "1:327059227836:web:56c378154138d2db43bcb9",
};

// Inicializa o app e o banco de dados
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Onde os dados ficam guardados: coleção "site", documento "dados"
const DOC_DADOS = db.collection("site").doc("dados");
