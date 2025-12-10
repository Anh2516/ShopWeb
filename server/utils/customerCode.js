const generateCandidate = () => Math.floor(10000 + Math.random() * 90000).toString();

async function generateUniqueCustomerCode(db) {
  while (true) {
    const code = generateCandidate();
    const [rows] = await db.execute('SELECT id FROM users WHERE customer_code = ?', [code]);
    if (rows.length === 0) {
      return code;
    }
  }
}

async function ensureCustomerCode(db, userId, customerCode) {
  if (customerCode) {
    return customerCode;
  }
  const code = await generateUniqueCustomerCode(db);
  await db.execute('UPDATE users SET customer_code = ? WHERE id = ?', [code, userId]);
  return code;
}

module.exports = { generateUniqueCustomerCode, ensureCustomerCode };


