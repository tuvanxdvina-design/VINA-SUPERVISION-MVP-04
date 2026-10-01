const express = require('express');
const auth = require('../middleware/auth');
const rbac = require('../middleware/rbac');
const access = require('../middleware/projectAccess');
const service = require('../services/biddingPackageService');

const router = express.Router();
router.use(auth.verifyToken);

const managers = [rbac.ROLES.ADMIN, rbac.ROLES.DIRECTOR];

function sendError(res, error) {
  if (error.status) return res.status(error.status).json({ error: error.message });
  if (error.code === '23503') return res.status(404).json({ error: 'Công trình hoặc gói thầu không tồn tại trên máy chủ' });
  console.error('bidding-packages:', error.message);
  return res.status(500).json({ error: 'Không xử lý được gói thầu' });
}

// GET /api/bidding-packages?project_id=xxx — ai có quyền xem công trình đều xem được (dùng để chọn khi lập nhật ký/phân công).
router.get('/', access.query, async (req, res) => {
  try { res.json(await service.listForProject(req.query.project_id)); }
  catch (error) { sendError(res, error); }
});

// Khai báo/sửa cấu trúc gói thầu — cùng mức quyền với quản lý nhân sự công trình (Admin/Giám đốc).
router.post('/', access.body, rbac.checkRole(managers), async (req, res) => {
  try {
    const row = await service.create(req.body.project_id, req.body.name, req.user.userId);
    await req.audit('bidding_packages', row.id, 'CREATE', null, row, req.user.userId);
    res.status(201).json(row);
  } catch (error) { sendError(res, error); }
});

async function loadPackage(req, res, next) {
  try {
    const row = await service.getById(req.params.id);
    if (!row) return res.status(404).json({ error: 'Không tìm thấy gói thầu' });
    if (!await access.allowed(req.user, row.project_id)) return res.status(403).json({ error: 'Không có quyền truy cập công trình' });
    req.package = row;
    next();
  } catch (error) { sendError(res, error); }
}

router.patch('/:id', rbac.checkRole(managers), loadPackage, async (req, res) => {
  try {
    const row = await service.rename(req.params.id, req.body.name);
    await req.audit('bidding_packages', row.id, 'UPDATE', req.package, row, req.user.userId);
    res.json(row);
  } catch (error) { sendError(res, error); }
});

router.delete('/:id', rbac.checkRole(managers), loadPackage, async (req, res) => {
  try {
    const row = await service.remove(req.params.id);
    await req.audit('bidding_packages', row.id, 'DELETE', req.package, null, req.user.userId);
    res.json(row);
  } catch (error) { sendError(res, error); }
});

router.post('/:id/contractors', rbac.checkRole(managers), loadPackage, async (req, res) => {
  try {
    const row = await service.addContractor(req.params.id, req.package.project_id, req.body.name, req.body.items);
    await req.audit('bidding_package_contractors', row.id, 'CREATE', null, row, req.user.userId);
    res.status(201).json(row);
  } catch (error) { sendError(res, error); }
});

async function loadContractor(req, res, next) {
  try {
    const row = await service.getContractorById(req.params.contractorId);
    if (!row) return res.status(404).json({ error: 'Không tìm thấy nhà thầu' });
    if (!await access.allowed(req.user, row.project_id)) return res.status(403).json({ error: 'Không có quyền truy cập công trình' });
    req.contractor = row;
    next();
  } catch (error) { sendError(res, error); }
}

router.patch('/contractors/:contractorId', rbac.checkRole(managers), loadContractor, async (req, res) => {
  try {
    const row = await service.updateContractor(req.params.contractorId, req.body.name, req.body.items);
    await req.audit('bidding_package_contractors', row.id, 'UPDATE', req.contractor, row, req.user.userId);
    res.json(row);
  } catch (error) { sendError(res, error); }
});

router.delete('/contractors/:contractorId', rbac.checkRole(managers), loadContractor, async (req, res) => {
  try {
    const row = await service.removeContractor(req.params.contractorId);
    await req.audit('bidding_package_contractors', row.id, 'DELETE', req.contractor, null, req.user.userId);
    res.json(row);
  } catch (error) { sendError(res, error); }
});

module.exports = router;
