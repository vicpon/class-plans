// see https://vuejs.org/v2/guide/typescript.html
import Vue from 'vue'
import { GoogleAuth } from '../plugins/google-auth';

declare module 'vue/types/vue' {
  // 3. Declare augmentation for Vue
  interface Vue {
    $auth: GoogleAuth;
    $eventHub: Vue;
  }
}