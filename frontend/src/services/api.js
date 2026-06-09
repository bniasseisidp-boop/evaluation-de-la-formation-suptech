import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
  changePassword: (data) => api.post('/change-password', data),
  forgotPassword: (data) => api.post('/forgot-password', data),
  resetPassword: (data) => api.post('/reset-password', data),
  checkInvitation: (token) => api.get(`/invitation/${token}`),
};

export const filiereAPI = {
  list: () => api.get('/filieres'),
  create: (data) => api.post('/filieres', data),
  update: (id, data) => api.put(`/filieres/${id}`, data),
  delete: (id) => api.delete(`/filieres/${id}`),
  show: (id) => api.get(`/filieres/${id}`),
};

export const classeAPI = {
  list: (filiereId) => api.get('/classes', { params: { filiere_id: filiereId } }),
  create: (data) => api.post('/classes', data),
  update: (id, data) => api.put(`/classes/${id}`, data),
  delete: (id) => api.delete(`/classes/${id}`),
  show: (id) => api.get(`/classes/${id}`),
};

export const professeurAPI = {
  list: () => api.get('/professeurs'),
  create: (data) => api.post('/professeurs', data),
  update: (id, data) => api.put(`/professeurs/${id}`, data),
  delete: (id) => api.delete(`/professeurs/${id}`),
};

export const matiereAPI = {
  list: () => api.get('/matieres'),
  create: (data) => api.post('/matieres', data),
  update: (id, data) => api.put(`/matieres/${id}`, data),
  delete: (id) => api.delete(`/matieres/${id}`),
};

export const cmpAPI = {
  list: (classeId) => api.get('/cmp', { params: { classe_id: classeId } }),
  create: (data) => api.post('/cmp', data),
  delete: (id) => api.delete(`/cmp/${id}`),
  classeGrid: (classeId) => api.get(`/cmp/classe/${classeId}`),
};

export const evaluationAPI = {
  submitEnseignement: (data) => api.post('/evaluations/enseignement', data),
  submitQualite: (data) => api.post('/evaluations/qualite', data),
  submitFormation: (data) => api.post('/evaluations/formation', data),
  myEnseignement: () => api.get('/student/my-evaluations/enseignement'),
  myQualite: () => api.get('/student/my-evaluations/qualite'),
  myFormation: () => api.get('/student/my-evaluations/formation'),
  allEnseignement: (params) => api.get('/evaluations/enseignement', { params }),
  allQualite: (params) => api.get('/evaluations/qualite', { params }),
  qualiteStats: (params) => api.get('/evaluations/qualite/stats', { params }),
  formationStats: (params) => api.get('/evaluations/formation/stats', { params }),
};

const downloadBlob = (data, filename) => {
  const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  filiereReport: (id) => api.get(`/admin/reports/filiere/${id}`),
  classeReport: (id) => api.get(`/admin/reports/classe/${id}`),
  students: (params) => api.get('/admin/students', { params }),
  studentDetail: (id) => api.get(`/admin/students/${id}`),
  studentDelete: (id) => api.delete(`/admin/students/${id}`),
  exportFiliere: (id) => api.get(`/export/filiere/${id}`, { responseType: 'blob' })
    .then(r => downloadBlob(r.data, `rapport_filiere_${id}.pdf`)),
  exportClasse: (id) => api.get(`/export/classe/${id}`, { responseType: 'blob' })
    .then(r => downloadBlob(r.data, `rapport_classe_${id}.pdf`)),
  exportStudent: (id, name) => api.get(`/export/student/${id}`, { responseType: 'blob' })
    .then(r => downloadBlob(r.data, `rapport_etudiant_${name || id}.pdf`)),
  exportProfCmp: (cmpId, matiere, classe) => api.get(`/export/prof-cmp/${cmpId}`, { responseType: 'blob' })
    .then(r => downloadBlob(r.data, `rapport_prof_${matiere || cmpId}_${classe || ''}.pdf`)),
  resetEvals: () => api.delete('/admin/reset-evals'),
};

export const invitationAPI = {
  list: () => api.get('/invitations'),
  send: (data) => api.post('/invitations', data),
  bulk: (data) => api.post('/invitations/bulk', data),
  resend: (id) => api.post(`/invitations/${id}/resend`),
  delete: (id) => api.delete(`/invitations/${id}`),
};

export const studentAPI = {
  dashboard: () => api.get('/student/dashboard'),
};

export const adminUserAPI = {
  list: () => api.get('/admin/admins'),
  create: (data) => api.post('/admin/admins', data),
  update: (id, data) => api.put(`/admin/admins/${id}`, data),
  delete: (id) => api.delete(`/admin/admins/${id}`),
};
