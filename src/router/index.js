import Vue from "vue";
import Router from "vue-router";
import GalleryTest from "@/test/galleryTest";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "GalleryTest",
      component: GalleryTest
    }
  ]
});
