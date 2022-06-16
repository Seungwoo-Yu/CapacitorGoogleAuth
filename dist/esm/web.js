var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WebPlugin } from '@capacitor/core';
export class GoogleAuthWeb extends WebPlugin {
    constructor() {
        super({
            name: 'GoogleAuth',
            platforms: ['web']
        });
    }
    loadScript() {
        if (typeof document === 'undefined') {
            return;
        }
        const scriptId = 'gapi';
        const scriptEl = document === null || document === void 0 ? void 0 : document.getElementById(scriptId);
        if (scriptEl) {
            return;
        }
        const head = document.getElementsByTagName('head')[0];
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.defer = true;
        script.async = true;
        script.id = scriptId;
        script.onload = this.platformJsLoaded.bind(this);
        script.src = 'https://apis.google.com/js/platform.js';
        head.appendChild(script);
    }
    initialize(_options = {
        clientId: '',
        scopes: [],
        grantOfflineAccess: false,
    }) {
        var _a, _b;
        if (typeof window === 'undefined') {
            return;
        }
        const metaClientId = (_a = document.getElementsByName('google-signin-client_id')[0]) === null || _a === void 0 ? void 0 : _a.content;
        const clientId = _options.clientId || metaClientId || '';
        if (!clientId) {
            console.warn('GoogleAuthPlugin - clientId is empty');
        }
        this.options = {
            clientId,
            grantOfflineAccess: (_b = _options.grantOfflineAccess) !== null && _b !== void 0 ? _b : false,
            scopes: _options.scopes || [],
        };
        this.gapiLoaded = new Promise((resolve) => {
            // HACK: Relying on window object, can't get property in gapi.load callback
            window.gapiResolve = resolve;
            this.loadScript();
        });
        this.addUserChangeListener().then();
    }
    platformJsLoaded() {
        gapi.load('auth2', () => {
            // https://github.com/CodetrixStudio/CapacitorGoogleAuth/issues/202#issuecomment-1147393785
            const clientConfig = {
                client_id: this.options.clientId,
                plugin_name: 'CodetrixStudioCapacitorGoogleAuth',
            };
            if (this.options.scopes.length) {
                clientConfig.scope = this.options.scopes.join(' ');
            }
            gapi.auth2.init(clientConfig);
            window.gapiResolve();
        });
    }
    signIn() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    let serverAuthCode;
                    const needsOfflineAccess = (_a = this.options.grantOfflineAccess) !== null && _a !== void 0 ? _a : false;
                    if (needsOfflineAccess) {
                        const offlineAccessResponse = yield gapi.auth2.getAuthInstance().grantOfflineAccess();
                        serverAuthCode = offlineAccessResponse.code;
                    }
                    else {
                        yield gapi.auth2.getAuthInstance().signIn();
                    }
                    const googleUser = gapi.auth2.getAuthInstance().currentUser.get();
                    if (needsOfflineAccess) {
                        // HACK: AuthResponse is null if we don't do this when using grantOfflineAccess
                        yield googleUser.reloadAuthResponse();
                    }
                    const user = this.getUserFrom(googleUser);
                    user.serverAuthCode = serverAuthCode;
                    resolve(user);
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const authResponse = yield gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse();
            return {
                accessToken: authResponse.access_token,
                idToken: authResponse.id_token,
                refreshToken: '',
            };
        });
    }
    signOut() {
        return __awaiter(this, void 0, void 0, function* () {
            return gapi.auth2.getAuthInstance().signOut();
        });
    }
    addUserChangeListener() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.gapiLoaded;
            gapi.auth2.getAuthInstance().currentUser.listen((googleUser) => {
                this.notifyListeners('userChange', googleUser.isSignedIn() ? this.getUserFrom(googleUser) : null);
            });
        });
    }
    getUserFrom(googleUser) {
        const user = {};
        const profile = googleUser.getBasicProfile();
        user.email = profile.getEmail();
        user.familyName = profile.getFamilyName();
        user.givenName = profile.getGivenName();
        user.id = profile.getId();
        user.imageUrl = profile.getImageUrl();
        user.name = profile.getName();
        const authResponse = googleUser.getAuthResponse(true);
        user.authentication = {
            accessToken: authResponse.access_token,
            idToken: authResponse.id_token,
            refreshToken: '',
        };
        return user;
    }
}
const GoogleAuth = new GoogleAuthWeb();
export { GoogleAuth };
import { registerWebPlugin } from '@capacitor/core';
registerWebPlugin(GoogleAuth);
//# sourceMappingURL=web.js.map