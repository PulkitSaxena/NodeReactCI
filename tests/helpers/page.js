const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory')
const userFactory  = require('../factories/userFactory')

//  using oops class and proxy to create a page.login() (for puppeteer page class obj)
//  But instead of using a monkeypatching (adding function to the puppeteer.page.prototype, 
//  as we did in case of hashing mongoose.Query.prototype.cleanCache())

// We are using the proxy and Class to create a common obj representing 
// all page class functions and our custom functions

class CustomPage {

    // for creation of proxy of custom and original page class
    static async build() {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox']
        });

        const page = await browser.newPage();
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page) {
        this.page = page;
    }

    async login() {
        const user = await userFactory();
        const { session, sig } = sessionFactory(user);
        
        await this.page.setCookie({ name: 'session', value: session } )
        await this.page.setCookie({ name: 'session.sig', value: sig } )
        await this.page.goto('http://localhost:3000/blogs')
        // wait used so that this button shows up on UI once we set cookie and refresh  (not best way of doing it)
        await this.page.waitFor('a[href="/auth/logout"]')
    }

    async getContentsOf(selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }
}

module.exports = CustomPage;
