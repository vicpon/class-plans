// mixins.ts
import Vue from 'vue'
import Component from 'vue-class-component'

// You can declare mixins as the same style as components.
@Component
export class AuthComponent extends Vue {
  $auth: any;
}
