<template>
  <v-app id="app">
    <!-- <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div> -->
    <v-container>
    <v-row justify="end">
      <v-col cols="1" class="text-right">
        <v-menu offset-y v-if="isSignedIn">
          <template v-slot:activator="{ on }">
            <v-avatar color="red" v-on="on">
              <span v-if="!profileUrl" class="white--text headline">CJ</span>
              <img
                v-if="profileUrl"
                :src="profileUrl"
              >
            </v-avatar>
          </template>
          <v-btn @click="signOut()">Sign Out</v-btn>
        </v-menu>
        <v-btn v-if="!isSignedIn && !loading" @click="signIn()">Sign In</v-btn>
      </v-col>
    </v-row>
    </v-container>
    <router-view/>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { Component } from 'vue-property-decorator';

@Component({})
export default class App extends Vue {
  public name = 'App';
  public loading = true;
  public isSignedIn = false;
  public profileUrl = null;

  constructor () {
    super();

    const script = document.createElement('script');
    script.setAttribute('src', 'https://apis.google.com/js/api.js');
    document.head.appendChild(script);
  }

  public mounted () {
    this.$eventHub.$on('is_logged_in', async (isLoggedIn: boolean) => {
      this.loading = false;
      this.isSignedIn = isLoggedIn;
      if (this.isSignedIn) {
        const user = await this.$auth.getUser();
        this.profileUrl = user.getImageUrl();
      }
    });
  }

  public async signIn () {
    await this.$auth.signIn();
  }

  public async signOut () {
    await this.$auth.signOut();
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
