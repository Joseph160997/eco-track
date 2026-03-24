/**
 * STEP 1: CONFIGURATION & IMPORTS
 * ES: PASO 1: Configuración e importaciones
 */
import "./style.css";
import type { Transaction } from "./types.ts";

/**
 * STEP 2: GLOBAL STATE MANAGEMENT
 * ES: PASO 2: Gestión del Estado Global
 */
// EN: Parse data from LocalStorage or initialize an empty array.
// ES: Convierte los datos de LocalStorage a objeto o inicia un array vacío.
let allTransactions: Transaction[] = JSON.parse(
  localStorage.getItem("transactions") || "[]",
);

// EN: The "traffic light" for edit mode. Null means "Create Mode".
// ES: El "semáforo" para el modo edición. Null significa "Modo Creación".
let editingId: string | null = null;

const app = document.querySelector("#app") as HTMLElement;

/**
 * STEP 3: UTILITIES & UI RENDERERS
 * ES: PASO 3: Utilidades y Renderizado de Interfaz
 */

// EN: Setup the standard US currency format.
// ES: Configura el formato estándar de moneda de EE. UU.
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

// EN: Saves the current RAM state to the hard drive.
// ES: Guarda el estado actual de la RAM en el disco duro.
const saveToLocalStorage = () => {
  localStorage.setItem("transactions", JSON.stringify(allTransactions));
};

const renderHeader = () => {
  // EN: Guard clause: Exit if app container is missing.
  // ES: Cláusula de seguridad: Salir si no existe el contenedor app.
  if (!app) return;
  app.innerHTML = `
   <h1 class="text-3xl font-bold text-slate-900 mb-8">Eco-track: Smart Finances</h1>
  `;
};

const renderBalance = () => {
  if (!app) return;
  // EN: Use += to append HTML without destroying the header.
  // ES: Usamos += para añadir HTML sin destruir el encabezado.
  app.innerHTML += `
   <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
     <p class="text-sm text-slate-500 uppercase font-semibold">Total Balance</p>
     <h2 id="balance-total" class="text-2xl font-bold text-slate-800">$0.00</h2>
     </div> 

     <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
     <p class="text-sm text-slate-500 uppercase font-semibold">Incomes</p>
     <h2 id="income-total" class="text-2xl font-bold text-slate-800">$0.00</h2> 
     </div>

     <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-rose-500">
     <p class="text-sm text-slate-500 uppercase font-semibold">Expenses</p>
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
         <label for="description" class="text-sm font-bold text-slate-700">Description</label>
         <input type="text" id="description" placeholder="Ex: Groceries" 
                class="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
       </div>
       <div class="flex flex-col gap-2">
         <label for="amount" class="text-sm font-bold text-slate-700">Amount</label>
         <input type="number" id="amount" placeholder="$0.00" step="0.01"
                class="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
       </div>
       <div class="flex flex-col gap-2 md:col-span-2">
         <label class="text-sm font-bold text-slate-700">Type</label>
         <select id="type" class="p-2 border border-slate-200 text-sm font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer">
           <option value="expense">Expense</option>
           <option value="income">Income</option>
         </select>
       </div> 
     </div>
     <button type="submit" class="w-full mt-6 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer font-bold">
       Add Transaction
     </button>
   </form>
   <div id="list-container" class="mt-8 flex flex-col gap-4"></div>
   `;
};

/**
 * STEP 4: EVENT LISTENERS & LOGIC
 * ES: PASO 4: Escuchadores de Eventos y Lógica
 * EN: Captures user interaction and modifies the global state.
 * ES: Captura la interacción del usuario y modifica el estado global.
 */
const setupEventListeners = () => {
  const form = document.querySelector<HTMLFormElement>("#transaction-form");

  // EN: 1. Listen for the form submission. | ES: 1. Escuchar el envío del formulario.
  form?.addEventListener("submit", (e) => {
    e.preventDefault(); // EN: Stop page reload. | ES: Detener la recarga de la página.

    // EN: 2. Capture raw data from inputs. | ES: 2. Capturar datos crudos de los inputs.
    const descriptionInput =
      document.querySelector<HTMLInputElement>("#description");
    const amountInput = document.querySelector<HTMLInputElement>("#amount");
    const typeInput = document.querySelector<HTMLSelectElement>("#type");
    const amount = Number(amountInput?.value);

    // EN: 3. Security Check (Validation). | ES: 3. Verificación de Seguridad (Validación).
    if (!descriptionInput?.value.trim() || !typeInput?.value || amount <= 0) {
      alert("Please enter a valid description and amount.");
      return;
    }

    // EN: 4. Check the state: Are we editing or creating?
    // ES: 4. Revisar el estado: ¿Estamos editando o creando?
    if (editingId) {
      // EN: EDIT MODE | ES: MODO EDICIÓN
      const index = allTransactions.findIndex((t) => t.id === editingId);
      if (index !== -1) {
        // EN: Overwrite the specific array item. | ES: Sobrescribir el elemento específico del array.
        allTransactions[index] = {
          ...allTransactions[index],
          description: descriptionInput.value.trim(),
          amount,
          type: typeInput.value as "expense" | "income",
        };
      }
      editingId = null; // EN: Reset the traffic light. | ES: Reiniciar el semáforo.

      // EN: Restore UI button to default state. | ES: Restaurar el botón a su estado original.
      const submitButton = form.querySelector<HTMLButtonElement>(
        'button[type="submit"]',
      );
      if (submitButton) {
        submitButton.innerText = "Add Transaction";
        submitButton.classList.replace("bg-amber-400", "bg-slate-900");
      }
    } else {
      // EN: CREATE MODE | ES: MODO CREACIÓN
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

    // EN: 5. SYNCHRONIZE EVERYTHING | ES: 5. SINCRONIZAR TODO
    updateBalance(); // <-- EN: Update math boxes | ES: Actualizar cuadros matemáticos
    renderList(); // <-- EN: Redraw history list | ES: Redibujar lista de historial
    form.reset(); // <-- EN: Clear input fields | ES: Limpiar campos de texto
    saveToLocalStorage(); // <-- EN: Save array to drive | ES: Guardar array en el disco
  });
};

/**
 * STEP 5: MATH & CALCULATIONS
 * ES: PASO 5: Matemáticas y Cálculos
 * EN: Filters data and injects the final numbers into the HTML.
 * ES: Filtra datos e inyecta los números finales en el HTML.
 */
const updateBalance = () => {
  // EN: 1. Filter and sum incomes. | ES: 1. Filtrar y sumar ingresos.
  const incomeTotal = allTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  // EN: 2. Filter and sum expenses. | ES: 2. Filtrar y sumar gastos.
  const expenseTotal = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  // EN: 3. Calculate final balance. | ES: 3. Calcular saldo final.
  const balanceTotal = incomeTotal - expenseTotal;

  // EN: 4. Select the HTML targets. | ES: 4. Seleccionar los objetivos HTML.
  const balanceElement = document.querySelector<HTMLElement>("#balance-total");
  const incomeElement = document.querySelector<HTMLElement>("#income-total");
  const expenseElement = document.querySelector<HTMLElement>("#expense-total");

  // EN: 5. Inject formatted text. | ES: 5. Inyectar texto formateado.
  if (balanceElement)
    balanceElement.innerText = currencyFormatter.format(balanceTotal);
  if (incomeElement)
    incomeElement.innerText = currencyFormatter.format(incomeTotal);
  if (expenseElement)
    expenseElement.innerText = currencyFormatter.format(expenseTotal);
};

/**
 * STEP 6: VISUAL HISTORY RENDERER
 * ES: PASO 6: Renderizador de Historial Visual
 * EN: Transforms the array into HTML blocks using .map().
 * ES: Transforma el array en bloques HTML usando .map().
 */
const renderList = () => {
  const listContainer =
    document.querySelector<HTMLDivElement>("#list-container");
  if (!listContainer) return;

  // EN: 1. Clear previous list. | ES: 1. Limpiar lista anterior.
  listContainer.innerHTML = "";

  // EN: 2. Handle empty state. | ES: 2. Manejar estado vacío.
  if (allTransactions.length === 0) {
    listContainer.innerHTML = `<p class="text-center text-slate-500 py-8 font-bold">No transactions yet.</p>`;
    return;
  }

  // EN: 3. Map objects to HTML strings and join them.
  // ES: 3. Mapear objetos a strings HTML y unirlos.
  listContainer.innerHTML = allTransactions
    .map(
      (t) => `
      <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-b border-slate-100 group">
        <div class="flex items-center gap-4">
          <button onclick="prepareEdit('${t.id}')" class="opacity-100 lg:opacity-0 group-hover:opacity-100 text-blue-500 hover:scale-110 transition-all cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button onclick="deleteTransaction('${t.id}')" class="opacity-100 lg:opacity-0 group-hover:opacity-100 text-rose-500 hover:scale-110 transition-all cursor-pointer">
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
    .join(""); // <-- EN: Concatenate strings | ES: Concatenar strings
};

/**
 * GLOBAL FUNCTIONS
 * ES: FUNCIONES GLOBALES
 * EN: Attached to the window so inline HTML onclick="" can find them.
 * ES: Adjuntas a window para que los onclick="" del HTML las encuentren.
 */
(window as any).deleteTransaction = (id: string) => {
  // EN: 1. Confirm deletion. | ES: 1. Confirmar eliminación.
  if (!confirm("Are you sure you want to delete this transaction?")) return;

  // EN: 2. Filter out the deleted item. | ES: 2. Filtrar el elemento eliminado.
  allTransactions = allTransactions.filter((t) => t.id !== id);

  // EN: 3. SYNCHRONIZE | ES: 3. SINCRONIZAR
  renderList(); // <-- EN: Redraw list | ES: Redibujar lista
  updateBalance(); // <-- EN: Recalculate totals | ES: Recalcular totales
  saveToLocalStorage(); // <-- EN: Save to disk | ES: Guardar en disco
};

(window as any).prepareEdit = (id: string) => {
  // EN: 1. Find the target object. | ES: 1. Encontrar el objeto objetivo.
  const transactionToEdit = allTransactions.find((t) => t.id === id);
  if (!transactionToEdit) return;

  // EN: 2. Turn on the edit traffic light. | ES: 2. Encender el semáforo de edición.
  editingId = id;

  // EN: 3. Grab the inputs. | ES: 3. Atrapar los inputs.
  const descriptionInput =
    document.querySelector<HTMLInputElement>("#description");
  const amountInput = document.querySelector<HTMLInputElement>("#amount");
  const typeInput = document.querySelector<HTMLSelectElement>("#type");
  const submitButton = document.querySelector<HTMLButtonElement>(
    "#transaction-form button[type='submit']",
  );

  // EN: 4. Populate the inputs with old data. | ES: 4. Rellenar los inputs con datos viejos.
  if (descriptionInput) descriptionInput.value = transactionToEdit.description;
  if (amountInput) amountInput.value = transactionToEdit.amount.toString();
  if (typeInput) typeInput.value = transactionToEdit.type;

  // EN: 5. Change button appearance. | ES: 5. Cambiar apariencia del botón.
  if (submitButton) {
    submitButton.innerText = "Save Changes";
    submitButton.classList.replace("bg-slate-900", "bg-amber-400");
  }

  // EN: 6. Scroll to top automatically. | ES: 6. Desplazar hacia arriba automáticamente.
  window.scrollTo({ top: 0, behavior: "smooth" });
};

/**
 * FINAL STEP: INITIALIZATION
 * ES: PASO FINAL: Inicialización
 * EN: The entry point of the app. This runs once when the page loads.
 * ES: El punto de entrada de la app. Esto corre una vez al cargar la página.
 */
renderHeader(); // <-- EN: Draws Title | ES: Dibuja el título
renderBalance(); // <-- EN: Draws math boxes | ES: Dibuja cuadros matemáticos
renderForm(); // <-- EN: Draws form | ES: Dibuja formulario
setupEventListeners(); // <-- EN: Activates button | ES: Activa el botón
renderList(); // <-- EN: Fills list from RAM | ES: Llena lista desde la RAM
updateBalance(); // <-- EN: Fills math boxes | ES: Llena cuadros matemáticos
