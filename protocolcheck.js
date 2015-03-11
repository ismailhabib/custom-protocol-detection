window.protocolCheck = (function () {
    function openUriUsingChrome(uri, failCb) {
        var timeout = setTimeout(function () {
            failCb && failCb();
        }, 1000);
        $(window).blur(function () {
            clearTimeout(timeout);
        });
        window.location = uri;
    }

    function openUriUsingFirefox(uri, failCb) {
        if ($("#hiddenIframe").length === 0) {
            $("body").append('<iframe id="hiddenIframe" src="about:blank" style="display:none"></iframe>');
        }
        try {
            var iFrame = $("#hiddenIframe")[0];
            iFrame.contentWindow.location.href = uri;
        } catch (e) {
            if (e.name == "NS_ERROR_UNKNOWN_PROTOCOL") {
                failCb && failCb();
            }
        }
    }

    function openUriUsingIE(uri, failCb) {
        //check if OS is Win 8 or 8.1
        var ua = navigator.userAgent.toLowerCase();
        var isWin8 = /windows nt 6.2/.test(ua) || /windows nt 6.3/.test(ua);

        if (isWin8) {
            openUriUsingIEInWindows8(uri, failCb);
        } else {
            ieVersion = getInternetExplorerVersion();
            if (ieVersion === 10) {
                openUriUsingIE10InWindows7(uri, failCb);
            } else {
                openUriUsingOtherIEFunkyVersion(uri, failCb);
            }
        }
    }

    function openUriUsingIE10InWindows7(uri, failCb) {
        var timeout = setTimeout(function () {
            failCb && failCb();
        }, 1000);
        $(window).blur(function () {
            clearTimeout(timeout);
        });

        if ($("#hiddenIframe").length === 0) {
            $("body").append('<iframe id="hiddenIframe" src="about:blank" style="display:none"></iframe>');
        }
        var iFrame = $("#hiddenIframe")[0];
        try {
            iFrame.contentWindow.location.href = uri;
        } catch (e) {
            alert("wrong!");
        }
    }

    function openUriUsingOtherIEFunkyVersion(uri, failCb) {
        var isSupported = false;
        var myWindow = window.open('', '', 'width=0,height=0');
        myWindow.document.write("<iframe src='" + uri + "'></iframe>");
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

    function openUriUsingIEInWindows8(uri, failCb) {
        if (navigator.msLaunchUri) {
            navigator.msLaunchUri(uri,
                function () {
                    window.location = uri;
                },
                function () {
                    failCb && failCb();
                }
            );
        }
    }

    function checkBrowser() {
        var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        return {
            isOpera: isOpera,
            // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
            isFirefox: typeof InstallTrigger !== 'undefined',   // Firefox 1.0+
            isSafari: Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0,
            // At least Safari 3+: "[object HTMLElementConstructor]"
            isChrome: !!window.chrome && !isOpera,              // Chrome 1+
            isIE: /*@cc_on!@*/false || !!document.documentMode   // At least IE6
        }
    }

    function getInternetExplorerVersion() {
        var rv = -1;
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }
        else if (navigator.appName == 'Netscape') {
            var ua = navigator.userAgent;
            var re = new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }
        return rv;
    }

    var openUri = function(uri, failCb) {
        var browser = checkBrowser();
        if (browser.isFirefox) {
            openUriUsingFirefox(uri, failCb);
        } else if (browser.isChrome) {
            openUriUsingChrome(uri, failCb);
        } else if (browser.isIE) {
            openUriUsingIE(uri, failCb);
        }
    }

    return openUri;
}());
