const KEYS = {
  ADMIN_USERS: 'giftapp_admin_users',
  CAMPAIGNS: 'giftapp_campaigns',
  EMPLOYEES: 'giftapp_employees',
  BENEFICIARIES: 'giftapp_beneficiaries',
  GIFTS: 'giftapp_gifts',
  SELECTIONS: 'giftapp_selections',
  SUPPORT_REQUESTS: 'giftapp_support_requests',
  EMAIL_LOGS: 'giftapp_email_logs',
  ADMIN_SESSION: 'giftapp_current_admin_session',
};

// TODO: Replace localStorage demo persistence with backend API before production.

function getData(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`Invalid localStorage data for key: ${key}`, error);
    }
    return fallback;
  }
}

function setData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return { ok: true };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`Could not save localStorage key: ${key}`, error);
    }
    return { ok: false, error: 'No fue posible guardar la información.' };
  }
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function findCampaignBySlug(slug) {
  const campaigns = getData(KEYS.CAMPAIGNS);
  return campaigns.find((c) => c.slug === slug) || null;
}

function findEmployeeByDocumentAndCampaign(documentId, campaignId) {
  const employees = getData(KEYS.EMPLOYEES);
  return (
    employees.find(
      (e) => e.documentId === documentId && e.campaignId === campaignId
    ) || null
  );
}

function getBeneficiariesByEmployee(employeeId) {
  const beneficiaries = getData(KEYS.BENEFICIARIES);
  return beneficiaries.filter((b) => b.employeeId === employeeId);
}

function getAgeRange(age) {
  if (age >= 0 && age <= 2) return '0-2';
  if (age >= 3 && age <= 5) return '3-5';
  if (age >= 6 && age <= 10) return '6-10';
  if (age >= 11 && age <= 13) return '11-13';
  return null;
}

function getAvailableGiftsForBeneficiary(campaignId, beneficiary) {
  const gifts = getData(KEYS.GIFTS);
  return gifts.filter((g) => {
    if (g.campaignId !== campaignId) return false;
    if (g.status !== 'ACTIVE') return false;
    if (g.stock <= 0) return false;
    if (beneficiary.age < g.minAge || beneficiary.age > g.maxAge) return false;
    if (g.allowedGender !== 'all' && g.allowedGender !== beneficiary.gender)
      return false;
    return true;
  });
}

function confirmSelection(campaignId, employeeId, selectedItems) {
  // TODO: Move final selection confirmation and stock decrement to a backend transaction before production.
  const campaigns = getData(KEYS.CAMPAIGNS);
  const employees = getData(KEYS.EMPLOYEES);
  const beneficiaries = getData(KEYS.BENEFICIARIES);
  const gifts = getData(KEYS.GIFTS);
  const selections = getData(KEYS.SELECTIONS);

  const campaign = campaigns.find((c) => c.id === campaignId);
  if (!campaign) return { ok: false, error: 'Campaña no encontrada.' };
  if (campaign.status !== 'ACTIVE')
    return { ok: false, error: 'La campaña no está activa.' };

  const employee = employees.find(
    (e) => e.id === employeeId && e.campaignId === campaignId
  );
  if (!employee) return { ok: false, error: 'Empleado no encontrado.' };
  if (employee.status === 'CONFIRMED')
    return { ok: false, error: 'Selección ya confirmada.' };
  if (employee.status === 'BLOCKED')
    return { ok: false, error: 'El empleado está bloqueado.' };

  const emps = beneficiaries.filter((b) => b.employeeId === employeeId);
  if (emps.length === 0)
    return { ok: false, error: 'No se encontraron beneficiarios.' };

  if (selectedItems.length !== emps.length)
    return {
      ok: false,
      error: 'Cada beneficiario debe tener exactamente un regalo.',
    };

  const benefIds = emps.map((b) => b.id);
  const selectedBenefIds = selectedItems.map((s) => s.beneficiaryId);
  for (const bid of benefIds) {
    if (!selectedBenefIds.includes(bid))
      return {
        ok: false,
        error: 'Falta un regalo para uno o más beneficiarios.',
      };
  }

  const uniqueBenefIds = new Set(selectedBenefIds);
  if (uniqueBenefIds.size !== selectedBenefIds.length)
    return { ok: false, error: 'Selección de beneficiario duplicada.' };

  const giftsCopy = gifts.map((g) => ({ ...g }));
  const newSelections = [];

  for (const item of selectedItems) {
    const benef = beneficiaries.find((b) => b.id === item.beneficiaryId);
    if (!benef)
      return {
        ok: false,
        error: `Beneficiario ${item.beneficiaryId} no encontrado.`,
      };

    const gift = giftsCopy.find((g) => g.id === item.giftId);
    if (!gift)
      return { ok: false, error: `Regalo ${item.giftId} no encontrado.` };
    if (gift.campaignId !== campaignId)
      return { ok: false, error: 'El regalo no pertenece a esta campaña.' };
    if (gift.status !== 'ACTIVE')
      return { ok: false, error: `El regalo "${gift.name}" no está activo.` };
    if (gift.stock <= 0)
      return {
        ok: false,
        error: `El regalo "${gift.name}" está agotado.`,
      };
    if (benef.age < gift.minAge || benef.age > gift.maxAge)
      return {
        ok: false,
        error: `El regalo "${gift.name}" no es compatible con la edad del beneficiario.`,
      };
    if (
      gift.allowedGender !== 'all' &&
      gift.allowedGender !== benef.gender
    )
      return {
        ok: false,
        error: `El regalo "${gift.name}" no es compatible con el género del beneficiario.`,
      };

    gift.stock -= 1;
    newSelections.push({
      id: generateId(),
      campaignId,
      employeeId,
      beneficiaryId: benef.id,
      beneficiaryName: benef.fullName,
      giftId: gift.id,
      giftName: gift.name,
      giftReference: gift.reference,
      employeeName: employee.fullName,
      employeeDocumentId: employee.documentId,
      beneficiaryAge: benef.age,
      beneficiaryGender: benef.gender,
      giftImageUrl: gift.imageUrls?.[0] || '',
      confirmedAt: new Date().toISOString(),
    });
  }

  const updatedEmployees = employees.map((e) => {
    if (e.id === employeeId && e.campaignId === campaignId) {
      return { ...e, status: 'CONFIRMED' };
    }
    return e;
  });

  setData(KEYS.GIFTS, giftsCopy);
  setData(KEYS.EMPLOYEES, updatedEmployees);
  setData(KEYS.SELECTIONS, [...selections, ...newSelections]);

  const emailLogs = getData(KEYS.EMAIL_LOGS);
  emailLogs.push({
    id: generateId(),
    type: 'CONFIRMATION',
    employeeId,
    campaignId,
    sentAt: new Date().toISOString(),
    details: `Simulación de correo de confirmación para el empleado ${employeeId}`,
  });
  setData(KEYS.EMAIL_LOGS, emailLogs);

  return { ok: true, selections: newSelections };
}

function getSelectionsByCampaign(campaignId) {
  const selections = getData(KEYS.SELECTIONS);
  if (campaignId) return selections.filter((s) => s.campaignId === campaignId);
  return selections;
}

function createSupportRequest(data) {
  // TODO: Add server-side rate limiting for public support requests before production.
  const requests = getData(KEYS.SUPPORT_REQUESTS);
  const newReq = {
    id: generateId(),
    campaignId: data.campaignId || '',
    employeeId: data.employeeId || '',
    documentId: data.documentId || '',
    type: data.type,
    message: data.message,
    status: 'OPEN',
    internalNote: '',
    createdAt: new Date().toISOString(),
  };
  requests.push(newReq);
  setData(KEYS.SUPPORT_REQUESTS, requests);
  return newReq;
}

function updateSupportRequestStatus(id, status, internalNote) {
  const requests = getData(KEYS.SUPPORT_REQUESTS);
  const updated = requests.map((r) => {
    if (r.id === id) {
      return {
        ...r,
        status: status || r.status,
        internalNote:
          internalNote !== undefined ? internalNote : r.internalNote,
      };
    }
    return r;
  });
  setData(KEYS.SUPPORT_REQUESTS, updated);
}

function exportSelectionsToCSV(campaignId) {
  const selections = getSelectionsByCampaign(campaignId);
  if (selections.length === 0) return;

  const campaigns = getData(KEYS.CAMPAIGNS);
  const employees = getData(KEYS.EMPLOYEES);
  const beneficiaries = getData(KEYS.BENEFICIARIES);

  const rows = [
    [
      'Campaña',
      'Empleado',
      'ID Empleado',
      'Teléfono',
      'Dirección de Envío',
      'Ciudad',
      'Beneficiario',
      'Edad',
      'Género',
      'Regalo',
      'Referencia',
      'Fecha Confirmación',
    ],
  ];

  for (const sel of selections) {
    const campaign = campaigns.find((c) => c.id === sel.campaignId);
    const employee = employees.find((e) => e.id === sel.employeeId);
    const benef = beneficiaries.find((b) => b.id === sel.beneficiaryId);
    rows.push([
      campaign ? campaign.name : sel.campaignId,
      sel.employeeName || employee ? employee.fullName : sel.employeeId,
      sel.employeeDocumentId || employee ? employee.documentId : '',
      employee?.phone || '',
      employee?.shippingAddress || '',
      employee?.shippingCity || '',
      sel.beneficiaryName || '',
      sel.beneficiaryAge !== undefined ? sel.beneficiaryAge : (benef ? benef.age : ''),
      sel.beneficiaryGender || (benef ? benef.gender : ''),
      sel.giftName || '',
      sel.giftReference || '',
      sel.confirmedAt || '',
    ]);
  }

  const csvContent = rows
    .map((r) =>
      r.map((cell) => `"${sanitizeCsvCell(cell).replace(/"/g, '""')}"`).join(',')
    )
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `selections_${campaignId || 'all'}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function sanitizeCsvCell(value) {
  const str = String(value ?? '');
  const dangerousStart = ['=', '+', '-', '@'];
  if (dangerousStart.includes(str.charAt(0))) {
    return `'${str}`;
  }
  return str;
}

function getDemoData() {
  const adminId = 'admin-001';
  const campaignId = 'camp-001';
  const emp1Id = 'emp-001';
  const emp2Id = 'emp-002';
  const ben1Id = 'ben-001';
  const ben2Id = 'ben-002';
  const ben3Id = 'ben-003';

  return {
    adminUsers: [
      {
        id: adminId,
        name: 'Admin Demo',
        email: 'admin@demo.com',
        password: 'Admin123',
        role: 'ADMIN',
      },
    ],
    campaigns: [
      {
        id: campaignId,
        name: 'Navidad 2026',
        slug: 'christmas-2026',
        welcomeText:
          'Bienvenido a la selección de regalos de Navidad 2026. ¡Elige el regalo perfecto para tus seres queridos!',
        rulesText:
          'Selecciona un regalo para cada beneficiario. Una vez confirmado, no podrás modificar tu selección.',
        status: 'ACTIVE',
        logoText: 'REGALOS DEMO',
        primaryColor: '#2563eb',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    employees: [
      {
        id: emp1Id,
        campaignId,
        fullName: 'John Smith',
        documentId: '1001',
        email: 'john@demo.com',
        status: 'PENDING',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: emp2Id,
        campaignId,
        fullName: 'Anna Gomez',
        documentId: '1002',
        email: 'anna@demo.com',
        status: 'PENDING',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    beneficiaries: [
      {
        id: ben1Id,
        employeeId: emp1Id,
        fullName: 'Mariana Smith',
        age: 4,
        gender: 'female',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: ben2Id,
        employeeId: emp1Id,
        fullName: 'Samuel Smith',
        age: 8,
        gender: 'male',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: ben3Id,
        employeeId: emp2Id,
        fullName: 'Lucia Gomez',
        age: 11,
        gender: 'female',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    gifts: [
      {
        id: 'gift-001',
        campaignId,
        name: 'Muñeca Educativa',
        reference: 'GFT-001',
        shortDescription:
          'Una hermosa muñeca educativa que ayuda a desarrollar la creatividad y las habilidades sociales.',
        technicalDescription:
          'Fabricada con materiales de alta calidad y no tóxicos. Plástico libre de BPA y tela suave. Cumple con todos los estándares de seguridad infantil.',
        dimensions: '30cm x 15cm x 10cm',
        stock: 10,
        minAge: 3,
        maxAge: 5,
        allowedGender: 'female',
        imageUrls: [
          'https://placehold.co/400x400/FFB6C1/333?text=Muñeca+Educativa',
          'https://placehold.co/400x400/FFC0CB/333?text=Detalle+Muñeca',
        ],
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'gift-002',
        campaignId,
        name: 'Carro Armable',
        reference: 'GFT-002',
        shortDescription:
          'Un emocionante set de carro armable que fomenta las habilidades de resolución de problemas.',
        technicalDescription:
          'Contiene más de 150 piezas. Compatible con las principales marcas de bloques de construcción. Incluye manual de instrucciones y hoja de stickers.',
        dimensions: '25cm x 12cm x 8cm',
        stock: 10,
        minAge: 6,
        maxAge: 10,
        allowedGender: 'male',
        imageUrls: [
          'https://placehold.co/400x400/87CEEB/333?text=Carro+Armable',
          'https://placehold.co/400x400/B0E0E6/333?text=Piezas+Carro',
        ],
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'gift-003',
        campaignId,
        name: 'Kit de Arte',
        reference: 'GFT-003',
        shortDescription:
          'Kit completo de materiales de arte para que los jóvenes artistas exploren su creatividad.',
        technicalDescription:
          'Incluye 24 lápices de colores, 12 acuarelas, 8 marcadores, bloc de dibujo y estuche. No tóxico y lavable.',
        dimensions: '35cm x 25cm x 5cm',
        stock: 15,
        minAge: 3,
        maxAge: 10,
        allowedGender: 'all',
        imageUrls: [
          'https://placehold.co/400x400/DDA0DD/333?text=Kit+de+Arte',
          'https://placehold.co/400x400/E6E6FA/333?text=Materiales+Arte',
        ],
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'gift-004',
        campaignId,
        name: 'Bloques de Construcción',
        reference: 'GFT-004',
        shortDescription:
          'Coloridos bloques de construcción perfectos para niños pequeños.',
        technicalDescription:
          'Juego de 50 bloques grandes y fáciles de agarrar en varias formas y colores. Fabricados en plástico ABS duradero y seguro para niños.',
        dimensions: '20cm x 20cm x 15cm',
        stock: 8,
        minAge: 0,
        maxAge: 5,
        allowedGender: 'all',
        imageUrls: [
          'https://placehold.co/400x400/98FB98/333?text=Bloques+Construcción',
          'https://placehold.co/400x400/90EE90/333?text=Set+Bloques',
        ],
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'gift-005',
        campaignId,
        name: 'Juego de Mesa Juvenil',
        reference: 'GFT-005',
        shortDescription:
          'Un entretenido juego de mesa de estrategia diseñado para adolescentes y familias.',
        technicalDescription:
          'Incluye tablero de juego, 4 fichas de jugador, 100 cartas, dados y reglamento. Tiempo promedio de juego: 45-60 minutos.',
        dimensions: '40cm x 27cm x 5cm',
        stock: 6,
        minAge: 11,
        maxAge: 13,
        allowedGender: 'all',
        imageUrls: [
          'https://placehold.co/400x400/FFD700/333?text=Juego+de+Mesa',
          'https://placehold.co/400x400/FFA500/333?text=Piezas+Juego',
        ],
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'gift-006',
        campaignId,
        name: 'Producto Demo Sin Stock',
        reference: 'GFT-006',
        shortDescription: 'Este producto está sin stock para fines de demostración.',
        technicalDescription: 'Producto de demostración. No disponible para selección.',
        dimensions: '20cm x 20cm x 20cm',
        stock: 0,
        minAge: 0,
        maxAge: 13,
        allowedGender: 'all',
        imageUrls: [
          'https://placehold.co/400x400/CCCCCC/666?text=Sin+Stock',
        ],
        status: 'ACTIVE',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ],
    selections: [],
    supportRequests: [],
    emailLogs: [],
  };
}

function initializeDemoData() {
  if (localStorage.getItem(KEYS.CAMPAIGNS)) return;
  const demo = getDemoData();
  setData(KEYS.ADMIN_USERS, demo.adminUsers);
  setData(KEYS.CAMPAIGNS, demo.campaigns);
  setData(KEYS.EMPLOYEES, demo.employees);
  setData(KEYS.BENEFICIARIES, demo.beneficiaries);
  setData(KEYS.GIFTS, demo.gifts);
  setData(KEYS.SELECTIONS, demo.selections);
  setData(KEYS.SUPPORT_REQUESTS, demo.supportRequests);
  setData(KEYS.EMAIL_LOGS, demo.emailLogs);
}

function resetDemoData() {
  const demo = getDemoData();
  setData(KEYS.ADMIN_USERS, demo.adminUsers);
  setData(KEYS.CAMPAIGNS, demo.campaigns);
  setData(KEYS.EMPLOYEES, demo.employees);
  setData(KEYS.BENEFICIARIES, demo.beneficiaries);
  setData(KEYS.GIFTS, demo.gifts);
  setData(KEYS.SELECTIONS, []);
  setData(KEYS.SUPPORT_REQUESTS, []);
  setData(KEYS.EMAIL_LOGS, []);
  localStorage.removeItem(KEYS.ADMIN_SESSION);
}

function clearAllData() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}

function getAdminSession() {
  try {
    const raw = localStorage.getItem(KEYS.ADMIN_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setAdminSession(session) {
  setData(KEYS.ADMIN_SESSION, session);
}

function clearAdminSession() {
  localStorage.removeItem(KEYS.ADMIN_SESSION);
}

export {
  KEYS,
  getData,
  setData,
  generateId,
  findCampaignBySlug,
  findEmployeeByDocumentAndCampaign,
  getBeneficiariesByEmployee,
  getAgeRange,
  getAvailableGiftsForBeneficiary,
  confirmSelection,
  getSelectionsByCampaign,
  createSupportRequest,
  updateSupportRequestStatus,
  exportSelectionsToCSV,
  initializeDemoData,
  resetDemoData,
  clearAllData,
  getAdminSession,
  setAdminSession,
  clearAdminSession,
};
