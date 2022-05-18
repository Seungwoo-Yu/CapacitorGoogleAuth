import { WebPlugin } from '@capacitor/core';
import { Authentication, GoogleAuthPlugin, InitOptions, User } from './definitions';
export declare class GoogleAuthWeb extends WebPlugin implements GoogleAuthPlugin {
    gapiLoaded: Promise<void>;
    options: InitOptions;
    constructor();
    loadScript(): void;
    initialize(_options?: Partial<InitOptions>): void;
    platformJsLoaded(): void;
    signIn(): Promise<User>;
    refresh(): Promise<Authentication>;
    signOut(): Promise<any>;
    private addUserChangeListener;
    private getUserFrom;
}
declare const GoogleAuth: GoogleAuthWeb;
export { GoogleAuth };
