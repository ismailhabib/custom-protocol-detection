const assert = require('assert');

describe('Custom Protocol Detection', () => {
	it('Fires the success callback when the protocol is detected', () => {
		browser.url('http://localhost:8080/test.html');
		const successDiv = $('#success')
		successDiv.click();
		browser.pause(2000)
		assert.equal($('#result').getText(), 'success');
		browser.reload();
	});

	it('Fires the failure callback when the protocol is detected', () => {
		browser.url('http://localhost:8080/test.html');
		browser.pause(1000)
		const successDiv = $('#fail');
		successDiv.click();
		browser.pause(2000)
		assert.equal($('#result').getText(), 'fail');
	});
});
