import { createApp } from "vue";
import { createPinia } from "pinia";
import "@/style.css";
import App from "@/App.vue";
import { router } from "@/router";
import { useAuthStore } from "@/stores/auth";

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
useAuthStore(pinia).init();
app.use(router).mount("#app");
