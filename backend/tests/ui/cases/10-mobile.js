const assert = require('node:assert/strict');
const { uiTest, loginViaApi, openPage } = require('../helpers');

module.exports = function register() {
  uiTest('GD-13 mobile: dieu huong, noi dung va hop thoai nam gon trong man hinh', async page => {
    await loginViaApi(page, 'admin');
    await openPage(page, 'projects');

    const layout = await page.evaluate(() => {
      const nav = document.querySelector('aside');
      const main = document.querySelector('main');
      const nr = nav.getBoundingClientRect();
      const mr = main.getBoundingClientRect();
      return {
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
        navBottomGap: Math.abs(window.innerHeight - nr.bottom),
        navWithinViewport: nr.left >= 0 && nr.right <= window.innerWidth + 1,
        mainWithinViewport: mr.left >= 0 && mr.right <= window.innerWidth + 1
      };
    });
    assert.equal(layout.viewportWidth, 390);
    assert.ok(layout.documentWidth <= layout.viewportWidth + 1, 'Trang bi tran ngang');
    assert.ok(layout.navBottomGap <= 1 && layout.navWithinViewport, 'Thanh dieu huong mobile khong bam day/man hinh');
    assert.ok(layout.mainWithinViewport, 'Noi dung chinh vuot khoi man hinh');

    await page.click('#newProjectButton');
    await page.waitForSelector('#modal.show');
    const modal = await page.locator('#modal .modalbox').boundingBox();
    assert.ok(modal, 'Khong mo duoc hop thoai them cong trinh');
    assert.ok(modal.x >= 0 && modal.y >= 0, 'Hop thoai nam ngoai canh tren/trai');
    assert.ok(modal.x + modal.width <= 391, 'Hop thoai tran ngang');
    assert.ok(modal.y + modal.height <= 845, 'Hop thoai tran doc');
    assert.deepEqual(page.__console, [], 'Co loi console tren giao dien mobile');
  }, { viewport: { width: 390, height: 844 } });
};
