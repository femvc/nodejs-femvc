'use strict';
if (typeof (define)  == 'undefined') {
    //define('2.js',['bui.js','htmlparser.js'], function(exports){exports.todo='...';});
    var define = function (name, deps, fun) {
        //Allow for anonymous modules
        if (typeof name !== 'string') {
            //Adjust args appropriately
            fun = deps;
            deps = name;
            name = null;
        }

        //This module may not have dependencies
        if (!deps || !deps.splice) {
            fun = deps;
            deps = null;
        }

        deps = deps && deps.splice && deps.length ? deps : [];
        
        define.modules = define.modules || [];
        define.modules.push({
            name: name, 
            depend: deps, 
            left: deps.join(',').replace(/[ ]/g, ''), 
            todo: fun, 
            loaded: false,
            exports: {}
        });
        
        for (var i=0,len=deps.length; i<len; i++) {
            var url = deps[i];
            require(url);
            // File loaded immediately in Nodejs.
            if (typeof (window) == 'undefined') {
                define.loaded.push(url);
            }
        }
        define.checkDepend();
    };
    define.loaded = [];
    define.scripts = ['define.js'];
    define.checkDepend = function () {
        define.modules = define.modules || [];
        var list = define.modules,
            loaded = define.loaded,
            url;
        for (var j=0,len2=loaded.length; j<len2; j++) {
            url = loaded[j];
            for (var i=0,len=list.length; i<len; i++) {
                
                list[i].left = list[i].left.replace(','+url, '').replace(url+',', '').replace(url, '');
                if (list[i].left.length<1 && !list[i].loaded) {
                    console.log(list[i].left);
                    list[i].loaded = true;
                    list[i].todo(list[i].exports);
                }
            }
        }
    };
    (typeof (global) == 'undefined' ? window.define = define : global.define = define);
};
// require for window
if (typeof (require) == 'undefined') {
    // require('define.js');
    var require = function(url) { 
        var exist = false;
        // Check loaded url
        for (var j=0,len2=define.scripts.length; j<len2; j++) {
            if (define.scripts[j] == url) {
                exist = true;
                break;
            }
        }
        if (exist) { return; }
        define.scripts.push(url);
        
        var callback = function() { 
            // Check depends
            if (typeof (define) != 'undefined' && define.checkDepend) {
                define.loaded.push(url);
                define.checkDepend();
                //alert(url);
            }
        };
        
        window.require.onloadStack = window.require.onloadStack || [];
        window.require.onloadStack.push(callback);        
        
        if (document.body != null || (document.getElementsByTagName && document.getElementsByTagName('body')[0] != null)) { 
            //write ready function here 
            var domscript = document.createElement('script'); 
            domscript.src = url; 
            
            // 先把js或者css加到页面: head.appendChild(node);
            // onload为IE6-9/OP下创建CSS的时候，或IE9/OP/FF/Webkit下创建JS的时候
            // onreadystatechange为IE6-9/OP下创建CSS或JS的时候
            domscript.onload = domscript.onreadystatechange = function(){
                // !this.readyState 为不支持onreadystatechange的情况，或者OP下创建CSS的情况
                // this.readyState === "loaded" 为IE/OP下创建JS的时候
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
                    this.onload = this.onreadystatechange = null; //防止IE内存泄漏
                    //alert('loaded, run callback');
                    callback();
                }
            }

            document.getElementsByTagName('head')[0].appendChild(domscript); 
        }
        else {
            document.write('<script type="text/javascript" src="' + url + '"' +
            ' onload="window.require.onloadStack[' + (window.require.onloadStack.length-1) + ']()"><'+'/script>'); 
        }
    };
    window.require = require;
}
// global for window
if (typeof (global)  == 'undefined') {
    window.global = window;
}
