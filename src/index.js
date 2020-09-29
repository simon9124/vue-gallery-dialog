import VueDialog from "./components/VueDialog";

const components = [VueDialog];

if (typeof window !== "undefined" && window.Vue) {
  window.Vue.component("VueDialog", components);
}

export default VueDialog;
