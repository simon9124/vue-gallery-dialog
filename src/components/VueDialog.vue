<!--组件：Dialog弹出窗口
/**
  * 弹窗参数：
  * @title    弹出窗口表头  require:false   default:'上传组件'
  * @visible  是否显示弹窗  require:false   default:false 不显示
  * @width    弹窗宽度     require:false   default:'50%'
  * @type     弹窗类别     require:false    default:'UploadExcel'  UploadExcel/PhotoGallery:Excel上传/图片库
  * 上传组件参数:
  * @uploadResult Excel上传结果 require:false default:''
  *
  * Event-Dialog:
  * @openHandler    弹窗弹出回调
  * @closeHandler   关闭按钮回调
  * @confirmHandler 确认按钮回调  return {visable: this.isVisable, galleryList:this.galleryList}
  * Event-Upload:
  * @httpRequestHandler 上传请求 param:{param:{file}, upload组织对象}
**/
-->
<template>
  <el-dialog class="dialog"
             :title="title"
             :width="width"
             :top="top"
             :visible.sync="visible"
             :before-close="closeHandler"
             @open="openHandler"
             custom-class="dialog"
             element-loading-text="数据加载中"
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(0, 0, 0, 0.8)"
             v-loading="loading">

    <!-- 图片库 -->
    <Gallery :visible="visible"
             :page-size="pageSize"
             :pic-list-org="picList"
             :gallery-list="galleryList"
             @picDelHandler="picDelHandler"
             @picsDelHandler="picsDelHandler"
             @insertFavor="insertFavor"
             @deleteFavor="deleteFavor"
             @picReName="picReName"
             @picsUpload="picsUpload"
             @picClickHander="picClickHander">
    </Gallery>

    <!-- footer -->
    <span slot="footer"
          class="dialog-footer">
      <el-button @click="closeHandler">取 消</el-button>
      <el-button type="primary"
                 @click="confirmHandler">确 定</el-button>
    </span>

  </el-dialog>
</template>

<script>
import Gallery from './Gallery/Gallery';

export default {
  name: 'VueDialog',
  components: { Gallery },
  props: {
    //  Dialog CSS 中的 margin-top 值
    top: {
      type: String,
      default: '15vh'
    },
    // 标题
    title: {
      type: String,
      default: '提示'
    },
    // 弹窗宽度
    width: {
      type: String,
      default: '60%'
    },
    // 弹窗是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // loading
    loading: {
      type: Boolean,
      default: false
    },
    // 数据列表
    picList: {
      type: Array,
      default: () => []
    },
    // 初始化每页显示数量
    pageSize: {
      type: Number,
      default: 8
    },
    // Excel 上传结果
    uploadResult: {
      type: String,
      default: ''
    }
  },
  watch: {
    visible (value) {
      // console.debug('watch %s', value)
    }
  },
  data () {
    return {
      galleryList: [] // 图片list数据 - 被选中的
    };
  },
  methods: {
    /*
      公共
    */
    // 打开dialog弹框
    openDialog () {
      this.visible = true;
    },
    // 弹窗dialog回调
    openHandler () {
      this.$emit('openHandler', this.isVisable);
    },
    // 关闭按钮回调
    closeHandler () {
      this.$emit('closeHandler', this.isVisable);
    },
    // 确认按钮回调
    confirmHandler () {
      this.$emit('confirmHandler', {
        visable: this.isVisable,
        galleryList: this.galleryList
      });
    },
    // 上传请求回调
    httpRequestHandler (param) {
      this.$emit('httpRequestHandler', param);
    },

    /*
      图片库
    */
    // 改变图片选中状态
    picClickHander (selectList) {
      this.galleryList = selectList;
    },
    // 批量删除图片
    picsDelHandler (selectList) {
      this.$emit('picsDelHandler', selectList);
    },
    // 删除单张图片
    picDelHandler (pic) {
      this.$emit('picDelHandler', pic);
    },
    // 重命名图片
    picReName (pic) {
      this.$emit('picReName', pic);
    },
    // 用户收藏
    insertFavor (pic) {
      this.$emit('insertFavor', pic);
    },
    // 用户取消收藏
    deleteFavor (pic) {
      this.$emit('deleteFavor', pic);
    },
    // 批量上传图片
    picsUpload (files) {
      this.$emit('picsUpload', files);
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.dialog >>> {
  .el-dialog {
    .el-dialog__body {
      padding: 10px 0 0 0;
    }
  }
}
</style>
