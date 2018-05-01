const assert = require('assert');

describe('Custom Protocol Detection', () => {
	it('Alerts the protocol is not detected when not available', () => {
		browser.url('http://localhost:8080/example.html');
		const successDiv = $('#success')
		successDiv.click();
		browser.pause(2000)
		try {
			browser.alertText();
			return false;
		} catch(e){
			if (e.message === 'no alert open') {
				browser.reload();
				return true;
			} else {
				console.log(e);
				console.log('Wrong Error - should read no alert open');
				return false;
			}
		}
	});

	it('Calls window.alert when the protocol is not detected', () => {
		browser.url('http://localhost:8080/example.html');
		browser.pause(1000)
		const successDiv = $('#fail');
		successDiv.click();
		browser.pause(2000)
		assert.equal(browser.alertText(), 'protocol not recognized');
	});
});
