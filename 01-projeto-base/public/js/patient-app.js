
import { getPatient, listEncounters, createEncounter } from "./api.js";


const state = {
  patient: null,       
  encounters: [],      
  isLoading: true,     
  errorMessage: null,  
  formError: null      
};

const listeners = [];

export function subscribe(listener) {
  listeners.push(listener);
}

function notify() {
  const snapshot = { ...state };
  listeners.forEach((listener) => listener(snapshot));
}


export function setPatientData(patient, encounters) {
  state.patient = patient;
  state.encounters = encounters;
  state.isLoading = false;
  state.errorMessage = null;
  notify();
}

export function addEncounter(encounter) {
  state.encounters.push(encounter);
  state.formError = null; 
  notify();
}

export function setError(message) {
  state.errorMessage = message;
  state.isLoading = false;
  notify();
}

export function setFormError(message) {
  state.formError = message;
  notify();
}


function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function encounterTemplate(enc) {
  return `
    <li class="encounter-item border rounded p-3 mb-3">
      <div class="encounter-item__header">
        <span class="encounter-item__date fw-bold text-primary">Data: ${escapeHtml(enc.started_at)}</span>
      </div>
      <p class="encounter-item__complaint mt-2 mb-1">
        <strong>Queixa:</strong> ${escapeHtml(enc.chief_complaint)}
      </p>
      <p class="encounter-item__notes mb-0 text-muted">
        <strong>Conduta:</strong> ${escapeHtml(enc.notes || "Sem anotações.")}
      </p>
    </li>
  `;
}

function render(snapshot) {
  const nameEl = document.getElementById("patient-name");
  const listEl = document.getElementById("encounter-list");
  const errorEl = document.getElementById("form-error");

  if (snapshot.errorMessage) {
    nameEl.textContent = "Erro!";
    listEl.innerHTML = `<li class="alert alert-danger">${escapeHtml(snapshot.errorMessage)}</li>`;
    return;
  }

  if (snapshot.isLoading) {
    nameEl.textContent = "Carregando paciente...";
    listEl.innerHTML = "<li>Buscando histórico...</li>";
    return;
  }

  nameEl.textContent = `Prontuário: ${snapshot.patient.name}`;
  
  if (snapshot.encounters.length === 0) {
    listEl.innerHTML = "<li class='text-muted'>Nenhum atendimento registrado.</li>";
  } else {
    listEl.innerHTML = snapshot.encounters.map(encounterTemplate).join("");
  }

  if (snapshot.formError) {
    errorEl.textContent = snapshot.formError;
    errorEl.classList.remove("d-none"); 
  } else {
    errorEl.classList.add("d-none"); 
  }
}


const urlParams = new URLSearchParams(window.location.search);
const patientId = urlParams.get("id");

async function start() {
  subscribe(render); 
  notify();          

  if (!patientId) {
    setError("ID do paciente não fornecido na URL.");
    return;
  }

  try {
    const [patientData, encountersData] = await Promise.all([
      getPatient(patientId),
      listEncounters(patientId)
    ]);
    
    setPatientData(patientData, encountersData);
  } catch (error) {
    setError(error.message); 
  }
}

document.getElementById("encounter-form").addEventListener("submit", async (event) => {
  event.preventDefault(); 
  
  const formData = new FormData(event.target);
  const data = {
    chiefComplaint: formData.get("chiefComplaint"),
    startedAt: formData.get("startedAt"),
    notes: formData.get("notes")
  };

  try {
    const newEncounter = await createEncounter(patientId, data);
    addEncounter(newEncounter); 
    event.target.reset();       
  } catch (error) {
    setFormError(error.message); 
  }
});

start();