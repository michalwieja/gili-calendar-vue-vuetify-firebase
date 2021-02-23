import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import firebase from "firebase/app";
import "firebase/firestore";
import Vuelidate from "vuelidate";

Vue.config.productionTip = false;
Vue.use(Vuelidate);

var firebaseConfig = {
  apiKey: "AIzaSyDvPGp8A1gZkySiHdK3D113YCBMkQlwTPY",
  authDomain: "giligili2021.firebaseapp.com",
  projectId: "giligili2021",
  storageBucket: "giligili2021.appspot.com",
  messagingSenderId: "532523061481",
  appId: "1:532523061481:web:866ff1b5db79fb79cc2078",
};

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
new Vue({
  vuetify,
  render: function(h) {
    return h(App);
  },
}).$mount("#app");
