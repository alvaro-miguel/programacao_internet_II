import { listPatients, createPatient, uploadPatientPhoto } from "./api.js";
import { state, setPatients, addPatient, setFormError, clearFormError } from "./state.js";
import { render } from "./render.js";
import { renderApiError } from "./errors.js";

async function init() {
  try {
    const patients = await listPatients();
    setPatients(patients);
  } catch (err) {
    setFormError(err.message ?? "Falha ao carregar pacientes.");
  }
  render();
}

document.getElementById("photo-input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const preview = document.getElementById("photo-preview");
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
});

document.getElementById("patient-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  clearFormError();

  const form = event.target;
  const payload = {
    name: form.name.value,
    birthDate: form.birthDate.value,
    nationalId: form.nationalId.value,
  };

  try {
    const created = await createPatient(payload);
    
    const file = form.photo.files[0];
    if (file) {
      const patientWithPhoto = await uploadPatientPhoto(created.id, file);
      addPatient(patientWithPhoto);
    } else {
      addPatient(created); 
    }
    
    form.reset();
    document.getElementById("photo-preview").style.display = "none";
  } catch (err) {
    if (err.apiError) {
      renderApiError(err.apiError);
    } else {
      setFormError("Falha inesperada ao cadastrar paciente.");
    }
  }
  render();
});

init();