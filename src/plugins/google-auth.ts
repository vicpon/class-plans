import _Vue from 'vue';

declare const gapi: any;
export class GoogleAuth {
  public isAuthorized = false;
  public client: any;

  private vue: Vue;
  private auth: any;
  private scopes = 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.coursework.me.readonly https://www.googleapis.com/auth/classroom.topics.readonly https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.announcements.readonly';

  constructor () {
    this.load();
    this.vue = new _Vue();
  }

  load () {
    if (typeof gapi === 'undefined') {
      setTimeout(() => this.load(), 200);
      return;
    }
    gapi.load('client', () => this.init());
  };

  async init () {
    this.client = gapi.client;
    await gapi.client.init({
      apiKey: process.env.VUE_APP_GCLASS_API_KEY,
      clientId: process.env.VUE_APP_GCLASS_CLIENT_ID,
      scope: this.scopes,
    });
    this.auth = gapi.auth2.getAuthInstance();

    // Listen for sign-in state changes.
    this.auth.isSignedIn.listen((signedIn: boolean) => this.updateSigninStatus(signedIn));
    this.updateSigninStatus(this.auth.isSignedIn.get());
  };

  public updateSigninStatus (isSignedIn: boolean) {
    if (isSignedIn) {
      this.isAuthorized = true;
      this.vue.$eventHub.$emit('is_logged_in', true);
    } else {
      this.isAuthorized = false;
      this.vue.$eventHub.$emit('is_logged_in', false);
    }
  }

  public signIn () {
    if (!this.auth) {
      return;
    }
    return this.auth.signIn();
  }

  public signOut () {
    this.auth.signOut();
  }

  public getUser (): Promise<any> {
    if (!this.auth) {
      throw new Error('Not initialized');
    }
    return new Promise((resolve) => {
      const user = this.auth.currentUser.get();
      if (user) {
        return resolve(user.getBasicProfile());
      } else {
        this.auth.currentUser.listen(function (user: any) {
          resolve(user.getBasicProfile());
        });
      }
    });
  }
}

export function GoogleAuthPlugin (Vue: typeof _Vue, options?: any): void {
  // do stuff with options
  Vue.prototype.$auth = new GoogleAuth();
}
