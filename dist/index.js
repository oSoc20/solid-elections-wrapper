"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listDocuments = exports.createAppDocument = exports.initAppStorage = void 0;
var tripledoc_1 = require("tripledoc");
var rdf_namespaces_1 = require("rdf-namespaces");
var solid_auth_client_1 = __importDefault(require("solid-auth-client"));
/**
 * Initialize an app directory inside the Solid Pod found at the webID.
 *
 * @remarks
 * If `initEmpty` is set to true, your application must have already logged in the user using the package `solid-auth-client`
 * or another package that can login a user
 * To create a document inside the app directory you must use the function `createAppDocument`
 * with the app storage returned by this function.
 *
 * @param webID - WebID of the user that links to a Solid Pod
 * @param appName - Name of the application. This name will also be used to
 *                  name the directory inside the Solid Pod
 * @param initEmpty - Boolean indicating whether the application folder
 *                    should be created if it is not on the Solid Pod
 *                    (Note: The user must be logged if set to true)
 *
 * @returns appStorage - An app storage that can be used with `createAppDocument` to store documents
 *                       corresponding to the application
 *
 * @default initEmpty = true
 */
function initAppStorage(webID, appName, initEmpty) {
    if (initEmpty === void 0) { initEmpty = true; }
    return __awaiter(this, void 0, void 0, function () {
        var profileDoc, profile, publicTypeIndex, appSubject, location_1, defaultPath, appStorage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tripledoc_1.fetchDocument(webID)];
                case 1:
                    profileDoc = _a.sent();
                    profile = profileDoc.getSubject(webID);
                    return [4 /*yield*/, fetchPublicTypeIndex(profile)];
                case 2:
                    publicTypeIndex = _a.sent();
                    if (publicTypeIndex == null) {
                        throw new Error("Initialization error: Public Type Index was not found inside the user profile");
                    }
                    return [4 /*yield*/, findAppSubject(publicTypeIndex, appName)];
                case 3:
                    appSubject = _a.sent();
                    if (appSubject) {
                        location_1 = appSubject.getRef(rdf_namespaces_1.solid.instance);
                        if (location_1) {
                            // TODO: Check if the repository is indeed at this location
                            // if not we must continue and create a new one at this location
                            return [2 /*return*/, tripledoc_1.fetchDocument(location_1)];
                        }
                    }
                    if (!initEmpty) {
                        throw new Error("Application folder was not found inside the user's Solid Pod");
                    }
                    defaultPath = profile.getRef(rdf_namespaces_1.space.storage) + ("public/" + appName);
                    return [4 /*yield*/, createAppFolder(defaultPath)];
                case 4:
                    appStorage = _a.sent();
                    // Store a reference to the app folder in the public type index
                    return [4 /*yield*/, registerAppStorage(publicTypeIndex, appName, defaultPath)];
                case 5:
                    // Store a reference to the app folder in the public type index
                    _a.sent();
                    return [2 /*return*/, appStorage];
            }
        });
    });
}
exports.initAppStorage = initAppStorage;
/**
 * Create a document inside the appStorage.
 *
 * @remarks Note: this document will not be created on the Pod until you call [[save]] on it.
 *
 *
 * @param appStorage - The app storage created via the function `initAppStorage`
 * @param docName - The actual name of the new document
 *
 * @returns Document - The newly created document
 *
 * @example
 * ```ts
 * // Attention: The user must be logged in to create the new app storage
 * const appStorage = await initAppStorage(webID, 'solidelections');
 * const doc = createAppDocument(appStorage, 'dummyPerson.ttl');
 * const person = doc.addSubject();
 * person.addRef(foaf.firstName, 'John');
 * person.addRef(foaf.lastName, 'Smith');
 * await doc.save([person]);
 * ```
 *
 */
function createAppDocument(appStorage, docName) {
    var documentRef = appStorage.asRef() + ("/" + docName);
    return tripledoc_1.createDocument(documentRef);
}
exports.createAppDocument = createAppDocument;
/**
 * List all documents inside an appStorage
 *
 * @param appStorage - Application storage created with the function `initAppStorage`
 *
 * @returns string[] - references to documents stored into the app storage
 *
 */
function listDocuments(appStorage) {
    return appStorage.findSubjects(rdf_namespaces_1.rdf.type, rdf_namespaces_1.ldp.Resource).map(function (subject) {
        var subjectRef = subject.asRef();
        var split = subject.asRef().lastIndexOf('/');
        var fileName = subjectRef.substr(split + 1);
        return appStorage.asRef() + ("/" + fileName);
    });
}
exports.listDocuments = listDocuments;
function fetchPublicTypeIndex(profile) {
    return __awaiter(this, void 0, void 0, function () {
        var publicTypeIndexRef, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    publicTypeIndexRef = profile.getRef(rdf_namespaces_1.solid.publicTypeIndex);
                    if (!publicTypeIndexRef) return [3 /*break*/, 2];
                    return [4 /*yield*/, tripledoc_1.fetchDocument(publicTypeIndexRef)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 3];
                case 2:
                    _a = null;
                    _b.label = 3;
                case 3: return [2 /*return*/, _a];
            }
        });
    });
}
function findAppSubject(publicTypeIndex, appName) {
    return __awaiter(this, void 0, void 0, function () {
        var appRef, appSubjects, _i, appSubjects_1, subject;
        return __generator(this, function (_a) {
            appRef = publicTypeIndex.asRef() + "#" + appName;
            appSubjects = publicTypeIndex.findSubjects(rdf_namespaces_1.rdf.type, rdf_namespaces_1.solid.TypeRegistration);
            for (_i = 0, appSubjects_1 = appSubjects; _i < appSubjects_1.length; _i++) {
                subject = appSubjects_1[_i];
                if (subject.asRef() === appRef) {
                    return [2 /*return*/, subject];
                }
            }
            return [2 /*return*/, null];
        });
    });
}
function createAppFolder(appFolderPath) {
    return __awaiter(this, void 0, void 0, function () {
        var split, parentFolderPath, applicationFolderName;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    split = appFolderPath.lastIndexOf('/');
                    parentFolderPath = appFolderPath.substr(0, split);
                    applicationFolderName = appFolderPath.substr(split + 1);
                    // The creation of a folder can be done using a POST request on the Solid Pod
                    // It's hacky but tripledoc doesn't allow the creation of simple directory
                    // Note: the user must be logged in.
                    return [4 /*yield*/, solid_auth_client_1.default.fetch(parentFolderPath, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'text/turtle',
                                'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
                                'Slug': applicationFolderName
                            }
                        }).catch(function (error) { return console.log('Error: ' + JSON.stringify(error)); })];
                case 1:
                    // The creation of a folder can be done using a POST request on the Solid Pod
                    // It's hacky but tripledoc doesn't allow the creation of simple directory
                    // Note: the user must be logged in.
                    _a.sent();
                    return [2 /*return*/, tripledoc_1.fetchDocument(appFolderPath)];
            }
        });
    });
}
function registerAppStorage(publicTypeIndex, appName, path) {
    return __awaiter(this, void 0, void 0, function () {
        var appRegistration;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    appRegistration = publicTypeIndex.addSubject({ 'identifier': appName });
                    appRegistration.addRef(rdf_namespaces_1.rdf.type, rdf_namespaces_1.solid.TypeRegistration);
                    appRegistration.addRef(rdf_namespaces_1.solid.forClass, rdf_namespaces_1.solid.instance);
                    appRegistration.addRef(rdf_namespaces_1.solid.instance, path);
                    return [4 /*yield*/, publicTypeIndex.save([appRegistration])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
