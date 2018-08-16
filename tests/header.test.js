const Page = require('./helpers/page');

let page;

beforeEach( async () => {
    // calling async  static function
    page = await Page.build()
    return await page.goto('http://localhost:3000')
})

test('The header has the correct text', async () => {
    // const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    const text = await page.getContentsOf('a.brand-logo')
    expect(text).toEqual('Blogster');
})  

test('Click to start the auth flow', async () => {
    await page.click('.right a');

    const pageUrl = await page.url();
    expect(pageUrl).toMatch(/accounts\.google\.com/)
})

test('login user and show logout button', async () => {
    await page.login();
    // const logoutButton = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);
    const logoutButton = await page.getContentsOf('a[href="/auth/logout"]')
    return expect(logoutButton).toEqual('Logout');
})


afterEach( async () => {
    await page.close();
})