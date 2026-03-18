import "./style.css";

import type { Transaction } from "./types.ts";

let transactions: Transaction[] = [];
const app = document.querySelector("#app") as HTMLElement;

// creamos una función para renderizar el encabezado
const renderHeader = () => {
  // verificamos que app no sea null
  if (!app) return;
  app.innerHTML = `
   <h1 class="text-3xl font-bold text-slate-900 mb-8">Eco-track: Finanzas Inteligentes</h1>
  `;
};

const renderBalance = () => {
  // Verificamos que app no sea null
  if (!app) return;

  //Usamos += para sumar al header
  app.innerHTML += `
   <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
     <p class="text-sm  text-slate-500 uppercase font-semibold">Saldo Total</p>
     <h2 class="text-2xl font-bold text-slate-800">$0.00</h2>
     </div> 

     <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
     <p class="text-sm text-slate-500 uppercase font-semibold">Ingresos</p>
     <h2 class="text-2xl font-bold text-slate-800">$0.00</h2> 
     </div>

     <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-rose-500">
     <p class="text-sm text-slate-500 uppercase font-semibold">Egresos</p>
     <h2 class="text-2xl font-bold text-slate-800">$0.00</h2>
     </div>

     </div>
  `;
};

// Funcion paa el formularrio.
const renderForm = () => {
  // Verificamos que app no sea null
  if (!app) return;

  //Usamos += para sumar al header.
  app.innerHTML += `
   <form id="transaction-form" class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-8">
   <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
   
   <div class="flex flex-col gap-2">
   <label class="text-sm font-bold text-slate-700">Descripción</label>
   <input type="text"id="description" placeholder="Ej: Comida" class="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
   </div>

   <div class="flex flex-col gap-2">
   <label class="text-sm font-bold text-slate-700">Cantidad</label>
   <input type="number" id="amount" placeholder="$0.00" class="p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
   </div>
   
   <div class="flex flex-col gap-2 md:col-span-2">
   <label class="text-sm font-bold text-slate-700">Type</label>
   <select id="type" class="p-2 border border-slate-200 text-sm font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500">
   <option value="expense">Gastos</option>
   <option value="income">Ingresos</option>
   </select>
   </div> 

   </div>
   
   <button type="submit" class="w-full mt-6 bg-slate-900 text-white py-2 rounded-lg hover:bg-slate-800 cursor-pointer">Agregar Transacción</button>
   </form>
   `;
};

// INICIALIZACION:
renderHeader();
renderBalance();
renderForm();
