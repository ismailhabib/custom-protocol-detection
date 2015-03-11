$(function () {
    function openInModelerUsingChrome(mendixUri, failCb) {
        var timeout = setTimeout(function () {
            failCb && failCb();
        }, 1000);
        $(window).blur(function () {
            clearTimeout(timeout);
        });
        window.location = mendixUri;
    }

    function openInModelerUsingFirefox(mendixUri, failCb) {
        try {
            var iFrame = $("#hiddenIframe")[0];
            iFrame.contentWindow.location.href = mendixUri;
        } catch (e) {
            if (e.name == "NS_ERROR_UNKNOWN_PROTOCOL") {
                failCb && failCb();
            }
        }
    }

    function openInModelerUsingIE(mendixUri, failCb) {
        //check if OS is Win 8 or 8.1
        var ua = navigator.userAgent.toLowerCase();
        var isWin8 = /windows nt 6.2/.test(ua) || /windows nt 6.3/.test(ua);

        if (isWin8) {
            openInModelerUsingIEInWindows8(mendixUri, failCb);
        } else {
            ieVersion = getInternetExplorerVersion();
            if (ieVersion === 10) {
                openInModelerUsingIE10InWindows7(mendixUri, failCb);
            } else {
                openInModelerUsingOtherIEFunkyVersion(mendixUri, failCb);
            }
        }
    }

    function openInModelerUsingIE10InWindows7(mendixUri, failCb) {
        var timeout = setTimeout(function () {
            failCb && failCb();
        }, 1000);
        $(window).blur(function () {
            clearTimeout(timeout);
        });
        var iFrame = $("#hiddenIframe")[0];
        try {
            iFrame.contentWindow.location.href = mendixUri;
        } catch (e) {
            alert("wrong!");
        }
    }

    function openInModelerUsingOtherIEFunkyVersion(mendixUri, failCb) {
        var isSupported = false;
        var myWindow = window.open('', '', 'width=0,height=0');
        myWindow.document.write("<iframe src='" + mendixUri + "'></iframe>");
        setTimeout(function () {
            try {
                myWindow.location.href;
                isSupported = true;
            } catch (e) {
            }

            if (isSupported) {
                myWindow.setTimeout('window.close()', 1000);
            } else {
                myWindow.close();
            }
            if (!isSupported) {
                failCb && failCb();
            }
        }, 1000)
    }

    function openInModelerUsingIEInWindows8(mendixUri, failCb) {
        if (navigator.msLaunchUri) {
            navigator.msLaunchUri(mendixUri,
                function () {
                    window.location = mendixUri;
                },
                function () {
                    failCb && failCb();
                }
            );
        }
    }

    function openInModeler(mendixUri, failCb) {
        var browser = checkBrowser();
        if (browser.isFirefox) {
            openInModelerUsingFirefox(mendixUri, failCb);
        } else if (browser.isChrome) {
            openInModelerUsingChrome(mendixUri, failCb);
        } else if (browser.isIE) {
            openInModelerUsingIE(mendixUri, failCb);
        }
    }

    function checkBrowser() {
        return {
            isOpera: !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0,
            // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
            isFirefox: typeof InstallTrigger !== 'undefined',   // Firefox 1.0+
            isSafari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
            // At least Safari 3+: "[object HTMLElementConstructor]"
            isChrome: !!window.chrome && !isOpera,              // Chrome 1+
            isIE: /*@cc_on!@*/false || !!document.documentMode   // At least IE6
        }
    }

    function getInternetExplorerVersion()
    {
        var rv = -1;
        if (navigator.appName == 'Microsoft Internet Explorer')
        {
            var ua = navigator.userAgent;
            var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat( RegExp.$1 );
        }
        else if (navigator.appName == 'Netscape')
        {
            var ua = navigator.userAgent;
            var re  = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat( RegExp.$1 );
        }
        return rv;
    }

    $("div[href]").click(function (e) {
        openInModeler($(this).attr("href"),
            function () {
                alert("fail");
            });
        (event.preventDefault) ? event.preventDefault() : event.returnValue = false;
    });
})
;