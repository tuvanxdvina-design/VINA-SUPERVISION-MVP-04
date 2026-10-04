// Lập nhật ký → gửi duyệt → Trưởng TVGS duyệt qua "Việc cần duyệt".
// Nhãn trạng thái thật trong app: DRAFT 'Nháp', SUBMITTED 'Chờ duyệt', APPROVED 'Đã duyệt', LOCKED 'Đã khóa'.
const assert = require('node:assert/strict');
const { uiTest, loginViaApi, openPage } = require('../helpers');

// Lập nhật ký bằng giao diện (đúng đường người dùng đi), trả về nội dung công việc để tìm lại dòng.
async function taoNhatKyQuaGiaoDien(page, { ngay, congViec, guiDuyet = false }) {
  await openPage(page, 'daily');
  await page.click('#newLogButton');
  await page.waitForSelector('#modal.show #lwork', { state: 'visible' });
  await page.fill('#ldate', ngay);
  await page.fill('#lwork', congViec);
  // Nhân lực là danh sách nhiều loại (Đợt 19): điền dòng đầu tiên.
  await page.fill('#lworkersBox .lworkers-type >> nth=0', 'Thợ xây');
  await page.fill('#lworkersBox .lworkers-count >> nth=0', '5');
  await page.click(`#modal >> text="${guiDuyet ? 'Lưu và gửi duyệt' : 'Lưu nháp'}"`);
  await page.waitForSelector('#modal.show', { state: 'hidden' });
  await page.waitForFunction(t => (document.getElementById('logsTable')?.innerText || '').includes(t), congViec);
  // "Lưu và gửi duyệt" đóng hộp thoại TRƯỚC rồi mới đồng bộ + gửi duyệt lên máy chủ. Phải chờ dòng chuyển "Chờ duyệt"
  // (lệnh gửi đã xong) — nếu không, ca đổi tài khoản ngay sẽ chạy đua với lệnh gửi (từng đỏ ngẫu nhiên trên GitHub).
  if (guiDuyet) await page.waitForFunction(t => { const tr = [...document.querySelectorAll('#logsTable tr')].find(r => r.innerText.includes(t)); return tr && /Chờ duyệt|Đã duyệt/.test(tr.innerText); }, congViec);
  return congViec;
}

module.exports = function () {
  uiTest('GD-06 lập nhật ký nháp rồi gửi duyệt: người lập hết quyền sửa', async (page) => {
    await loginViaApi(page, 'thanhb');
    const congViec = 'GD-06 dam mong truc A';
    await taoNhatKyQuaGiaoDien(page, { ngay: '2026-09-24', congViec });

    const row = () => page.locator('#logsTable tr', { hasText: congViec });
    assert.ok((await row().innerText()).includes('Nháp'), 'nhật ký mới phải ở trạng thái Nháp: ' + (await row().innerText()));
    // Nút Gửi duyệt chỉ hiện khi bản nháp đã lên máy chủ (đồng bộ bất đồng bộ sau khi lưu) — chờ, không kiểm ngay.
    await row().locator('text="Gửi duyệt"').waitFor({ state: 'visible' });
    assert.equal(await row().locator('text="Duyệt"').count(), 0, 'người lập không được thấy nút Duyệt');

    await row().locator('text="Gửi duyệt"').click(); // confirm() được helper tự chấp nhận
    await page.waitForFunction(t => {
      const tr = [...document.querySelectorAll('#logsTable tr')].find(r => r.innerText.includes(t));
      return tr && tr.innerText.includes('Chờ duyệt');
    }, congViec);

    assert.equal(await row().locator('text="Gửi duyệt"').count(), 0, 'đã gửi thì không còn nút Gửi duyệt');
    assert.equal(await row().locator('text="Sửa"').count(), 0, 'đã gửi thì người lập không sửa được nữa');
  });

  uiTest('GD-07 Trưởng TVGS thấy việc trong hộp duyệt và duyệt được', async (page) => {
    await loginViaApi(page, 'thanhb');
    const congViec = 'GD-07 be tong san ham';
    await taoNhatKyQuaGiaoDien(page, { ngay: '2026-09-25', congViec, guiDuyet: true });

    await loginViaApi(page, 'hung'); // Trưởng TVGS tại công trình 001
    await openPage(page, 'inbox');
    await page.waitForFunction(() => !/Đang tải/.test(document.getElementById('inboxBody')?.innerText || ''));
    assert.ok((await page.locator('#inboxBody').innerText()).includes(congViec),
      'việc đã gửi phải xuất hiện trong "Việc cần duyệt" của Trưởng TVGS');

    await openPage(page, 'daily');
    // Danh sách nhật ký của người khác đến từ đồng bộ máy chủ — chờ dòng hiện ra trước khi bấm.
    await page.waitForFunction(t => (document.getElementById('logsTable')?.innerText || '').includes(t), congViec, { timeout: 25000 });
    const row = () => page.locator('#logsTable tr', { hasText: congViec });
    // Bấm "Duyệt" mở modal "Xem xét và phê duyệt" (ý kiến không bắt buộc khi phê duyệt).
    await row().locator('text="Duyệt"').first().click();
    await page.waitForSelector('#modal.show #rvComment', { state: 'visible' });
    assert.equal(await page.locator('#mtitle').innerText(), 'Xem xét và phê duyệt');
    await page.locator('#modal button.primary').first().click(); // ✔ Phê duyệt
    await page.waitForSelector('#modal.show', { state: 'hidden' });
    await page.waitForFunction(t => {
      const tr = [...document.querySelectorAll('#logsTable tr')].find(r => r.innerText.includes(t));
      return tr && tr.innerText.includes('Đã duyệt');
    }, congViec);
    assert.equal(await row().locator('text="Duyệt"').count(), 0, 'đã duyệt rồi thì không còn nút Duyệt');

    // Việc đã quyết định phải rời hộp "Việc cần duyệt"
    await openPage(page, 'inbox');
    await page.waitForFunction(() => !/Đang tải/.test(document.getElementById('inboxBody')?.innerText || ''));
    await page.waitForFunction(t => !(document.getElementById('inboxBody')?.innerText || '').includes(t), congViec);
  });

  uiTest('GD-21 TVGS trưởng "Duyệt tất cả": xác nhận nháp của mình + duyệt bản thành viên đã gửi, không đụng nháp thành viên', async (page) => {
    await loginViaApi(page, 'thanhb');
    const daGui = await taoNhatKyQuaGiaoDien(page, { ngay: '2026-09-14', congViec: 'GD-21 thanh vien da gui', guiDuyet: true });
    const conNhap = await taoNhatKyQuaGiaoDien(page, { ngay: '2026-09-15', congViec: 'GD-21 thanh vien con nhap' });
    await loginViaApi(page, 'hung');
    const cuaTruong = await taoNhatKyQuaGiaoDien(page, { ngay: '2026-09-16', congViec: 'GD-21 cua truong nhom' });
    await page.waitForFunction(t => (document.getElementById('logsTable')?.innerText || '').includes(t), daGui, { timeout: 25000 });
    assert.equal(await page.locator('#daily button', { hasText: 'Gửi duyệt tất cả nháp' }).count(), 0,
      'TVGS trưởng không còn nút gửi duyệt hàng loạt (trước đây gom cả nháp của thành viên)');
    await page.locator('#daily button', { hasText: 'Duyệt tất cả (' }).first().click();
    const trangThai = t => page.evaluate(w => { const tr = [...document.querySelectorAll('#logsTable tr')].find(r => r.innerText.includes(w)); return tr ? tr.innerText : ''; }, t);
    await page.waitForFunction(t => { const tr = [...document.querySelectorAll('#logsTable tr')].find(r => r.innerText.includes(t)); return tr && tr.innerText.includes('Đã duyệt'); }, cuaTruong);
    assert.ok((await trangThai(daGui)).includes('Đã duyệt'), 'bản thành viên đã gửi phải được duyệt: ' + await trangThai(daGui));
    assert.equal(await trangThai(conNhap), '', 'TVGS trưởng không được thấy nháp thành viên chưa gửi');
    // Thành viên vẫn thấy nháp của mình, còn nguyên trạng thái Nháp (không bị duyệt hộ).
    await loginViaApi(page, 'thanhb');
    await openPage(page, 'daily');
    await page.waitForFunction(t => (document.getElementById('logsTable')?.innerText || '').includes(t), conNhap);
    assert.ok((await trangThai(conNhap)).includes('Nháp'), 'nháp thành viên phải giữ nguyên: ' + await trangThai(conNhap));
  });

  uiTest('GD-24 bản nháp chỉ người lập thấy: TVGS trưởng không thấy nháp thành viên, thấy ngay khi đã gửi', async (page) => {
    await loginViaApi(page, 'thanhb');
    const nhap = await taoNhatKyQuaGiaoDien(page, { ngay: '2026-09-12', congViec: 'GD-24 nhap rieng cua thanh vien' });
    const daGui = await taoNhatKyQuaGiaoDien(page, { ngay: '2026-09-13', congViec: 'GD-24 ban da gui', guiDuyet: true });
    await loginViaApi(page, 'hung');
    await openPage(page, 'daily');
    await page.waitForFunction(t => (document.getElementById('logsTable')?.innerText || '').includes(t), daGui, { timeout: 25000 });
    assert.ok(!(await page.locator('#logsTable').innerText()).includes(nhap), 'TVGS trưởng không được thấy bản nháp của thành viên');
  });

  uiTest('GD-25 đồng bộ: bản vừa lên máy chủ trong lúc đang tải danh sách không bị xóa nhầm khỏi thiết bị', async (page) => {
    await loginViaApi(page, 'thanhb');
    const r = await page.evaluate(async () => {
      const pid = db.projects[0].id;
      db.logs.push({ id: 'race-new', projectId: pid, serverId: null, status: 'DRAFT', date: '2026-01-01', shift: 'CA1', work: 'RACE' });
      db.logs.push({ id: 'race-old', projectId: pid, serverId: '00000000-0000-4000-8000-000000000001', status: 'DRAFT', date: '2026-01-02', shift: 'CA1', work: 'GONE' });
      const orig = window.apiGetDailyLogs;
      // Trong lúc đang tải danh sách, race-new vừa nhận mã máy chủ nhưng danh sách trả về chưa có nó.
      window.apiGetDailyLogs = apiGetDailyLogs = async p => { const res = await orig(p); const l = db.logs.find(x => x.id === 'race-new'); if (l) l.serverId = '00000000-0000-4000-8000-0000000000aa'; return res; };
      await syncDailyLogsFromApi();
      return { keptNew: db.logs.some(x => x.id === 'race-new'), removedGone: !db.logs.some(x => x.id === 'race-old') };
    });
    assert.equal(r.keptNew, true, 'bản vừa lên máy chủ phải được giữ lại');
    assert.equal(r.removedGone, true, 'bản máy chủ không còn trả về (đã xóa / nháp người khác) phải được dọn');
  });
};
