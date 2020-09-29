<!--组件：Dialog弹出窗口
  * Attributes：
  * @top    Dialog CSS 中的 margin-top 值  require:false   default:'15vh'
  * @title    弹出窗口表头  require:false   default:'上传组件'
  * @width    弹窗宽度     require:false   default:'50%'
  * @visible  是否显示弹窗  require:false   default:false 不显示
  *
  * Events:
  * @open    弹窗弹出回调
  * @close   关闭按钮回调
  * @confirm 确认按钮回调  return {visable: this.isVisable, galleryList:this.galleryList}
-->
<template>
  <el-dialog class="dialog"
             :title="title"
             :width="width"
             :top="top"
             :visible.sync="visible"
             :before-close="close"
             @open="open">

    <!-- 图片库 -->
    <gallery :visible="visible"
             :pic-list-props="picList"
             :gallery-list="galleryList"
             :page-num="pageNum"
             :page-size="pageSize"
             :total="total"
             :filters="filters"
             :filter-form-data="filterFormData"
             :loading="loading"
             :big-pic="bigPic"
             :favorite="favorite"
             :edit="edit"
             :copy-link="copyLink"
             @page-change="pageChange"
             @search-filter="searchFilter"
             @aside-select="asideSelect"
             @pics-upload="picsUpload"
             @pics-delete="picsDelete"
             @pic-delete="picDelete"
             @pic-click="picClick"
             @insert-favor="insertFavor"
             @delete-favor="deleteFavor"
             @clipboard-copy="clipboardCopy"
             @re-name="reName">
    </gallery>

    <!-- footer -->
    <span slot="footer"
          class="dialog-footer">
      <el-button @click="close">取 消</el-button>
      <el-button type="primary"
                 @click="confirm">确 定</el-button>
    </span>

  </el-dialog>
</template>

<script>
import Gallery from './Gallery/Gallery'; // 组件：图片库

export default {
  name: 'VueDialog',
  components: { Gallery },
  props: {
    //  Dialog CSS 中的 margin-top 值
    top: {
      type: String,
      default: '5vh'
    },
    // 标题
    title: {
      type: String,
      default: '图片库'
    },
    // 弹窗宽度
    width: {
      type: String,
      default: '80%'
    },
    // 弹窗是否可见 - 父组件数据
    visible: {
      type: Boolean,
      default: false
    },
    // loading
    loading: {
      type: Boolean,
      default: false
    },
    // 数据列表 - 当前页
    picList: {
      type: Array,
      default: () => []
    },
    // 初始化页码
    pageNum: {
      type: Number,
      default: 1
    },
    // 初始化每页显示数量
    pageSize: {
      type: Number,
      default: 8
    },
    // 总数
    total: {
      type: Number,
      default: 0
    },
    // 左侧筛选栏
    filters: {
      type: Array,
      default: () => []
    },
    // 筛选表单
    filterFormData: {
      type: Object,
      default: () => { }
    },
    // 是否显示功能 - 图片放大
    bigPic: {
      type: Boolean,
      default: true
    },
    // 是否显示功能 - 收藏
    favorite: {
      type: Boolean,
      default: true
    },
    // 是否显示功能 - 重命名
    edit: {
      type: Boolean,
      default: true
    },
    // 是否显示功能 - 复制链接
    copyLink: {
      type: Boolean,
      default: true
    },
  },
  data () {
    return {
      galleryList: [], // 图片list数据 - 被选中的
    };
  },
  methods: {
    // 回调：打开弹窗
    open () {
      this.$emit('open', this.isVisable);
    },
    // 回调：关闭弹窗
    close (done) {
      this.$emit('close', this.isVisable);
      this.galleryList = [];
    },
    // 回调：页码跳转
    pageChange (pageNum) {
      this.$emit('page-change', pageNum)
    },
    // 回调：顶部搜索或按回车键
    searchFilter (filterFormData) {
      this.$emit('search-filter', filterFormData)
    },
    // 回调：左侧边栏被选中
    asideSelect (key) {
      this.$emit('aside-select', key)
    },
    // 改变图片选中状态
    picClick (selectList) {
      this.galleryList = selectList;
    },
    // 回调：批量删除图片
    picsDelete (selectList) {
      this.$emit('pics-delete', selectList);
    },
    // 回调：删除单张图片
    picDelete (pic) {
      this.$emit('pic-delete', pic);
    },
    // 回调：重命名图片
    reName (pic) {
      this.$emit('re-name', pic);
    },
    // 回调：用户收藏
    insertFavor (pic) {
      this.$emit('insert-favor', pic);
    },
    // 回调：用户取消收藏
    deleteFavor (pic) {
      this.$emit('delete-favor', pic);
    },
    // 回调：批量上传图片
    picsUpload (files) {
      this.$emit('pics-upload', files);
    },
    // 回调：复制图片链接
    clipboardCopy () {
      this.$emit("clipboard-copy")
    },
    // 回调：确认按钮
    confirm () {
      this.$emit('confirm', this.galleryList);
      this.galleryList = [];
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
.el-button {
  height: 32px;
  line-height: 6px;
  font-size: 12px;
}
</style>
