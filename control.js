'use strict';
//    ____     ____                _   _     ____          ____      ____                   
//  /\  __\  /\  __\    /'\_/`\  /\ \/\ \  /\  __`\      /\  __`\  /\  __`\    /'\_/`\      
//  \ \ \_/_ \ \ \_/_  /\      \ \ \ \ \ \ \ \ \ \_\     \ \ \ \_\ \ \ \ \ \  /\      \     
//   \ \  __\ \ \  __\ \ \ \_/\_\ \ \ \ \ \ \ \ \  __     \ \ \  __ \ \ \ \ \ \ \ \_/\_\    
//    \ \ \_/  \ \ \_/_ \ \ \\ \ \ \ \ \_/ \ \ \ \_\ \  __ \ \ \_\ \ \ \ \_\ \ \ \ \\ \ \   
//     \ \_\    \ \____/ \ \_\\ \_\ \ `\___/  \ \____/ /\_\ \ \____/  \ \_____\ \ \_\\ \_\  
//      \/_/     \/___/   \/_/ \/_/  `\/__/    \/___/  \/_/  \/___/    \/_____/  \/_/ \/_/  
//                                                                                          
//                                                                                          
define('control.js', ['bui.js'], function(){

console.log('control.js');
/**
 * @name 控件基础类
 * @public
 * @author wanghaiyang
 * @date 2013/08/08
 */
bui.Control = function (options, pending) {
    // 指向父控件
    this.parentControl = null;
    
    // 初始化参数
    this.initOptions( options );
    // 生成控件id
    if ( !this.id ) {
        this.id = bui.Control.makeGUID(this.formName);
    }
    
    // 设置main.id
    if (this.main && !this.main.getAttribute('id')) {
        this.main.setAttribute('id', this.id);
    }
    
    // parentControl不传默认为window对象
    var parentControl = bui.Control.get(this.parentControl) || bui.window;
    parentControl.controlMap = parentControl.controlMap || {};
    
    // 默认为根控件,若不是则会在后面render时覆盖parentControl属性
    parentControl.controlMap[ this.id ] = this;
    this.parentControl = parentControl;
    
    // 子类调用此构造函数不可以立即执行!!只能放在子类的构造函数中执行!否则实例化时找不到子类中定义的属性!
    // 进入控件处理主流程!
    if (pending != 'pending') {
        this.enterControl();
    }
};

bui.Control.prototype = {
    /**
     * @name 初始化参数
     * @protected
     * @param {Object} options 参数集合
     */
    initOptions: function ( options ) {
        for (var k in options) {
            this[k] = options[k];
        }
    },
    // 注: controlMap不能放在这里,放在这里会导致"原型继承属性只是用一个副本的坑"!!
    // controlMap: {},
    /**
     * @name 获取dom子部件的css class
     * @protected
     * @return {string}
     */
    getClass: function(opt_key) {
        if (!this.type) {
            return '';
        }
        
        var me = this,
            type = String(me.type).toLowerCase(),
            className = 'ui-' + type,
            skinName = 'skin-' + type + '-' + me.skin;

        if (opt_key) {
            className += '-' + opt_key;
            skinName += '-' + opt_key;
        }

        if (me.skin) {
            className = skinName + ' ' + className;
        }

        return className;
    },

    /**
     * @name 获取dom子部件的id
     * @public
     * @return {string}
     */
    getId: function(key) {
        var me = this,
            // uiAttr = bui.Control.UI_ATTRIBUTE || 'ui';
            // idPrefix = 'ctrl' + this.type + this.id;
            idPrefix = this.id;
        
        if (key) {
            idPrefix = idPrefix + key;
        }
        return idPrefix;
    },
    /**
     * @name 获取控件的elem(nodejs). 注:控件即使不需要显示任何内容也必须有一个挂载的elem(可以是隐藏的),通过模板解析控件时会用到
     * @public
     * @return {string}
     */
    getMain: function () {
        var me = this,
            elem = typeof (me.main) != 'string' ? me.main : 
            (me.viewOutput && typeof (document) != 'undefined' ? 
            document.getElementById(me.main) : 
            bui.document.getElementById(me.main));
        return elem;
    },
    /**
     * @name 获取控件的elem(browser). 注:控件即使不需要显示任何内容也必须有一个挂载的elem(可以是隐藏的),通过模板解析控件时会用到
     * @public
     * @return {string}
     */
    getRealMain: function () {
        var me = this;
        return document.getElementById(me.main);
    },
    /**
     * @name 获取控件的innerHTML
     * @public
     * @return {string}
     */
    getInnerHTML: function () {
        var me = this,
            elem = me.getMain(),
            html = '';
        if (elem) {
            html = elem.getInnerHTML();
        }
        return html;
    },
    /**
     * @name 设定控件的innerHTML
     * @public
     * @return {string}
     */
    setInnerHTML: function (html) {
        var me = this,
            elem = me.getMain();
        if (elem) {
            elem.setInnerHTML(html);
        }
    },
    /**
     * @name 渲染控件
     * @public
     */
    render: function() {
        var me = this,
            elem = me.getMain();
        if (elem && elem.getAttribute(bui.env+'_initView') != 'true') {
            bui.Control.addClass(elem, me.getClass());
            me.initView();
            elem.setAttribute(bui.env+'_initView', 'true');
        }
    },
    /**
     * @name 生成HTML
     * @public
     */
    initView: function () {
    },
    /**
     * @name 绑定事件
     * @public
     */
    initBehavior: function () {
        var me = this,
            elem = me.getRealMain();
    },
    initBehaviorByTree: function () {
        var me = this;
        if (me.controlMap) {
            for (var i in me.controlMap) {
                me.controlMap[i].initBehaviorByTree();
            }
        }
        me.initBehavior();
    },
    /**
     * @name 验证控件的值
     * @public
     */
    validate: function() {
        var me = this,
            result = true,
            i, 
            len,    
            controlMap = me.controlMap;
        
        if (me.rule && (!me.state || !me.state.disabled)) {
            if (Object.prototype.toString.call(me.rule)!=='[object Array]') {
                me.rule = [me.rule];
            }
            for (i=0, len=me.rule.length; i<len && result; i++) {
                if (me.rule[i]) {
                    result = result && bui.Validator.applyRule(me, me.rule[i]);
                }
            }
        }
        
        if (result && controlMap && (!me.state || !me.state.disabled)) {
            for(i in controlMap){
                if(i && controlMap[i] && controlMap[i].rule){
                    result = controlMap[i].validate() && result;
                }
            }
        }
        
        return result;
    },
    /**
     * @name 返回控件的值
     * @public
     */
    //getValue:   new Function(), // 注: 控件直接返回值(对象/数组/字符串)时才能使用getValue! 获取所有子控件的值,应该用getParamMap
    setValue:   new Function(),
    /**
     * @name 给控件树一次性赋值
     * @param {Object} v 值
     */
    setValueByTree:   function (v) {
        var me = this,
            controlMap = me.controlMap,
            control;
        if (controlMap && v) {
            for (var i in v) {
                control = controlMap[i] || me.getByFormName(i);
                if (!control) {continue;}
                if (control.constructor && 
                    control.constructor.prototype && 
                    control.constructor.prototype.hasOwnProperty && 
                    control.constructor.prototype.hasOwnProperty('setValue')){
                    
                    control.setValue(v[i]);
                }
                else if (control.controlMap) {
                    control.setValueByTree(v[i]);
                }
                control = null;
            }
        }
    },
    /**
     * @name 获取子控件的值，返回一个map
     * @public
     */
    getParamMap: function() {
        var me = this,
            paramMap = {},
            childControl,
            formName;
        // 如果有子控件建议递归调用子控件的getValue!!
        if (me.controlMap) {
            for (var i in me.controlMap) {
                if (me.controlMap[i]) {
                    childControl = me.controlMap[i];
                    formName = childControl.getFormName();
                    
                    if (childControl.getValue) {
                        paramMap[formName] = childControl.getValue();
                    }
                    else if (childControl.controlMap){
                        paramMap[formName] = childControl.getParamMap();
                    }
                }
            }
        }
        
        return paramMap;
    },
    /**
     * @name 通过formName访问子控件
     * @public
     * @param {String} formName 子控件的formName
     */
    getByFormName: function (formName) {
        var me = this;
        return bui.Control.getByFormName(formName, me);
    },
    /**
     * @name 获取表单控件的表单名
     * @public
     * @param {Object} control
     */
    getFormName: function() {
        var me = this,
            node = me.getMain(),
            elem = me.getRealMain();
        var itemName = me.formName || me['name'] || 
            (elem ? elem.getAttribute('name') : null) || 
            (node ? node.getAttribute('name') : null) || me.getId();
        return itemName;
    },
    /**
     * @name 释放控件
     * @protected
     */
    dispose: function() {},
    /**
     * @name Control的主要处理流程
     * @protected
     * @param {Object} argMap arg表.
     */
    enterControl: function(){
        var uiObj = this,
            objId = uiObj.getId(),
            elem,
            control,
            parentControl = uiObj.parentControl;
        
        elem = uiObj.getMain();
        if ( elem ) {
            // 便于通过elem.control找到control
            elem.control = objId;
            // 动态生成control需手动维护me.parentControl
            // 回溯找到父控件,若要移动控件,则需手动维护parentControl属性!!
            while(elem && elem.tagName && 'html,body'.indexOf(String(elem.tagName).toLowerCase()) < 0){
                elem = elem.parentNode;
                //label标签自带control属性!!
                if (elem && elem.getAttribute && elem.control  && Object.prototype.toString.call(elem.control)==='[object String]') {
                    control = bui.Control.get(elem.control, parentControl);
                    bui.Control.appendControl(control, uiObj);
                    break;
                }
            }
            
            // bui.Control.elemList.push(uiObj);
            // 设计用来集中缓存索引,最后发现不能建,建了垃圾回收会有问题!!
            
            // 每个控件渲染开始的时间。
            uiObj.startRenderTime = new Date();
            
            if (uiObj.render){
                uiObj.render();
            }
            /*注: 如果isRendered为false则默认调用父类的渲染函数,子类的render中有异步情况需特殊处理!
            if (!uiObj.isRendered){
                uiObj.constructor.superClass.prototype.render.call(uiObj);
            }
            //注释掉的原因：调用父类的render应该由子类自己决定!
            */
            var uiAttr = bui.Control.UI_ATTRIBUTE || 'ui';
            elem = uiObj.getMain();
            if (elem) {
                // 解除obj对DOM的引用!
                uiObj.main = elem.getAttribute('id');
                
                //注释掉原因,导出到browser的html中不能还原! 
                //elem.setAttribute('_' + uiAttr, elem.getAttribute(uiAttr));
                //elem.removeAttribute(uiAttr);
            }
            
            uiObj.endRenderTime = new Date();
        }
    }
};

/*
 * @name BUI组件方法库
 * @static
 * @private
 */

/**
 * @name 获取唯一id
 * @public
 * @return {string}
 */
bui.Control.makeGUID = (function(){
    var guid = 1;
    return function(formName){
        return '_' + (formName ? formName : 'inner') + '_' + ( guid++ );
    };
})();

/**
 * @name 初始化控件渲染
 * @public
 * @param {HTMLElement} opt_wrap 渲染的区域容器元素
 * @param {Object}      opt_propMap 控件需要用到的数据Model{@key}
 * @param {Object}      parentControl 渲染的action,不传则默认为window对象
 * @return {Object} 控件集合
 */
//bui.Control.init('<div ui="type:"></div>');
//bui.Control.init(bui.document.getElementById('content'));
bui.Control.init = function ( opt_wrap, opt_propMap, parentControl ) {
    /*Step 1: 转换string到DOM
    // 容器为空的判断
    if (typeof (opt_wrap) == 'string') {
        bui.document.documentElement.setInnerHTML(opt_wrap);
        opt_wrap = bui.document.documentElement;
    }*/
    
    /*Step 2: 转换DOM到control*/
    opt_propMap = opt_propMap || {}; // 这里并不会缓存BaseModel，因此销毁空间时无须担心BaseModel
    // parentControl不传默认为window对象
    parentControl = parentControl || bui.window;
    parentControl.controlMap = parentControl.controlMap || {};
    
    var uiAttr = bui.Control.UI_ATTRIBUTE || 'ui';
    var realEls = [];
    var attrs, attrStr, attrArr, attrArrLen, attrSegment;
    var attr, attrName, attrValue, extraAttrMap;
    var elem, objId, control;
    
    // 把dom元素存储到临时数组中
    // 控件渲染的过程会导致elements的改变
    realEls = bui.HTMLElement.findAllNodes(opt_wrap);
    
    // 循环解析自定义的ui属性并渲染控件
    // <div ui="type:'UIType',id:'uiId',..."></div>
    for (var i=0,len=realEls.length; i<len; i++) {
        elem = realEls[ i ];
        
        if (elem && elem.getAttribute && elem.getAttribute( uiAttr ) && elem.getAttribute(bui.env+'_initView') != 'true') {
            attrStr = elem.getAttribute( uiAttr );
            attrStr = '{' + attrStr + '}';
            
            // 解析ui属性
            attrs = (new Function('return '+attrStr))();
            for (var j in attrs) {
                // 通过@定义的需要到传入的model中找
                attrValue = attrs[j];
                if (attrValue && typeof attrValue == 'string' && attrValue.indexOf('@') === 0) {
                    attrName = attrValue.substr(1);
                    
                    attrValue = opt_propMap[attrName];
                    // 默认读取opt_propMap中的,没有再到全局context中取,防止强耦合.
                    if (attrValue === undefined && bui && bui.context && bui.context.get) { 
                        attrValue = bui.context.get(attrName);
                    }
                    attrs[j] = attrValue;
                }
            }
            
            // 创建并渲染控件
            objId = attrs[ 'id' ];
            if ( !objId ) {
                objId = bui.Control.makeGUID(attrs['formName']);
                attrs[ 'id' ] = objId;
            }           
            /*extraAttrMap = opt_propMap[ objId ];
            // 将附加属性注入
            for ( k in extraAttrMap ) {
                attrs[ k ] = attrs[ k ] || extraAttrMap[ k ];
            }*/
            
            // 主元素参数初始化
            if(attrs.main          == undefined && elem)          {attrs.main = elem;}
            if(attrs.parentControl == undefined && parentControl) {attrs.parentControl = parentControl;}
            // 生成控件 //这里的parentControl, elem不能去掉!!否则在后面的enterControl理会重复生成elem!!! 
            //control = bui.Control.create( attrs[ 'type' ], attrs, parentControl, elem);
            //放在了上上一行,故去掉了parentControl, elem
                        
            control = bui.Control.create( attrs[ 'type' ], attrs);
            /**
             * 保留ui属性便于调试与学习
             */
            // elem.setAttribute( uiAttr, '' );
        }
    }
    
    return parentControl.controlMap;
};
/**
 * @name 创建控件对象
 * @public
 * @param {string} type 控件类型
 * @param {Object} options 控件初始化参数
 * @return {bui.Control} 创建的控件对象
 */
bui.Control.create = function ( type, options) {
    options = options || {};

    var uiClazz = bui[ type ],
        objId   = options.id,
        uiObj   = null,
        elem,
        control,
        k;

    if ( objId !== undefined && objId !== null && objId !== '' && uiClazz ) {
        // 1. 模版批量生成控件时，options里一般没有m ain，m ain指向元素自身! //注:已改成默认有m ain
        // 2. new的方式创建控件时，options里一般有m ain!
        // 在这里设置m ain属性注意不能覆盖new uiClazz(options)的设置,也便于后面render时重新设置
        //if(options.m ain == undefined && m ain) {options.m ain = m ain;}//注:已移动到bui.Control.init中了
        
        // 设置临时parentControl放置子控件//注释掉原因:创建控件默认放在bui.window下//放到bui.Control.init中了
        //if(options.parentControl == undefined && parentControl) {options.parentControl = parentControl;}
        /**
         * 创建控件对象
         */
        uiObj = new uiClazz(options);
        /*Hack方式不利于理解程序，所以去掉!!*/
            /**
             * 调用父类的构造函数
             *
            bui.Control.call( uiObj, options );
            /**
             * 再次调用子类的构造函数
             * 
             * @comment 这里为什么不直接放到new uiClazz(options)里呢? 因为调用父类的构造函数会被覆盖掉.
             *
            uiClazz.call( uiObj, options );/*已废弃*
            /**/
            /*uiObj.clazz = uiClazz;// 已经使用this.constructor代替*/
    }

    return uiObj;
};

/**
 * @name 父控件添加子控件. 注: 将子控件加到父控件下面的容器中也可以调用appendSelfTo
 * @public
 * @param {Control} uiObj 子控件.
 */
bui.Control.appendControl = function(parent, uiObj) {
    var ctrId = uiObj.getId(),
        parentControl;
    
    if (uiObj.parentControl && ((parentControl = bui.Control.get(uiObj.parentControl))||{}).controlMap) {
        parentControl.controlMap[ctrId] = undefined;
        delete parentControl.controlMap[ctrId];
    }
    
    // !!!悲催的案例,如果将controlMap放在prototype里, 这里parent.controlMap===uiObj.controlMap!!!
    parent.controlMap[ctrId] = uiObj;
    // 重置parentControl标识
    uiObj.parentControl = parent;
    
    // 
};

/**
 * @name 获取父控件或Action下所有控件
 * @public
 * @param {Object} control
 */
bui.Control.findAllControl = function(parentControl){
    var i, len, k, v,
        childNode,
        elements,
        list,
        childlist,
        node;
    elements=[];
    list=[parentControl];
    
    while(list.length){
        childNode= list.pop();
        if(!childNode) continue;
        elements.push(childNode);
        childlist = childNode.controlMap;
        if(!childlist) continue;
        for(i in childlist){
            node = childlist[i];
            list.push(node);
        }
    }
    // 去掉顶层父控件或Action,如不去掉处理复合控件时会导致死循环!!
    if(elements.length>0) elements.shift();
    return elements;
};
/**
 * @name 所有控件实例的索引. 注释掉原因: 建了索引会造成无法GC内存暴涨!
 */
// bui.Control.elemList = [];

/**
 * @name 根据控件id找到对应控件
 * @public
 * @parent可不传,默认从当前Action开始找
 * @id 控件ID
 * @param {String} 控件id
 */
bui.Control.get = function(id, parentControl){
    var me = this,
        list,
        result = null;
    // parentControl || bui.Control.get(parentControl) || bui.Action.get(parentControl) || bui.Action.get() || window
    if (typeof parentControl == 'string') {
        parentControl = bui.Control.get(parentControl);
    }
    parentControl = parentControl || bui.window;
    
    if (id === undefined || id === parentControl.id) {
        result = parentControl;
    }
    else if (parentControl) {
        list = bui.Control.findAllControl(parentControl);
        for (var i=0,len=list.length; i<len; i++) {
            if(list[i].id == id){
                result = list[i];
            }
        }
    }
    
    return result;
};
/**
 * @name 根据控件formName找到对应控件
 * @static
 * @param {String} 控件formName
 */
bui.Control.getByFormName = function(formName, parentControl){
    var me = this,
        list,
        result = null;
    // 确定parentControl
    parentControl = bui.Control.get(parentControl);
    
    if (formName) {
        formName = String(formName);
        
        // 先查找自身及直接子级
        list = parentControl && parentControl.controlMap ? parentControl.controlMap : {};
        list.unshift(parentControl);
        for (var i in list) {
            if (list[i].getFormName() === formName) {
                result = list[i];
                break;
            }
        }
        // 未找到再遍历控件树
        list = !result && parentControl && parentControl.controlMap ? bui.Control.findAllControl(parentControl) : {};
        for (var i in list) {
            if (list[i].getFormName() === formName) {
                result = list[i];
                break;
            }
        }
    }
    
    return result;
};

/**
 * @name 为目标元素添加className
 * @public
 * @param {HTMLElement|string} element 目标元素或目标元素的id
 * @param {string} className 要添加的className，允许同时添加多个class，中间使用空白符分隔
 * @remark
 * 使用者应保证提供的className合法性，不应包含不合法字符，className合法字符参考：http://www.w3.org/TR/CSS2/syndata.html。
 * @returns {HTMLElement} 目标元素
 */
bui.Control.addClass = function (element, className) {
    bui.Control.removeClass(element, className);
    element.className = (element.className +' '+ className).replace(/(\s)+/ig," ");
    return element;
};
bui.Control.removeClass = function(element, className) {
    var list = className.replace(/\s+/ig, ' ').split(' '),
        str = element.className||'';
    var i,len,k,v;
    for (i=0,len=list.length; i < len; i++){
         str = (" "+str.replace(/(\s)/ig,"  ")+" ").replace(new RegExp(" "+list[i]+" ","g")," ");
    }
    str = str.replace(/(\s)+/ig," ");
    str = str.replace(/^(\s)+/ig,'').replace(/(\s)+$/ig,'');
    element.className = str;
    return element;
};
/**
 * @name 对目标字符串进行格式化
 * @public
 * @param {string} source 目标字符串
 * @param {Object|string...} opts 提供相应数据的对象或多个字符串
 * @returns {string} 格式化后的字符串
 */
bui.Control.format = function (source, opts) {
    source = String(source);
    var data = Array.prototype.slice.call(arguments,1), toString = Object.prototype.toString;
    if(data.length){
        data = (data.length == 1 ? 
            /* ie 下 Object.prototype.toString.call(null) == '[object Object]' */
            (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
            : data);
        return source.replace(/#\{(.+?)\}/g, function (match, key){
            var replacer = data[key];
            // chrome 下 typeof /a/ == 'function'
            if('[object Function]' == toString.call(replacer)){
                replacer = replacer(key);
            }
            return ('undefined' == typeof replacer ? '' : replacer);
        });
    }
    return source;
};

/*  
  将String类型解析为Date类型.  
  parseDate('2006-1-1') return new Date(2006,0,1)  
  parseDate(' 2006-1-1 ') return new Date(2006,0,1)  
  parseDate('2006-1-1 15:14:16') return new Date(2006,0,1,15,14,16)  
  parseDate(' 2006-1-1 15:14:16 ') return new Date(2006,0,1,15,14,16);  
  parseDate('不正确的格式') retrun null  
*/   
bui.Control.parseDate = function(str){
    str = String(str).replace(/^[\s\xa0]+|[\s\xa0]+$/ig, ''); 
    var results = null; 
     
    //秒数 #9744242680 
    results = str.match(/^ *(\d{10}) *$/);   
    if(results && results.length>0)   
      return new Date(parseInt(str)*1000);    
     
    //毫秒数 #9744242682765 
    results = str.match(/^ *(\d{13}) *$/);   
    if(results && results.length>0)   
      return new Date(parseInt(str));    
     
    //20110608 
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) *$/);   
    if(results && results.length>3)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));    
     
    //20110608 1010 
    results = str.match(/^ *(\d{4})(\d{2})(\d{2}) +(\d{2})(\d{2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]));    
     
    //2011-06-08 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) *$/);   
    if(results && results.length>3)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]));    
     
    //2011-06-08 10:10 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]));    
     
    //2011-06-08 10:10:10 
    results = str.match(/^ *(\d{4})[\._\-\/\\](\d{1,2})[\._\-\/\\](\d{1,2}) +(\d{1,2}):(\d{1,2}):(\d{1,2}) *$/);   
    if(results && results.length>6)   
      return new Date(parseInt(results[1]),parseInt(results[2]) -1,parseInt(results[3]),parseInt(results[4]),parseInt(results[5]),parseInt(results[6]));    
     
    return (new Date(str));   
};

bui.Control.formatDate = function(date, fmt) {      
    if(!date) date = new Date(); 
    fmt = fmt||'yyyy-MM-dd HH:mm'; 
    var o = {      
    "M+" : date.getMonth()+1, //月份      
    "d+" : date.getDate(), //日      
    "h+" : date.getHours()%12 == 0 ? 12 : date.getHours()%12, //小时      
    "H+" : date.getHours(), //小时      
    "m+" : date.getMinutes(), //分      
    "s+" : date.getSeconds(), //秒      
    "q+" : Math.floor((date.getMonth()+3)/3), //季度      
    "S" : date.getMilliseconds() //毫秒      
    };      
    var week = {      
    "0" : "/u65e5",      
    "1" : "/u4e00",      
    "2" : "/u4e8c",      
    "3" : "/u4e09",      
    "4" : "/u56db",      
    "5" : "/u4e94",      
    "6" : "/u516d"     
    };      
    if(/(y+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));      
    }      
    if(/(E+)/.test(fmt)){      
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[date.getDay()+""]);      
    }      
    for(var k in o){      
        if(new RegExp("("+ k +")").test(fmt)){      
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));      
        }      
    }      
    return fmt;      
};

});