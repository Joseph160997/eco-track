/**
 * STEP 1: CONFIGURACIÓN E IMPORTACIONES
 * Traemos los estilos globales y las reglas (tipos) que debe seguir nuestro código.
 */
import "./style.css";
import type { Transaction } from "./types.ts";

/**
 * STEP 2: ESTADO GLOBAL Y SELECCIÓN DE BASE
 * Definimos dónde vivirá la información y en qué parte del HTML vamos a "dibujar" nuestra App.
 */
// allTransactions: Es nuestra base de datos temporal en memoria.
let allTransactions: Transaction[] = JSON.parse(
  localStorage.getItem("transactions") || "[]",
);

// app: El contenedor principal de nuestra aplicación en el index.html.
const app = document.querySelector("#app") as HTMLElement;

/**
 * STEP 3: FUNCIONES DE RENDERIZADO (UI)
 * Estas funciones se encargan exclusivamente de "pintar" el HTML.
 */

//Creamos una funcion para guardar las transacciones en el localStorage.
const saveToLocalStorage = () => {
  localStorage.setItem("transactions", JSON.stringify(allTransactions));
};

// creamos una función para renderizar el encabezado
const renderHeader = () => {
  // verificamos que app no sea null (Cláusula de guarda para evitar errores)
  if (!app) return;

  // Inyectamos el título principal con estilos de Tailwind
  app.innerHTML = `
   <h1 class="text-3xl font-bold text-slate-900 mb-8">Eco-track: Finanzas Inteligentes</h1>
  `;
};

const renderBalance = () => {
  // Verificamos que app no sea null antes de intentar modificarlo
  if (!app) return;

  // Usamos += para sumar al header sin borrar lo anterior.
  // Aquí definimos los IDs que usaremos luego para actualizar los números.
  app.innerHTML += `
   <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
     <p class="text-sm  text-slate-500 uppercase font-semibold">Saldo Total</p>
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

// Funcion paa el formularrio.
const renderForm = () => {
  // Verificamos que app no sea null
  if (!app) return;

  // Usamos += para añadir el formulario debajo del balance.
  // Usamos un Grid de 2 columnas para que en PC se vea más organizado.
  app.innerHTML += `
   <form id="transaction-form" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
       
       <div class="flex flex-col gap-2">
         <label class="text-sm font-bold text-slate-700">Descripción</label>
         <input type="text" id="description" placeholder="Ej: Comida" 
                class="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
       </div>

       <div class="flex flex-col gap-2">
         <label class="text-sm font-bold text-slate-700">Cantidad</label>
         <input type="number" id="amount" placeholder="$0.00" 
                class="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
       </div>
       
       <div class="flex flex-col gap-2 md:col-span-2">
         <label class="text-sm font-bold text-slate-700">Type</label>
         <select id="type" class="p-2 border border-slate-200 text-sm font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
           <option value="expense">Gastos</option>
           <option value="income">Ingresos</option>
         </select>
       </div> 

     </div>
     
     <button type="submit" class="w-full mt-6 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 cursor-pointer">
       Agregar Transacción
     </button>
   </form>
   
   <div id="list-container" class="mt-8 flex flex-col gap-4"></div>
   `;
};

/**
 * STEP 4: LÓGICA DE EVENTOS (INTERACTIVIDAD)
 * Aquí es donde capturamos lo que el usuario hace.
 */

// Funcion para el formulario.
const setupEvenlisteners = () => {
  const form = document.querySelector<HTMLFormElement>("#transaction-form");

  form?.addEventListener("submit", (e) => {
    // e.preventDefault(): Detenemos la recarga automática del navegador.
    e.preventDefault();

    // 1. Obtenemos los datos actuales de cada input del formulario.
    const descriptionInput =
      document.querySelector<HTMLInputElement>("#description");
    const amountInput = document.querySelector<HTMLInputElement>("#amount");
    const typeInput = document.querySelector<HTMLSelectElement>("#type");

    // 2. Validacion Senior: si falta algún dato, mostramos alerta y cortamos la ejecución (return).
    if (!descriptionInput?.value || !amountInput?.value || !typeInput?.value) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    // 3. Creamos La Nueva Transaccion siguiendo nuestra Interface de TypeScript.
    const newTransaction: Transaction = {
      id: crypto.randomUUID(), // Generamos un ID único universal.
      description: descriptionInput.value,
      amount: Number(amountInput.value), // Convertimos el texto del input en un número real.
      type: typeInput?.value as "expense" | "income", // Aserción de tipo para TypeScript.
      category: "General",
      date: new Date().toLocaleDateString(), // Fecha legible actual.
    };

    // 4. Guardanos en nuestro array global de transacciones.
    allTransactions.push(newTransaction);

    // Actualizamos la interfaz inmediatamente después de guardar el dato.
    updateBalance(); // Recalcula los números de arriba.
    renderList(); // Dibuja la nueva lista de abajo.

    // 5. Limpiamos El Formulario para dejarlo listo para la siguiente entrada.
    form.reset();

    // 6. Guardamos en el localStorage.
    saveToLocalStorage();
  });
};

/**
 * STEP 5: CÁLCULOS MATEMÁTICOS
 * Procesa la información del array para obtener resultados útiles.
 */

// Funcion Update Balance
const updateBalance = () => {
  // 1. Calculamos el balance filtrando y reduciendo el array.
  const incomeTotal = allTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const expenseTotal = allTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  // El saldo total es la diferencia simple.
  const balanceTotal = incomeTotal - expenseTotal;

  // 2. Seleccionamos los elementos HTML donde mostraremos los resultados.
  const balanceElement = document.querySelector<HTMLElement>("#balance-total");
  const incomeElement = document.querySelector<HTMLElement>("#income-total");
  const expenseElement = document.querySelector<HTMLElement>("#expense-total");

  // 3. Inyectamos los valores formateados con el símbolo de moneda y 2 decimales.
  if (balanceElement) balanceElement.innerText = `$${balanceTotal.toFixed(2)}`;
  if (incomeElement) incomeElement.innerText = `$${incomeTotal.toFixed(2)}`;
  if (expenseElement) expenseElement.innerText = `$${expenseTotal.toFixed(2)}`;
};

/**
 * STEP 6: HISTORIAL VISUAL
 * Mapea los objetos del array a elementos visuales de la lista.
 */

// Funcion RENDER-LIST para dibujar la lista de transacciones.
const renderList = () => {
  const listContainer =
    document.querySelector<HTMLDivElement>("#list-container");

  // 1. verificamos que listContainer no sea null antes de operar.
  if (!listContainer) return;

  // 2. Limpiamos el listContainer para evitar que se repitan los elementos viejos.
  listContainer.innerHTML = "";

  // 3. Mapeamos el array para convertir cada objeto en un bloque HTML.
  // Dentro de tu función renderList, en el .map:
  const listHTML = allTransactions
    .map(
      (t) => `
  <div class="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border-b border-slate-100 group">
    <div class="flex items-center gap-4">
      <button 
        onclick="deleteTransaction('${t.id}')"
        class="opacity-0 group-hover:opacity-100 text-rose-500 hover:scale-110 transition-all cursor-pointer"
        title="Eliminar transacción"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
      </button>
      
      <div>
        <p class="font-bold text-slate-800">${t.description}</p>
        <p class="text-sm text-slate-500">${t.date}</p>
      </div>
    </div>
    
    <span class="font-bold ${t.type === "income" ? "text-emerald-600" : "text-rose-600"}">
      ${t.type === "income" ? "+" : "-"} $${t.amount.toFixed(2)}
    </span>
  </div>
`,
    )
    .join("");

  // 4. Inyectamos el HTML generado en el contenedor.
  listContainer.innerHTML = listHTML;
};

// Funcion Para eleiminar las transacciones.(window as any).deleteTransaction = (id: string) => {
  // 1. filtramos todo el array: dejamos pasar las transacciones menos las que tenemos que eliminar.
  allTransactions = allTransactions.filter((t) => t.id !== id);

  // 2. Actualizamos la interfaz inmediatamente.
  updateBalance(); // Recalcula los números de arriba.
  renderList(); // Dibuja la nueva lista de abajo.

  // 3. Guardamos en el localStorage.
  saveToLocalStorage();
};

/**
 * FINAL STEP: INICIALIZACIÓN
 * Ejecutamos las funciones en orden secuencial para arrancar la aplicación.
 */
renderHeader();
renderBalance();
renderForm();
setupEvenlisteners();
renderList();
updateBalance();
