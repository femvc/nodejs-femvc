'use strict';
// This line only used in nodejs.
require('define.js');

define('index.js', ['bui.js','htmlparser.js','document.js','control.js','button-group.js'], function(){
    //var opt_str = document.getElementById('content').innerHTML;
    var opt_str = "<div ui=\"type:'ButtonGroup',formName:'cost',value:'50-100',options:['0-50','50-100','100-150','150-200','200+']\"></div><div ui=\"type:'ButtonGroup',formName:'cost',value:'50-100',options:['0-50','50-100','100-150','150-200','200+']\"></div>";
    /*Step 1: 转换string到DOM*/
    // 容器为空的判断
    
    bui.document.documentElement.setInnerHTML(opt_str);
    
    var haiyang = bui.Control.init(bui.document.documentElement, {}, bui.window);
    console.log('haiyang');
    console.log(haiyang);
    
    console.log(bui.document.documentElement.getInnerHTML());
    /*
    // show dom
    //document.getElementById('content').innerHTML = bui.document.documentElement.getInnerHTML();
    document.getElementById('content3').innerHTML = haiyang['_cost_1'].getInnerHTML();
    /*    
        // 在nodejs下不执行initBehavior!
        if (bui.env == 'browser') {
            me.outputToBrowser();
            elem = me.getMain();
            if (elem && elem.getAttribute(bui.env+'_initBehavior') != 'true') {
                me.initBehavior();
                elem.setAttribute(bui.env+'_initBehavior', 'true');
            }
        }
    */
    
    bui.window.initBehavior = function(){};
    bui.Control.prototype.initBehaviorByTree.call(bui.window);
});
/*
//a.js
define('a', [], function(exports){
    var dd = {};
    dd.name = 'out-a';
    dd.out = function () {
        alert(dd.name);
    };
    exports.out = dd.out;
};

//b.js
define('b', ['a'], function(exports){
    require('a.js');
    
    var dd = {};
    dd.name = 'out-b';
    dd.out = function () {
        alert(dd.name);
    };
    exports.out = dd.out;
};


//todo
var aa = require('a.js');
var bb = require('b.js');
aa.out();
bb.out();

// 依赖加载完毕之后再执行!!*/