#!/usr/bin/env node
'use strict';

var commander = require('commander');
var path = require('path');
var fsSync = require('fs');
var util = require('util');
var jsdom = require('jsdom');
var Mustache = require('mustache');
var fs$4 = require('fs-extra');
var CleanCSS = require('clean-css');
var terser = require('terser');
var liveServer = require('live-server');
var chalk = require('chalk');
var simpleGit = require('simple-git');
var chokidar = require('chokidar');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fsSync__default = /*#__PURE__*/_interopDefaultLegacy(fsSync);
var Mustache__default = /*#__PURE__*/_interopDefaultLegacy(Mustache);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs$4);
var CleanCSS__default = /*#__PURE__*/_interopDefaultLegacy(CleanCSS);
var liveServer__default = /*#__PURE__*/_interopDefaultLegacy(liveServer);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var simpleGit__default = /*#__PURE__*/_interopDefaultLegacy(simpleGit);
var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class ContextTree {
    /**
     *
     */
    constructor(c) {
        this.root = {
            id: c.name,
            data: c,
            children: [],
        };
    }
    findLeafNodes() {
        const leafNodes = [];
        this.traverseSync(this.root, (n) => {
            if (n.children && n.children.length)
                return;
            leafNodes.push(n);
        });
        return leafNodes;
    }
    find(id) {
        let node = null;
        this.traverseSync(this.root, (n) => {
            if (n.id == id)
                node = n;
        });
        return node;
    }
    remove(id) {
        const node = this.find(id);
        if (!node)
            return null;
        const parent = this.find(this.getParendId(node.id));
        parent.children = parent.children.filter((c) => c.id != node.id);
        return node;
    }
    getParendId(id) {
        return id.split("-").slice(0, -1).join("-");
    }
    add(c) {
        if (this.find(c.name))
            return null;
        const parent = this.find(this.getParendId(c.name));
        if (!parent)
            return null;
        const newNode = {
            id: c.name,
            data: c,
            children: [],
        };
        parent.children.push(newNode);
        return newNode;
    }
    traverseSync(start, callback) {
        const stack = [start];
        const visited = new Map();
        while (stack.length) {
            const current = stack.pop();
            if (current.children && !visited.has(current.id)) {
                stack.push(current, ...current.children.slice().reverse());
                visited.set(current.id, true);
                continue;
            }
            callback(current);
        }
    }
    traverse(start, callback) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Not implemented!");
        });
    }
}

const fs$3 = {
    readFile: util.promisify(fsSync__default["default"].readFile),
    writeFile: util.promisify(fsSync__default["default"].writeFile),
    mkdir: util.promisify(fsSync__default["default"].mkdir),
    readdir: util.promisify(fsSync__default["default"].readdir),
};
//Helper functions
const dirContextFilter = (c) => !c.name.endsWith("-.") &&
    !c.name.endsWith("-..") &&
    fsSync__default["default"].statSync(c.path).isDirectory();
const mapDirToContext = (parent, d) => {
    return {
        name: parent.name ? `${parent.name}-${d}` : d,
        path: path__default["default"].resolve(parent.path, d),
    };
};
const readContextDirs = (c) => __awaiter(void 0, void 0, void 0, function* () { return fs$3.readdir(path__default["default"].resolve(c.path)); });
//Default Builder implementation
class ContextTreeBuilder {
    constructor(contextsRoot) {
        this.rootContext = {
            name: "",
            path: path__default["default"].resolve(contextsRoot),
        };
    }
    build() {
        return __awaiter(this, void 0, void 0, function* () {
            const tree = new ContextTree(this.rootContext);
            const stack = [this.rootContext];
            while (stack.length) {
                const current = stack.pop();
                tree.add(current);
                const children = yield this.scanForChildDirContexts(current);
                if (children) {
                    stack.push(...children.slice().reverse());
                }
            }
            return tree;
        });
    }
    scanForChildDirContexts(currContext) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield readContextDirs(currContext))
                .map((d) => mapDirToContext(currContext, d))
                .filter((c) => dirContextFilter(c));
        });
    }
}

class MapComponentRegistry {
    constructor(components) {
        this.componentsMap = new Map();
        if (components) {
            for (const comp of components) {
                this.componentsMap.set(comp.name.toUpperCase(), comp);
            }
        }
    }
    getAllComponents() {
        const componenets = [];
        this.componentsMap.forEach((v) => {
            componenets.push(v);
        });
        return componenets;
    }
    getComponent(compName) {
        if (!this.componentsMap.has(compName.toUpperCase()))
            return null;
        return this.componentsMap.get(compName.toUpperCase());
    }
    addComponent(comp) {
        this.componentsMap.set(comp.name.toUpperCase(), comp);
    }
    removeComponent(compName) {
        const comp = this.getComponent(compName.toUpperCase());
        if (comp) {
            this.componentsMap.delete(compName.toUpperCase());
        }
        return comp;
    }
    toJSON() {
        return this.getAllComponents();
    }
}

const fs$2 = {
    readFile: util.promisify(fsSync__default["default"].readFile),
    writeFile: util.promisify(fsSync__default["default"].writeFile),
    mkdir: util.promisify(fsSync__default["default"].mkdir),
};
class ComponentBuilder {
    constructor(componentsRoot) {
        this.componentsRoot = componentsRoot;
    }
    getComponentsContexts() {
        return __awaiter(this, void 0, void 0, function* () {
            const treeBuilder = new ContextTreeBuilder(this.componentsRoot);
            const tree = yield treeBuilder.build();
            const componentContexts = tree
                .findLeafNodes()
                .map((n) => n.data);
            return componentContexts;
        });
    }
    buildComponentHtml(componentDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const htmlPath = path__default["default"].resolve(componentDir, "index.html");
            const isHtml = fsSync__default["default"].existsSync(htmlPath);
            return isHtml ? (yield fs$2.readFile(htmlPath)).toString() : null;
        });
    }
    buildComponentCss(componentDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const cssPath = path__default["default"].resolve(componentDir, "style.css");
            const isCss = fsSync__default["default"].existsSync(cssPath);
            return isCss ? (yield fs$2.readFile(cssPath)).toString() : null;
        });
    }
    buildComponentJs(componentDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const jsPath = path__default["default"].resolve(componentDir, "script.js");
            const isJs = fsSync__default["default"].existsSync(jsPath);
            return isJs ? (yield fs$2.readFile(jsPath)).toString() : null;
        });
    }
    buildComponentDoc(componentDir) {
        return __awaiter(this, void 0, void 0, function* () {
            const docPath = path__default["default"].resolve(componentDir, "doc.md");
            const isDoc = fsSync__default["default"].existsSync(docPath);
            return isDoc ? (yield fs$2.readFile(docPath)).toString() : null;
        });
    }
    buildAllComponentParts(componentDir) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                html: yield this.buildComponentHtml(componentDir),
                css: yield this.buildComponentCss(componentDir),
                js: yield this.buildComponentJs(componentDir),
                doc: yield this.buildComponentDoc(componentDir),
            };
        });
    }
    buildComponent(compContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const { html, css, js, doc } = yield this.buildAllComponentParts(compContext.path);
            const isComponent = html || css || js;
            if (!isComponent)
                return null;
            return {
                name: compContext.name,
                html,
                css,
                js,
                doc,
                dependecies: [],
            };
        });
    }
    buildAllComponents() {
        return __awaiter(this, void 0, void 0, function* () {
            const componentContexts = yield this.getComponentsContexts();
            const components = [];
            for (const context of componentContexts) {
                const component = yield this.buildComponent(context);
                if (component)
                    components.push(component);
            }
            const registry = new MapComponentRegistry(components);
            // for (const comp of components) {
            //   const rndr = new ComponentRendererJSDOM(comp.name, registry);
            //   comp.dependecies = rndr.findDependecies();
            // }
            return registry;
        });
    }
}

class ComponentRegisterRendererJSDOM {
    constructor(registry) {
        this.registry = registry;
    }
    extractProps(htmlEl) {
        var _a;
        const props = {};
        const propPrefixes = ["lb-props-", "tp-"]; //todo: lb-props- deprecated
        for (let i = 0; i < ((_a = htmlEl.attributes) === null || _a === void 0 ? void 0 : _a.length); i++) {
            const attr = htmlEl.attributes.item(i);
            const prefix = propPrefixes.find((p) => attr.name.startsWith(p));
            if (!prefix)
                continue;
            props[attr.name.replace(prefix, "")] = attr.value;
        }
        return props;
    }
    _traverseElement(el, callback) {
        if (!el)
            return;
        for (let i = 0; i < el.children.length; i++) {
            const child = el.children[i];
            this._traverseElement(child, callback);
        }
        callback(el);
    }
    findDependecies(htmlEl) {
        const deps = new Set();
        this._traverseElement(htmlEl, (el) => {
            const compName = el.nodeName.toUpperCase();
            const comp = this.registry.getComponent(compName);
            if (comp) {
                deps.add(comp.name);
            }
        });
        return Array.from(deps);
    }
    findComponentDependecies(componentName) {
        const htmlEl = this.renderComponent(componentName);
        return this.findDependecies(htmlEl);
    }
    render(el) {
        const comp = this.registry.getComponent(el.nodeName);
        if (!comp)
            return null;
        const dom = jsdom.JSDOM.fragment(comp.html);
        return dom.firstChild;
    }
    renderComponent(componentName) {
        const comp = this.registry.getComponent(componentName);
        if (!comp)
            return null;
        const dom = jsdom.JSDOM.fragment(comp.html);
        return dom.firstChild;
    }
}

const fs$1 = {
    readFile: util.promisify(fsSync__default["default"].readFile),
    writeFile: util.promisify(fsSync__default["default"].writeFile),
    mkdir: util.promisify(fsSync__default["default"].mkdir),
    readdir: util.promisify(fsSync__default["default"].readdir),
};
class LayoutBuilder {
    /**
     *
     */
    constructor(layoutsRoot) {
        this.layoutsRoot = layoutsRoot;
    }
    getLayoutContexts() {
        return __awaiter(this, void 0, void 0, function* () {
            const treeBuilder = new ContextTreeBuilder(this.layoutsRoot);
            const tree = yield treeBuilder.build();
            const layoutContexts = [];
            tree.traverseSync(tree.root, (n) => {
                if (fsSync__default["default"].existsSync(path__default["default"].resolve(n.data.path, "layout.html"))) {
                    layoutContexts.push(n.data);
                }
            });
            return layoutContexts;
        });
    }
    build(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const layoutPath = path__default["default"].resolve(context.path, "layout.html");
            if (fsSync__default["default"].existsSync(layoutPath)) {
                return {
                    name: context.name,
                    html: (yield fs$1.readFile(layoutPath)).toString(),
                };
            }
            return null;
        });
    }
    buildAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const layoutContexts = yield this.getLayoutContexts();
            const layouts = [];
            for (const context of layoutContexts) {
                const layout = yield this.build(context);
                if (layout)
                    layouts.push(layout);
            }
            return layouts;
        });
    }
}

const fs = {
    readFile: util.promisify(fsSync__default["default"].readFile),
    writeFile: util.promisify(fsSync__default["default"].writeFile),
    mkdir: util.promisify(fsSync__default["default"].mkdir),
    readdir: util.promisify(fsSync__default["default"].readdir),
};
class PageBuilder {
    constructor(pagesRoot) {
        this.pagesRoot = pagesRoot;
    }
    getPageContexts() {
        return __awaiter(this, void 0, void 0, function* () {
            const treeBuilder = new ContextTreeBuilder(this.pagesRoot);
            const tree = yield treeBuilder.build();
            const pageContexts = tree.findLeafNodes().map((n) => n.data);
            return pageContexts;
        });
    }
    buildPage(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const htmlPath = path__default["default"].resolve(context.path, "index.html");
            const cssPath = path__default["default"].resolve(context.path, "style.css");
            const jsPath = path__default["default"].resolve(context.path, "script.js");
            const isHtml = fsSync__default["default"].existsSync(htmlPath);
            const isCss = fsSync__default["default"].existsSync(cssPath);
            const isJs = fsSync__default["default"].existsSync(jsPath);
            if (!(isHtml || isCss || isJs))
                return null;
            const page = {
                name: context.name,
                html: isHtml ? (yield fs.readFile(htmlPath)).toString() : null,
                css: isCss ? (yield fs.readFile(cssPath)).toString() : null,
                js: isJs ? (yield fs.readFile(jsPath)).toString() : null,
            };
            return Promise.resolve(page);
        });
    }
    buildPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const pageContexts = yield this.getPageContexts();
            const pages = [];
            for (const context of pageContexts) {
                const page = yield this.buildPage(context);
                if (page)
                    pages.push(page);
            }
            return pages;
        });
    }
}

function traverseElement(el, callback) {
    var _a, _b;
    if (!el)
        return;
    for (let i = 0; (_b = i < ((_a = el.children) === null || _a === void 0 ? void 0 : _a.length)) !== null && _b !== void 0 ? _b : 0; i++) {
        const child = el.children[i];
        traverseElement(child, callback);
    }
    callback(el);
}
function renderElement(el, registry, depList, crr) {
    const comp = registry.getComponent(el.nodeName);
    if (!comp)
        return;
    const componentEl = crr.render(el);
    //attributtes
    const renderProps = crr.extractProps(el);
    const defaultProps = crr.extractProps(componentEl);
    if (el.innerHTML)
        renderProps["lbContent"] = el.innerHTML; //todo: deprecated
    if (el.innerHTML)
        renderProps["innerContent"] = el.innerHTML;
    for (const prop of Object.keys(defaultProps)) {
        if (!renderProps[prop]) {
            renderProps[prop] = defaultProps[prop];
        }
    }
    const renderedHTML = Mustache__default["default"].render(comp.html, renderProps);
    const rendered = jsdom.JSDOM.fragment(renderedHTML).firstChild;
    el.replaceWith(rendered);
    traverseElement(rendered, (el) => renderElement(el, registry, depList, crr));
    depList.add(comp.name);
}
function renderLayoutToHTML(page, layout) {
    const pageDom = new jsdom.JSDOM(page.html);
    if (!layout)
        return pageDom.window.document.documentElement.outerHTML;
    const html = Mustache__default["default"].render(layout.html, {
        head: pageDom.window.document.head.innerHTML,
        content: pageDom.window.document.body.innerHTML,
    });
    return html;
}
function renderPage(page, registry, layout) {
    var _a, _b, _c, _d;
    const crr = new ComponentRegisterRendererJSDOM(registry);
    const dom = new jsdom.JSDOM(renderLayoutToHTML(page, layout));
    const dependecyList = new Set();
    const renderedPage = Object.assign({}, page);
    for (const child of dom.window.document.body.childNodes) {
        traverseElement(child, (el) => renderElement(el, registry, dependecyList, crr));
    }
    let css = "";
    let js = "";
    for (const dep of dependecyList) {
        css += (_a = registry.getComponent(dep).css) !== null && _a !== void 0 ? _a : "";
        js += (_b = registry.getComponent(dep).js) !== null && _b !== void 0 ? _b : "";
    }
    css += (_c = page.css) !== null && _c !== void 0 ? _c : "";
    js += (_d = page.js) !== null && _d !== void 0 ? _d : "";
    renderedPage.html = dom.window.document.documentElement.outerHTML;
    renderedPage.css = css;
    renderedPage.js = js;
    return renderedPage;
}

const exportHTML = {
    name: "export-html",
    actions: {
        renderFinished: (data) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const config = data.config.shellsConfig.find((s) => s.name == "export-html");
            const args = config === null || config === void 0 ? void 0 : config.args;
            const exportDir = (_a = args === null || args === void 0 ? void 0 : args.exportDir) !== null && _a !== void 0 ? _a : "dist-html";
            const exportDirPath = path__default["default"].resolve(exportDir);
            if (fs__default["default"].existsSync(exportDirPath)) {
                yield fs__default["default"].remove(exportDirPath);
            }
            yield fs__default["default"].mkdir(exportDirPath, {
                recursive: true,
            });
            for (const page of data.pages) {
                const name = yield page.name.toLowerCase();
                yield fs__default["default"].writeFile(path__default["default"].resolve(exportDirPath, `${name}.html`), page.html);
            }
            return data;
        }),
    },
};

const exportAssets = {
    name: "export-assets",
    actions: {
        renderFinished: (data) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const config = data.config.shellsConfig.find((s) => s.name == "export-assets");
            const args = config === null || config === void 0 ? void 0 : config.args;
            const exportDir = (_a = args === null || args === void 0 ? void 0 : args.exportDir) !== null && _a !== void 0 ? _a : "assets";
            const exportDirPath = path__default["default"].resolve(exportDir);
            if (!fsSync__default["default"].existsSync(exportDirPath)) {
                yield fs__default["default"].mkdir(exportDirPath, {
                    recursive: true,
                });
            }
            yield fs__default["default"].mkdir(path__default["default"].resolve(exportDirPath, "css"), {
                recursive: true,
            });
            yield fs__default["default"].mkdir(path__default["default"].resolve(exportDirPath, "js"), {
                recursive: true,
            });
            for (const page of data.pages) {
                if (!page.css && !page.js)
                    continue;
                const dom = new jsdom.JSDOM(page.html);
                const name = page.name.toLowerCase();
                if (page.css) {
                    if (args === null || args === void 0 ? void 0 : args.minify) {
                        const cc = new CleanCSS__default["default"]({
                            level: 2,
                        }).minify(page.css);
                        page.css = cc.styles;
                    }
                    yield fs__default["default"].writeFile(path__default["default"].resolve(exportDirPath, "css", `${name}.css`), page.css);
                    const styleLink = dom.window.document.createElement("link");
                    styleLink.rel = "stylesheet";
                    styleLink.type = "text/css";
                    styleLink.href = `/assets/css/${name}.css`;
                    dom.window.document.head.appendChild(styleLink);
                }
                if (page.js) {
                    if (args === null || args === void 0 ? void 0 : args.minify) {
                        page.js = (yield terser.minify(page.js)).code;
                    }
                    yield fs__default["default"].writeFile(path__default["default"].resolve(exportDirPath, "js", `${name}.js`), page.js);
                    const scriptTag = dom.window.document.createElement("script");
                    scriptTag.type = "text/javascript";
                    scriptTag.src = `/assets/js/${name}.js`;
                    dom.window.document.body.appendChild(scriptTag);
                }
                page.html = dom.window.document.documentElement.outerHTML;
            }
            return data;
        }),
    },
};

let oldRegistry = null;
const CUSTOM_DATA_ROOT = `.vscode${path__default["default"].sep}custom-data`;
function getCustomDataName(comp) {
    const customDataName = `${comp.name.toLowerCase()}-custom-data.json`;
    return customDataName;
}
function getCustomDataPath(comp) {
    return `${CUSTOM_DATA_ROOT}${path__default["default"].sep}${getCustomDataName(comp)}`;
}
function createComponentCustomData(comp) {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlCstomData = {
            version: 1.1,
            tags: [
                {
                    name: comp.name,
                    description: comp.doc,
                },
            ],
        };
        yield fs__default["default"].writeJson(path__default["default"].resolve(getCustomDataPath(comp)), htmlCstomData);
    });
}
const intellisenseVSC = {
    name: "intellisense-vsc",
    actions: {
        componentsBuilt: (data) => __awaiter(void 0, void 0, void 0, function* () {
            if (!fs__default["default"].existsSync(path__default["default"].resolve(CUSTOM_DATA_ROOT))) {
                yield fs__default["default"].mkdirp(path__default["default"].resolve(CUSTOM_DATA_ROOT));
            }
            const customDataPaths = [];
            for (const comp of data.registry.getAllComponents()) {
                let update = true;
                if (oldRegistry) {
                    const oldComp = oldRegistry.getComponent(comp.name);
                    update = oldComp && oldComp.doc != comp.doc;
                }
                if (update) {
                    yield createComponentCustomData(comp);
                }
                customDataPaths.push(getCustomDataPath(comp));
            }
            const vscSettingsNew = {
                ["html.customData"]: customDataPaths.sort(() => Math.random() - 0.5),
            };
            const vscSettingsPath = path__default["default"].resolve(".vscode", "settings.json");
            let vscSettings = {};
            if (fs__default["default"].existsSync(vscSettingsPath)) {
                vscSettings = yield fs__default["default"].readJson(vscSettingsPath);
            }
            if (!fs__default["default"].existsSync(path__default["default"].resolve(".vscode"))) {
                yield fs__default["default"].mkdirp(path__default["default"].resolve(".vscode"));
            }
            yield fs__default["default"].writeJSON(vscSettingsPath, Object.assign(Object.assign({}, vscSettings), vscSettingsNew), {
                spaces: 2,
            });
            oldRegistry = new MapComponentRegistry(data.registry.getAllComponents());
            return data;
        }),
    },
};

const log$3 = console.log;
const logInfo$1 = (...text) => {
    log$3(chalk__default["default"].white("[*]", ...text));
};
let isRunning = false;
const liveServerShell = {
    name: "live-server",
    actions: {
        renderFinished: (data) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            if (isRunning)
                return data;
            const config = data.config.shellsConfig.find((s) => s.name == "live-server");
            const args = config === null || config === void 0 ? void 0 : config.args;
            const params = {
                port: (_a = args === null || args === void 0 ? void 0 : args.port) !== null && _a !== void 0 ? _a : 8081,
                host: (_b = args === null || args === void 0 ? void 0 : args.host) !== null && _b !== void 0 ? _b : "0.0.0.0",
                root: (_c = args === null || args === void 0 ? void 0 : args.root) !== null && _c !== void 0 ? _c : "dist-html",
                wait: (_d = args === null || args === void 0 ? void 0 : args.wait) !== null && _d !== void 0 ? _d : 500,
                mount: (_e = args === null || args === void 0 ? void 0 : args.mount) !== null && _e !== void 0 ? _e : [["/assets", "./assets"]],
                logLevel: 0,
            };
            liveServer__default["default"].start(params);
            isRunning = true;
            logInfo$1("Started development server....");
            return data;
        }),
    },
};

const BODY_REG_EXP = /<body[^>]*>/i;
const END_BODY_REG_EXP = /<\/body>/i;
const END_HEAD_REG_EXP = /<\/head>/i;
const FOOTER_REG_EXP = /<footer[^>]*>/i;
function extractWPHeader(html) {
    const bodyMatch = html.match(BODY_REG_EXP); //todo: add body_class
    if (!bodyMatch)
        return "";
    const bodyTagLength = bodyMatch[0].length;
    let header = html.slice(0, bodyMatch.index + bodyTagLength);
    const endHeadMatch = header.match(END_HEAD_REG_EXP);
    if (endHeadMatch) {
        header = `${header.slice(0, endHeadMatch.index)}<?php wp_head(); ?>${header.slice(endHeadMatch.index)}`;
    }
    return `${header} <?php wp_body_open(); ?>`;
}
function generateWPTemplate(name) {
    const template = `
<?php
/**
 * Template Name: ${name}
 */
defined( 'ABSPATH' ) || exit;
get_header('${name}');
if ( have_posts() ) : 
    while ( have_posts() ) : the_post();
        the_content();
    endwhile;
else :
    _e( 'Sorry, no posts matched your criteria.', 'textdomain' );
endif;
get_footer('${name}');
`;
    return template;
}
function extractWPBody(html) {
    const bodyMatch = html.match(BODY_REG_EXP);
    if (!bodyMatch)
        return "";
    const bodyTagLength = bodyMatch[0].length;
    let footerMatch = html.match(FOOTER_REG_EXP);
    if (!footerMatch) {
        footerMatch = html.match(END_BODY_REG_EXP);
    }
    const body = html.slice(bodyMatch.index + bodyTagLength, footerMatch.index);
    return body;
}
function extractWPFooter(html) {
    let footerMatch = html.match(FOOTER_REG_EXP);
    if (!footerMatch) {
        footerMatch = html.match(END_BODY_REG_EXP);
    }
    let footer = html.slice(footerMatch.index);
    const endBodyMatch = footer.match(END_BODY_REG_EXP);
    if (endBodyMatch) {
        const before = footer.slice(0, endBodyMatch.index);
        const after = footer.slice(endBodyMatch.index);
        footer = `${before}<?php wp_footer(); ?>${after}`;
    }
    return footer;
}
function exportWPHeader(page, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const wpPageHeaderPath = path__default["default"].resolve(outputDir, `header-${page.name}.php`);
        const header = extractWPHeader(page.html);
        yield fs__default["default"].writeFile(wpPageHeaderPath, header);
    });
}
function exportWPTemplate(page, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const wpPageTemplatePath = path__default["default"].resolve(outputDir, `page-${page.name}.php`);
        const template = generateWPTemplate(page.name);
        yield fs__default["default"].writeFile(wpPageTemplatePath, template);
    });
}
function exportWPContent(page, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const wpPagePostPath = path__default["default"].resolve(outputDir, `post-${page.name}.php`);
        const post = extractWPBody(page.html);
        yield fs__default["default"].writeFile(wpPagePostPath, post);
    });
}
function exportWPFooter(page, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const wpPageFooterPath = path__default["default"].resolve(outputDir, `footer-${page.name}.php`);
        const footer = extractWPFooter(page.html);
        yield fs__default["default"].writeFile(wpPageFooterPath, footer);
    });
}
function exportWPPage(page, outputDir) {
    return __awaiter(this, void 0, void 0, function* () {
        const wpPage = Object.assign({}, page);
        wpPage.name = wpPage.name.replace(/-/g, "_").toLowerCase();
        yield exportWPHeader(wpPage, outputDir);
        yield exportWPTemplate(wpPage, outputDir);
        yield exportWPContent(wpPage, outputDir);
        yield exportWPFooter(wpPage, outputDir);
    });
}

const exportWPShell = {
    name: "export-wp",
    actions: {
        renderFinished: (data) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const config = data.config.shellsConfig.find((s) => s.name == "export-wp");
            const args = (_a = config === null || config === void 0 ? void 0 : config.args) !== null && _a !== void 0 ? _a : {
                outputDir: "dist-wp",
            };
            const outputPath = path__default["default"].resolve(args.outputDir);
            if (fs__default["default"].existsSync(outputPath)) {
                yield fs__default["default"].remove(outputPath);
            }
            yield fs__default["default"].mkdirp(outputPath);
            for (const page of data.pages) {
                yield exportWPPage(page, outputPath);
            }
            return data;
        }),
    },
};

const stdShells = [];
stdShells.push(exportHTML);
stdShells.push(exportAssets);
stdShells.push(intellisenseVSC);
stdShells.push(liveServerShell);
stdShells.push(exportWPShell);

function loadTortueShell(config) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const stdShell = stdShells.find((s) => s.name == config.name);
        if (stdShell)
            return stdShell;
        const shell = {
            name: config.name,
            actions: {},
        };
        if (config.path)
            config.path = path__default["default"].resolve(config.path);
        try {
            const actions = require((_a = config.path) !== null && _a !== void 0 ? _a : config.name);
            shell.actions = actions;
        }
        catch (error) {
            return null;
        }
        if (config.events) {
            for (const event of Object.keys(shell.actions)) {
                if (config.events.includes(event))
                    continue;
                shell.actions[event] = null;
            }
        }
        return Promise.resolve(shell);
    });
}
function buildTortueShells(configs) {
    return __awaiter(this, void 0, void 0, function* () {
        const shells = [];
        for (const shellConfig of configs) {
            shells.push(yield loadTortueShell(shellConfig));
        }
        return shells;
    });
}

const DEFAULT_TORTUE_CONFIG = {
    componentsDir: "components",
    pagesDir: "pages",
    layoutsDir: "layouts",
    shellsConfig: null,
};

function findPageLayout(pageName, layouts) {
    for (const layout of layouts) {
        if (pageName.startsWith(layout.name))
            return layout;
    }
    return null;
}

class Tortue {
    /**
     *
     */
    constructor(configPath) {
        this._configPath = configPath;
        this.shells = [];
        this._replaceShells = false;
    }
    _readConfig(configPath) {
        return __awaiter(this, void 0, void 0, function* () {
            configPath = path__default["default"].resolve(configPath);
            if (!fs__default["default"].existsSync(configPath))
                return null;
            const config = (yield fs__default["default"].readJSON(configPath));
            return config;
        });
    }
    loadConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._configPath) {
                this.config = DEFAULT_TORTUE_CONFIG;
                return;
            }
            const newConfig = yield this._readConfig(this._configPath);
            this.config = newConfig !== null && newConfig !== void 0 ? newConfig : DEFAULT_TORTUE_CONFIG;
            if (this.config.shellsConfig) {
                this._replaceShells = true;
            }
            else {
                this.config.shellsConfig = [];
            }
        });
    }
    loadShells() {
        return __awaiter(this, void 0, void 0, function* () {
            this.shells = yield buildTortueShells(this.config.shellsConfig);
            this.shells = this.shells.filter((s) => s);
        });
    }
    buildComponents() {
        return __awaiter(this, void 0, void 0, function* () {
            const builder = new ComponentBuilder(this.config.componentsDir);
            this.componentRegistry = yield builder.buildAllComponents();
        });
    }
    buildLayouts() {
        return __awaiter(this, void 0, void 0, function* () {
            const builder = new LayoutBuilder(this.config.layoutsDir);
            this.layouts = yield builder.buildAll();
        });
    }
    buildPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const builder = new PageBuilder(this.config.pagesDir);
            this.pages = yield builder.buildPages();
        });
    }
    renderPages() {
        return __awaiter(this, void 0, void 0, function* () {
            const newPages = [];
            for (let page of this.pages) {
                newPages.push(yield renderPage(page, this.componentRegistry, findPageLayout(page.name, this._layouts)));
            }
            this.pages = newPages;
        });
    }
    get config() {
        return this._config;
    }
    get shells() {
        return this._shells;
    }
    get replaceShells() {
        return this._replaceShells;
    }
    get configPath() {
        return this._configPath;
    }
    get componentRegistry() {
        return this._componentRegistry;
    }
    get layouts() {
        return this._layouts;
    }
    get pages() {
        return this._pages;
    }
    set config(config) {
        this._config = config;
    }
    set shells(shells) {
        this._shells = shells;
    }
    set componentRegistry(registry) {
        this._componentRegistry = registry;
    }
    set layouts(layouts) {
        this._layouts = layouts;
    }
    set pages(pages) {
        this._pages = pages;
    }
}
//load Conifg
//afterConfigLoad
//load shells
//buildComponents
//afterComponentsBuiltShells
//buildLayouts
//buildPages
//
//runShells

var TortuePipelineEvent;
(function (TortuePipelineEvent) {
    TortuePipelineEvent["COMPONENTS_BUILT"] = "componentsBuilt";
    TortuePipelineEvent["PAGES_BUILT"] = "pagesBuilt";
    TortuePipelineEvent["LAYOUTS_BUILT"] = "layoutsBuilt";
    TortuePipelineEvent["CONFIG_LOADED"] = "configLoaded";
    TortuePipelineEvent["RENDER_FINISHED"] = "renderFinished";
})(TortuePipelineEvent || (TortuePipelineEvent = {}));

class TortuePipeline {
    /**
     *
     */
    constructor(tortue, shells) {
        this._shells = shells !== null && shells !== void 0 ? shells : [];
        this._tortue = tortue;
    }
    execute() {
        return __awaiter(this, void 0, void 0, function* () {
            //load config
            yield this._tortue.loadConfig();
            //load shells
            yield this._tortue.loadShells();
            if (this._tortue.replaceShells) {
                this._shells = [...this._tortue.shells];
            }
            yield this.runShells(TortuePipelineEvent.CONFIG_LOADED);
            //build components
            yield this._tortue.buildComponents();
            yield this.runShells(TortuePipelineEvent.COMPONENTS_BUILT);
            //build layouts
            yield this._tortue.buildLayouts();
            yield this.runShells(TortuePipelineEvent.LAYOUTS_BUILT);
            //build pages
            yield this._tortue.buildPages();
            yield this.runShells(TortuePipelineEvent.PAGES_BUILT);
            //render pages
            yield this._tortue.renderPages();
            yield this.runShells(TortuePipelineEvent.RENDER_FINISHED);
        });
    }
    get tortueShellActionData() {
        return {
            config: this._tortue.config,
            layouts: this._tortue.layouts,
            pages: this._tortue.pages,
            registry: this._tortue.componentRegistry,
        };
    }
    set tortueShellActionData(data) {
        this._tortue.config = data.config;
        this._tortue.componentRegistry = data.registry;
        this._tortue.layouts = data.layouts;
        this._tortue.pages = data.pages;
    }
    runShells(event) {
        return __awaiter(this, void 0, void 0, function* () {
            let data = this.tortueShellActionData;
            const shells = this._shells.filter((s) => s.actions[event]);
            const actions = shells.map((s) => s.actions[event]);
            while (actions.length) {
                data = yield actions.shift()(data);
            }
            this.tortueShellActionData = data;
        });
    }
}

class ExportCommand extends commander.Command {
    /**
     * Export command runs TortuePipeline build process
     */
    constructor() {
        super("export");
        this.description("Runs tortue export pipeline process");
        this.option("-c --config <path>", "Specify configuration path");
        this.action(this._action);
    }
    _action(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const tortue = new Tortue(options.config);
            const defaultShells = stdShells;
            const pipeline = new TortuePipeline(tortue, defaultShells);
            yield pipeline.execute();
        });
    }
}

const log$2 = console.log;
const logErr$1 = (...text) => {
    log$2(chalk__default["default"].red("[!]", ...text));
};
const logSuccess$1 = (...text) => {
    log$2(chalk__default["default"].green("[+]", ...text));
};
class NewCommand extends commander.Command {
    /**
     * New command creates new tortue default project setup
     */
    constructor() {
        super("new");
        this.description("Creates new tortue default project setup");
        this.argument("[name]", "New project name(blank if new project is current directory)", "");
        this.action(this._action);
        this.option("-f --force", "Overwrites existing project setup if exists");
    }
    _initGitRepo(repoPath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (fsSync__default["default"].existsSync(path__default["default"].resolve(repoPath, ".git")))
                return;
            const git = simpleGit__default["default"](repoPath);
            yield git.init();
            yield git.checkout(["-b", "main"]);
        });
    }
    _initProjectFileStructure(repoPath, overwrite) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectName = path__default["default"].basename(repoPath);
            yield fs__default["default"].copy(path__default["default"].resolve(__dirname, "..", "default-project"), path__default["default"].resolve(repoPath), {
                recursive: true,
                errorOnExist: true,
                overwrite: overwrite,
            });
            const gitignore = [
                ".DS_Store",
                "dist",
                "dist-html",
                ".vscode",
                "node_modules",
                "reports",
                "dist-wp",
            ].join("\n");
            yield fs__default["default"].writeFile(path__default["default"].resolve(repoPath, ".gitignore"), gitignore);
            const prettierrc = {
                trailingComma: "all",
                tabWidth: 2,
                semi: true,
                singleQuote: false,
                printWidth: 80,
            };
            yield fs__default["default"].writeJson(path__default["default"].resolve(repoPath, ".prettierrc.json"), prettierrc);
            const packageJSON = yield fs__default["default"].readJSON(path__default["default"].resolve(repoPath, "package.json"));
            packageJSON.name = projectName;
            const tortuePackageJSON = yield fs__default["default"].readJson(path__default["default"].resolve(__dirname, "..", "package.json"));
            packageJSON.devDependencies.tortue = `^${tortuePackageJSON.version}`;
            yield fs__default["default"].writeJson(path__default["default"].resolve(repoPath, "package.json"), packageJSON, {
                spaces: 2,
            });
        });
    }
    _action(name, opts) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const newProjectPath = path__default["default"].resolve(".", name);
            const overwrite = (_a = opts.force) !== null && _a !== void 0 ? _a : false;
            try {
                yield this._initProjectFileStructure(newProjectPath, overwrite);
                yield this._initGitRepo(newProjectPath);
            }
            catch (error) {
                logErr$1(error);
                return;
            }
            logSuccess$1("Project successfully created ;)");
        });
    }
}

const log$1 = console.log;
const logInfo = (...text) => {
    log$1(chalk__default["default"].white("[*]", ...text));
};
const logSuccess = (...text) => {
    log$1(chalk__default["default"].green("[+]", ...text));
};
class WatchCommand extends commander.Command {
    /**
     * Watch command runs TortuePipeline build process on
     * every monitored data change.
     */
    constructor() {
        super("watch");
        this.description("Runs tortue export pipeline when components, layouts or pages change");
        this.option("-c --config <path>", "Specify configuration path");
        this.action(this._action);
    }
    _action(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const tortue = new Tortue(options.config);
            const defaultShells = stdShells;
            const pipeline = new TortuePipeline(tortue, defaultShells);
            yield pipeline.execute();
            logSuccess("Export pipeline finished!");
            const watcher = chokidar__default["default"].watch([
                tortue.config.componentsDir,
                tortue.config.layoutsDir,
                tortue.config.pagesDir,
            ]);
            logInfo("Watching.....");
            let isReady = false;
            watcher.on("ready", () => {
                if (isReady)
                    return;
                isReady = true;
                watcher.on("all", () => __awaiter(this, void 0, void 0, function* () {
                    yield pipeline.execute();
                    logSuccess("Export pipeline finished!");
                }));
            });
        });
    }
}

const log = console.log;
const logErr = (...text) => {
    log(chalk__default["default"].red("[!]", ...text));
};
var TemplateType;
(function (TemplateType) {
    TemplateType["component"] = "comp";
    TemplateType["page"] = "page";
})(TemplateType || (TemplateType = {}));
function getTemplatePath(type) {
    return __awaiter(this, void 0, void 0, function* () {
        const templatePath = path__default["default"].resolve(__dirname, "..", "templates", type);
        if (!fs__default["default"].existsSync(templatePath))
            throw new Error("Template directory not found!");
        return templatePath;
    });
}
function createFromTemplate(type, name, includeFiles, //template parts
outputRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        const templatePath = yield getTemplatePath(type);
        const outputPath = path__default["default"].resolve(outputRoot, name.split("-").join(path__default["default"].sep));
        yield fs__default["default"].mkdirp(outputPath);
        yield fs__default["default"].copy(templatePath, outputPath, {
            recursive: true,
            overwrite: false,
            filter: (x) => includeFiles.includes(path__default["default"].basename(x)),
        });
        for (const fileName of includeFiles) {
            if (fileName == type)
                continue;
            const filePath = path__default["default"].resolve(outputPath, fileName);
            if (!fs__default["default"].existsSync(filePath))
                continue;
            let content = (yield fs__default["default"].readFile(filePath)).toString();
            content = Mustache__default["default"].render(content, {
                name: name.toLowerCase(),
            });
            yield fs__default["default"].writeFile(filePath, content);
        }
    });
}
class CreateCommand extends commander.Command {
    /**
     * Create command helps you create components, pages based on templates
     */
    constructor() {
        super("create");
        this.description("Create command helps you create components, pages");
        this.argument("<type>", "Template type: comp | page");
        this.argument("<name>", "");
        this.option("-c --config <path>", "Specify configuration path");
        this.option("-s --style", "Creates style from template");
        this.option("-j --js", "Creates script from template");
        this.option("-d --doc", "Creates documentation from template");
        this.action(this._action);
    }
    _action(type, name, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const tortue = new Tortue(opts.config);
            yield tortue.loadConfig();
            const outputRoot = {
                [TemplateType.component]: tortue.config.componentsDir,
                [TemplateType.page]: tortue.config.pagesDir,
            };
            const includeFiles = [type, "index.html"];
            if (opts === null || opts === void 0 ? void 0 : opts.style) {
                includeFiles.push("style.css");
            }
            if (opts === null || opts === void 0 ? void 0 : opts.js) {
                includeFiles.push("script.js");
            }
            if ((opts === null || opts === void 0 ? void 0 : opts.doc) && type == TemplateType.component) {
                includeFiles.push("doc.md");
            }
            try {
                yield createFromTemplate(type, name, includeFiles, outputRoot[type]);
            }
            catch (error) {
                logErr(error);
            }
        });
    }
}

class TortueCLIApp {
    /**
     * CLI provides export, import and watch commands.
     */
    constructor() {
        this._program = new commander.Command("tortue");
        this._exportCommand = new ExportCommand();
        this._importCommand = new NewCommand();
        this._watchCommand = new WatchCommand();
        this._createCommand = new CreateCommand();
        this._program.addCommand(this._exportCommand);
        this._program.addCommand(this._importCommand);
        this._program.addCommand(this._watchCommand);
        this._program.addCommand(this._createCommand);
    }
    parseOptions() {
        this._program.parse();
        return this._program.opts();
    }
}

const app = new TortueCLIApp();
app.parseOptions();
