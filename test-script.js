$(function () {
    $("div[href]").click(function (event) {
		const resultDiv = document.getElementById('result');
        window.protocolCheck($(this).attr("href"),
            function () {
				resultDiv.innerText = 'fail';
            },
			function () {
				resultDiv.innerText = 'success';
			}
		);
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    });
});
