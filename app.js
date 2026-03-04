const form = document.getElementById("studentForm");
const rowsEl = document.getElementById("rows");
const searchEl = document.getElementById("search");

const clearAllBtn = document.getElementById("clearAll");
const exportBtn = document.getElementById("exportBtn");
const printReceiptBtn = document.getElementById("printReceiptBtn");


const receiptNoEl = document.getElementById("receiptNo");
const receiptDateEl = document.getElementById("receiptDate");
const rAdm = document.getElementById("rAdm");
const rName = document.getElementById("rName");
const rGender = document.getElementById("rGender");
const rDob = document.getElementById("rDob");
const rGrade = document.getElementById("rGrade");
const rYear = document.getElementById("rYear");
const rGuardian = document.getElementById("rGuardian");
const rGPhone = document.getElementById("rGPhone");
const rNotes = document.getElementById("rNotes");


let selectedStudent = null;

function escapeHtml(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  const all = window.StudentAPI.getStudents();
  const q = (searchEl.value || "").trim().toLowerCase();

  const filtered = all.filter(s => {
    const hay = [
      s.admNo, s.fullName, s.guardianName, s.guardianPhone
    ].join(" ").toLowerCase();
    return !q || hay.includes(q);
  });

  rowsEl.innerHTML = "";

  if (filtered.length === 0) {
    rowsEl.innerHTML = `<tr><td colspan="9">No students found.</td></tr>`;
    return;
  }

  for (const s of filtered) {
    const tr = document.createElement("tr");
    tr.className = "clickRow";
    tr.dataset.id = s.id;

    tr.innerHTML = `
      <td>${escapeHtml(s.admNo)}</td>
      <td>${escapeHtml(s.fullName)}</td>
      <td>${escapeHtml(s.gender)}</td>
      <td>${escapeHtml(s.dob)}</td>
      <td>${escapeHtml(s.grade)}</td>
      <td>${escapeHtml(s.year)}</td>
      <td>${escapeHtml(s.guardianName || "")}</td>
      <td>${escapeHtml(s.guardianPhone || "")}</td>
      <td><button class="btn danger tiny" data-del="${s.id}">Delete</button></td>
    `;

    rowsEl.appendChild(tr);
  }
}

function setReceipt(student) {
  selectedStudent = student;

  const now = new Date();
  receiptDateEl.textContent = now.toLocaleString();

  
  const receiptNo = `SVHS-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`;
  receiptNoEl.textContent = receiptNo;

  rAdm.textContent = student.admNo || "—";
  rName.textContent = student.fullName || "—";
  rGender.textContent = student.gender || "—";
  rDob.textContent = student.dob || "—";
  rGrade.textContent = student.grade || "—";
  rYear.textContent = student.year || "—";
  rGuardian.textContent = student.guardianName || "—";
  rGPhone.textContent = student.guardianPhone || "—";
  rNotes.textContent = student.notes || "—";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const student = {
    id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()),
    createdAt: new Date().toISOString(),

    admNo: document.getElementById("admNo").value.trim(),
    fullName: document.getElementById("fullName").value.trim(),
    gender: document.getElementById("gender").value,
    dob: document.getElementById("dob").value,
    grade: document.getElementById("grade").value,
    year: document.getElementById("year").value.trim(),

    guardianName: document.getElementById("guardianName").value.trim(),
    guardianPhone: document.getElementById("guardianPhone").value.trim(),
    notes: document.getElementById("notes").value.trim()
  };

  const res = window.StudentAPI.addStudent(student);
  if (!res.ok) {
    alert(res.error || "Failed to add student.");
    return;
  }

  
  setReceipt(student);

  form.reset();
  render();
});

rowsEl.addEventListener("click", (e) => {
 
  const delBtn = e.target.closest("button[data-del]");
  if (delBtn) {
    const id = delBtn.getAttribute("data-del");
    window.StudentAPI.deleteStudent(id);
    render();
    return;
  }

  
  const row = e.target.closest("tr.clickRow");
  if (!row) return;

  const id = row.dataset.id;
  const all = window.StudentAPI.getStudents();
  const student = all.find(s => s.id === id);
  if (student) {
    setReceipt(student);
    alert("Selected for receipt. Now click “Print Receipt”.");
  }
});

searchEl.addEventListener("input", render);

clearAllBtn.addEventListener("click", () => {
  const ok = confirm("Delete ALL student records? This cannot be undone.");
  if (!ok) return;
  window.StudentAPI.clearAllStudents();
  selectedStudent = null;
  render();
});

exportBtn.addEventListener("click", () => {
  const data = window.StudentAPI.getStudents();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "svhs_students.json";
  a.click();

  URL.revokeObjectURL(url);
});

printReceiptBtn.addEventListener("click", () => {
  if (!selectedStudent) {
    alert("Add a student or click a student row first to select for receipt.");
    return;
  }
  window.print();
});


render();