/**
 * STEP 1: CONFIGURACIÓN E IMPORTACIONES
 */
import "./style.css";
import type { Transaction } from "./types.ts";

/**
 * STEP 2: ESTADO GLOBAL
 */
// Cargamos datos de localStorage o iniciamos array vacío.
let allTransactions: Transaction[] = JSON.parse(
  localStorage.getItem("transactions") || "[]",
);

// Nuestro "semáforo" de edición.
let editingId: string | null = null;

const app = document.querySelector("#app") as HTMLElement;

/**
 * STEP 3: FUNCIONES DE UTILIDAD Y UI
 */

// CORRECCIÓN: Nombre corregido de 'curreny' a 'currency'.
// Este objeto es el estándar profesional para manejar dinero.
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const saveToLocalStorage = () => {
  localStorage.setItem("transactions", JSON.stringify(allTransactions));
};

const renderHeader = () => {
  if (!app) return;
  app.innerHTML = `
   <h1 class="text-3xl font-bold text-slate-900 mb-8">Eco-track: Finanzas Inteligentes</h1>
  `;
};

const renderBalance = () => {
  if (!app) return;
  // Definimos la estructura base. Los IDs nos permitirán actualizar los valores sin redibujar todo el HTML.
  app.innerHTML += `
   <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
     <p class="text-sm text-slate-500 uppercase font-semibold">Saldo Total</p>
     <h2 id="balance-total" class="text-2xl font-bold text-slate-800">$0.00</h2>
     </div> 

     <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
     <p class="text-sm text-slate-500 uppercase font-semibold">Ingresos</p>
     <h2 id="income-total" class="text-2xl font-bold text-slate-800">$0.00</h2> 
     </div>

     <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-rose-500">
     <p class="text-sm text-slate-500 uppercase font-semibold">Egresos</p>
     <h2 id="expense-total" class="text-2xl font-bold text-slate-800">$0.00</h2>
     </div>
   </div>
  `;
};

const renderForm = () => {
  if (!app) return;
  app.innerHTML += `
   <form id="transaction-form" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
       <div class="flex flex-col gap-2">
         <label for="description" class="text-sm font-bold text-slate-700">Descripción</label>
         <input type="text" id="description" placeholder="Ej: Comida" 
                class="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
       </div>
       <div class="flex flex-col gap-2">
         <label for="amount" class="text-sm font-bold text-slate-700">Cantidad</label>
         <input type="number" id="amount" placeholder="$0.00" 
                class="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
       </div>
       <div class="flex flex-col gap-2 md:col-span-2">
         <label class="text-sm font-bold text-slate-700">Tipo</label>
         <select id="type" class="p-2 border border-slate-200 text-sm font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer">
           <option value="expense">Gasto</option>
           <option value="income">Ingreso</option>
         </select>
       </div> 
     </div>
     <button type="submit" class="w-full mt-6 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer font-bold">
       Agregar Transacción
     </button>
   </form>
   <div id="list-container" class="mt-8 flex flex-col gap-4"></div>
   `;
};

/**
 * STEP 4: LÓGICA DE EVENTOS
 */
// CORRECCIÓN: Nombre corregido de 'setupEvenlisteners' a 'setupEventListeners'.
const setupEventListeners = () => {
  const form = document.querySelector<HTMLFormElement>("#transaction-form");

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const descriptionInput =
      document.querySelector<HTMLInputElement>("#description");
    const amountInput = document.querySelector<HTMLInputElement>("#amount");
    const typeInput = document.querySelector<HTMLSelectElement>("#type");
    const amount = Number(amountInput?.value);

    // Validaciones de seguridad.
    if (!descriptionInput?.value.trim() || !typeInput?.value || amount <= 0) {
      alert("Por favor, introduce una descripción y una cantidad válida.");
      return;
    }

    if (editingId) {
      // MODO EDICIÓN: Buscamos el índice para reemplazar el objeto viejo.
      const index = allTransactions.findIndex((t) => t.id === editingId);
      if (index !== -1) {
        allTransactions[index] = {
          ...allTransactions[index], // Mantenemos ID y Fecha originales.
          description: descriptionInput.value.trim(),
          amount,
          type: typeInput.value as "expense" | "income",
        };
      }
      editingId = null; // Salimos del modo edición.

      // Restauramos el botón a su estado original (Negro).
      const submitButton = form.querySelector<HTMLButtonElement>(
        'button[type="submit"]',
      );
      if (submitButton) {
        submitButton.innerText = "Agregar Transacción";
        // CORRECCIÓN: Usamos amber-400 que es el que pusimos en prepareEdit.
        submitButton.classList.replace("bg-amber-400", "bg-slate-900");
      }
    } else {
      // MODO CREACIÓN.
      const newTransaction: Transaction = {
        id: crypto.randomUUID(),
        description: descriptionInput.value.trim(),
        amount,
        type: typeInput.value as "expense" | "income",
        category: "General",
        date: new Date().toLocaleDateString(),
      };
      allTransactions.push(newTransaction);
    }

    updateBalance();
    renderList();
    form.reset();
    saveToLocalStorage();
  });
};

/**
 * STEP 5: CÁLCULOS MATEMÁTICOS
 */
const updateBalance = () => {
  const incomeTotal = allTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenseTotal = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  const balanceTotal = incomeTotal - expenseTotal;

  const balanceElement = document.querySelector<HTMLElement>("#balance-total");
  const incomeElement = document.querySelector<HTMLElement>("#income-total");
  const expenseElement = document.querySelector<HTMLElement>("#expense-total");

  // CORRECCIÓN: Aplicamos el currencyFormatter para que los totales se vean profesionales.
  if (balanceElement)
    balanceElement.innerText = currencyFormatter.format(balanceTotal);
  if (incomeElement)
    incomeElement.innerText = currencyFormatter.format(incomeTotal);
  if (expenseElement)
    expenseElement.innerText = currencyFormatter.format(expenseTotal);
};

/**
 * STEP 6: HISTORIAL VISUAL
 */
const renderList = () => {
  const listContainer =
    document.querySelector<HTMLDivElement>("#list-container");
  if (!listContainer) return;

  listContainer.innerHTML = "";

  if (allTransactions.length === 0) {
    listContainer.innerHTML = `<p class="text-center text-slate-500 py-8 font-bold">No hay transacciones aún.</p>`;
    return;
  }

  listContainer.innerHTML = allTransactions
    .map(
      (t) => `
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-b border-slate-100 group">
        <div class="flex items-center gap-4">
          <button onclick="prepareEdit('${t.id}')" class="opacity-0 group-hover:opacity-100 text-blue-500 hover:scale-110 transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button onclick="deleteTransaction('${t.id}')" class="opacity-0 group-hover:opacity-100 text-rose-500 hover:scale-110 transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
          <div>
            <p class="font-bold text-slate-800">${t.description}</p>
            <p class="text-sm text-slate-500">${t.date}</p>
          </div>
        </div>
        <span class="font-bold ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}">
          ${t.type === "income" ? "+" : "-"} ${currencyFormatter.format(t.amount)}
        </span>
      </div>
    `,
    )
    .join("");
};

/**
 * FUNCIONES GLOBALES (Acceso desde HTML)
 */
(window as any).deleteTransaction = (id: string) => {
  // Mejora Senior: Confirmación antes de borrar.
  if (!confirm("¿Seguro que quieres eliminar esta transacción?")) return;

  allTransactions = allTransactions.filter((t) => t.id !== id);
  renderList();
  updateBalance();
  saveToLocalStorage();
};

(window as any).prepareEdit = (id: string) => {
  const transactionToEdit = allTransactions.find((t) => t.id === id);
  if (!transactionToEdit) return;

  editingId = id;

  const descriptionInput =
    document.querySelector<HTMLInputElement>("#description");
  const amountInput = document.querySelector<HTMLInputElement>("#amount");
  const typeInput = document.querySelector<HTMLSelectElement>("#type");
  const submitButton = document.querySelector<HTMLButtonElement>(
    "#transaction-form button[type='submit']",
  );

  if (descriptionInput) descriptionInput.value = transactionToEdit.description;
  if (amountInput) amountInput.value = transactionToEdit.amount.toString();
  if (typeInput) typeInput.value = transactionToEdit.type;

  if (submitButton) {
    submitButton.innerText = "Guardar Cambios";
    submitButton.classList.replace("bg-slate-900", "bg-amber-400");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
};

/**
 * FINAL STEP: INICIALIZACIÓN
 */
renderHeader();
renderBalance();
renderForm();
setupEventListeners();
renderList();
updateBalance();
