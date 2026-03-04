(() => {
  const DB_KEY = "SVHS_STUDENTS_V1";

  function load() {
    try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
    catch { return []; }
  }

  function save(rows) {
    localStorage.setItem(DB_KEY, JSON.stringify(rows));
  }

 
  function getStudents() {
    return load();
  }

 
  function addStudent(student) {
    const rows = load();

   
    const exists = rows.some(s => (s.admNo || "").toLowerCase() === (student.admNo || "").toLowerCase());
    if (exists) {
      return { ok: false, error: "Admission number already exists." };
    }

    rows.unshift(student);
    save(rows);
    return { ok: true, data: student };
  }

 
  function deleteStudent(id) {
    const rows = load();
    const next = rows.filter(s => s.id !== id);
    save(next);
    return { ok: rows.length !== next.length };
  }

  function clearAllStudents() {
    localStorage.removeItem(DB_KEY);
    return { ok: true };
  }

 
  window.StudentAPI = {
    getStudents,
    addStudent,
    deleteStudent,
    clearAllStudents
  };
})();