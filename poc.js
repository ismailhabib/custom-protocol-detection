$(function () {
    $("div[href]").click(function (event) {
        window.protocolCheck($(this).attr("href"),
            function () {
                alert("fail");
            });
        event.preventDefault ? event.preventDefault() : event.returnValue = false;
    });
})
;