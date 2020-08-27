<template>
  <div>
    <el-button type="text"
               @click="openDialog">点击打开图片库</el-button>
    <vue-dialog :visible="visible"
                width="80%"
                top="5vh"
                title="图片库"
                type="PhotoGallery"
                :pic-list="galleryData.list"
                :page-size="8"
                @closeHandler="visible=false"></vue-dialog>
    <!-- @picDelHandler="picDelHandler"
                @picsDelHandler="picsDelHandler"
                @insertFavor="insertFavor"
                @deleteFavor="deleteFavor"
                @picReName="picReName"
                @picsUpload="picsUpload"
                @confirmHandler="confirmHandler" -->
  </div>
</template>

<script>
import VueDialog from '@/components/VueDialog';

export default {
  name: 'GalleryTest',
  components: { VueDialog },
  data () {
    return {
      // dialog显示与否
      visible: false,
      // 原始数据
      galleryData: {}
    };
  },
  created () {
    // this.galleryData.list = []
  },
  methods: {
    // 打开dialog弹框
    openDialog () {
      this.visible = true;
    },
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
