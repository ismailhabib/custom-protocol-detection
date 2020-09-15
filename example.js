$(function () {
    $("div[href]").click(function (event) {
        let link = $(this).attr("href")
        console.log("Link = ", link)
        window.protocolCheck(link,
            function () {
               console.log("unrecognized")
            }, function success() {
                console.log("success")
             },  function unSupported() {
                console.log("unSupported")
             })
        event.preventDefault ? event.preventDefault() : event.returnValue = false
    });
});
