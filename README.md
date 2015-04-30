# Custom Protocol Detection in Browser
Detect whether a custom protocol is available in browser (FF, Chrome, IE8, IE9, IE10, and IE11)

The implementation is different from one browser to another, sometimes depend on which OS you are. Most of them are hacks, meaning that the solution is not the prettiest.

* Firefox: try to open the handler in a hidden iframe and catch exception if the custom protocol is not available.
* Chrome: using window onBlur to detect whether the focus is stolen from the browser. When the focus is stolen, it assumes that the custom protocol launches external app and therefore it exists.
* IEs in Win 8: the cleanest solution. IEs in Windows 8 does provide an API to check the existence of custom protocol handlers.
* Other IEs: various different implementation. Worth to notice that even the same IE version might have a different behavior (I suspect due to different commit number). It means that for these IEs, the implementation is the least reliable.
