'use strict';
/*
 * HTML Parser By John Resig (ejohn.org)
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 *
 * // Use like so:
 * document(htmlString, {
 *     start: function(tag, attrs, hasChild) {},
 *     end: function(tag) {},
 *     chars: function(text) {},
 *     comment: function(text) {}
 * });
 *
 * // or to get an XML string:
 * HTMLtoXML(htmlString);
 *
 * // or to get an XML DOM Document
 * HTMLtoDOM(htmlString);
 *
 * // or to inject into an existing document/DOM node
 * HTMLtoDOM(htmlString, document);
 * HTMLtoDOM(htmlString, document.body);
 *
 */
if (typeof bui == 'undefined'    && typeof global != 'undefined') {global.bui = {};}
if (typeof define == 'undefined' && typeof global != 'undefined') {global.define = function(a, b, c){return c();};}
if (typeof bui == 'undefined'    && typeof window != 'undefined') {window.bui = {};}
if (typeof define == 'undefined' && typeof window != 'undefined') {window.define = function(a, b, c){return c();};}

// if you don't like define(), you can remove it, it dosen't matter
define('document.js', ['bui.js','htmlparser.js'], function(){


bui.window = {};
bui.document = {};

bui.document.createElement = function (tagName, options) {
    var me = this,
        clazz = me.getElementConstructor(),
        elem = new clazz();
    for (var i in options) {
        elem[i] = options[i];
    }
    return elem;
};
bui.document.getElementById = function (id) {
    var me = this,
        list = bui.HTMLElement.findAllNodes(bui.document.documentElement),
        result = [];

    for (var i=0,len=list.length; i<len; i++) {
        if (id === list[i].getAttribute('id')){
            result = list[i];
            break;
        }
    }
    return result;
};
bui.document.getElementConstructor = function () {
    return bui.HTMLElement;
};
// 根节点 
bui.document.documentElement = bui.document.createElement('HTML', {childNodes:[], tagName: 'HTML', clazz: 'HTMLElement()', nodeType: 'startTag'});

});