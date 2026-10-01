const pool = require('../utils/db');

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function normalizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(v => ({ name: String(v?.name || '').trim().slice(0, 255), unit: String(v?.unit || '').trim().slice(0, 40) }))
    .filter(v => v.name);
}

class BiddingPackageService {
  // Danh sách gói thầu của công trình, kèm nhà thầu + hạng mục — dùng cho khai báo công trình,
  // dropdown xếp tầng khi lập nhật ký, và chọn gói thầu khi phân công nhân sự.
  async listForProject(projectId) {
    const packages = (await pool.query(
      `SELECT id, project_id, name, created_at, updated_at FROM bidding_packages WHERE project_id = $1 ORDER BY created_at`,
      [projectId]
    )).rows;
    if (!packages.length) return [];
    const contractors = (await pool.query(
      `SELECT id, package_id, name, items FROM bidding_package_contractors WHERE project_id = $1 ORDER BY created_at`,
      [projectId]
    )).rows;
    return packages.map(p => ({
      ...p,
      contractors: contractors.filter(c => c.package_id === p.id).map(c => ({ id: c.id, name: c.name, items: Array.isArray(c.items) ? c.items : [] }))
    }));
  }

  async getById(id) {
    return (await pool.query('SELECT * FROM bidding_packages WHERE id = $1', [id])).rows[0];
  }

  async create(projectId, name, createdBy) {
    const clean = String(name || '').trim();
    if (!clean) throw httpError(400, 'Nhập tên gói thầu');
    if (clean.length > 255) throw httpError(400, 'Tên gói thầu tối đa 255 ký tự');
    try {
      return (await pool.query(
        `INSERT INTO bidding_packages (project_id, name, created_by) VALUES ($1, $2, $3) RETURNING *`,
        [projectId, clean, createdBy]
      )).rows[0];
    } catch (error) {
      if (error.code === '23505') throw httpError(409, 'Công trình đã có gói thầu cùng tên');
      throw error;
    }
  }

  async rename(id, name) {
    const clean = String(name || '').trim();
    if (!clean) throw httpError(400, 'Nhập tên gói thầu');
    try {
      const row = (await pool.query(
        `UPDATE bidding_packages SET name = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [clean, id]
      )).rows[0];
      if (!row) throw httpError(404, 'Không tìm thấy gói thầu');
      return row;
    } catch (error) {
      if (error.code === '23505') throw httpError(409, 'Công trình đã có gói thầu cùng tên');
      throw error;
    }
  }

  async remove(id) {
    const row = (await pool.query('DELETE FROM bidding_packages WHERE id = $1 RETURNING *', [id])).rows[0];
    if (!row) throw httpError(404, 'Không tìm thấy gói thầu');
    return row;
  }

  async getContractorById(id) {
    return (await pool.query('SELECT * FROM bidding_package_contractors WHERE id = $1', [id])).rows[0];
  }

  async addContractor(packageId, projectId, name, items) {
    const clean = String(name || '').trim();
    if (!clean) throw httpError(400, 'Nhập tên nhà thầu');
    if (clean.length > 255) throw httpError(400, 'Tên nhà thầu tối đa 255 ký tự');
    try {
      return (await pool.query(
        `INSERT INTO bidding_package_contractors (package_id, project_id, name, items) VALUES ($1, $2, $3, $4::jsonb) RETURNING *`,
        [packageId, projectId, clean, JSON.stringify(normalizeItems(items))]
      )).rows[0];
    } catch (error) {
      if (error.code === '23505') throw httpError(409, 'Gói thầu đã có nhà thầu cùng tên');
      throw error;
    }
  }

  async updateContractor(id, name, items) {
    const clean = name === undefined ? undefined : String(name || '').trim();
    if (clean !== undefined && !clean) throw httpError(400, 'Nhập tên nhà thầu');
    try {
      const row = (await pool.query(
        `UPDATE bidding_package_contractors
         SET name = COALESCE($1, name), items = COALESCE($2::jsonb, items), updated_at = NOW()
         WHERE id = $3 RETURNING *`,
        [clean ?? null, items === undefined ? null : JSON.stringify(normalizeItems(items)), id]
      )).rows[0];
      if (!row) throw httpError(404, 'Không tìm thấy nhà thầu');
      return row;
    } catch (error) {
      if (error.code === '23505') throw httpError(409, 'Gói thầu đã có nhà thầu cùng tên');
      throw error;
    }
  }

  async removeContractor(id) {
    const row = (await pool.query('DELETE FROM bidding_package_contractors WHERE id = $1 RETURNING *', [id])).rows[0];
    if (!row) throw httpError(404, 'Không tìm thấy nhà thầu');
    return row;
  }
}

module.exports = new BiddingPackageService();
