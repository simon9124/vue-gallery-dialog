<template>
  <div>
    <el-button type="text"
               @click="openDialog">点击打开图片库</el-button>
    <vue-dialog width="80%"
                top="5vh"
                title="图片库"
                :visible="visible"
                :loading="loading"
                :pic-list="picList"
                :filters="filters"
                :filter-form-data="filterFormData"
                :page-num="pageNum"
                :page-size="pageSize"
                :total="total"
                @close="visible=false"
                @confirm="confirm"
                @page-change="pageChange"
                @search-filter="searchFilter"
                @aside-select="asideSelect"
                @pics-upload="picsUpload"
                @pics-delete="picsDelete"
                @pic-delete="picDelete"
                @insert-favor="insertFavor"
                @delete-favor="deleteFavor"
                @clipboard-copy="clipboardCopy"
                @re-name="reName"></vue-dialog>
  </div>
</template>

<script>
import VueDialog from '@/components/VueDialog'; // 组件：弹窗图片库
import { galleryData } from "@/mock/gallery" // mockData

export default {
  name: 'GalleryTest',
  components: { VueDialog },
  data () {
    return {
      visible: false, // dialog显示与否
      loading: false, // loading
      galleryData: {}, //  图片list数据 - 原始数据
      picListAll: [], // 图片list数据 - 筛选后所有
      picList: [], // 图片list数据 - 当前页面
      pageSize: 8, // 初始化每页显示数量
      pageNum: 1, // 初始化页码
      total: 0, // 总数
      filters: [ // 左侧筛选栏
        { key: 'all', label: '全部', total: 0 },
        { key: 'uploadIsfavorite', label: '我的收藏', total: 0 }
      ],
      filterFormData: { // 筛选form
        uploadName: '',
        uploadIsfavorite: ''
      },
    };
  },
  watch: {
    visible (value) {
      if (!value) {
        this.pageNum = 1;
        this.filterFormData = {
          uploadName: '',
          uploadIsfavorite: ''
        };
      }
    },
  },
  methods: {
    // 按钮：点击打开图片库
    openDialog () {
      this.loading = true;
      this.visible = true;
      this.init()
    },
    // dialog - 数据初始化
    init () {
      this.galleryData = galleryData;
      this.galleryData.list.map(pic => { // 为每张图片添加select和edit属性
        this.$set(pic, 'edit', false);
        this.$set(pic, 'select', false);
        return pic;
      });
      this.refreshData(); // 数据筛选
    },
    // dialog - 数据筛选
    refreshData () {
      this.picListAll = this.galleryData.list.filter(pic => { // 根据关键词 or 边栏选择，筛选数据
        return (
          pic.uploadName.indexOf(this.filterFormData.uploadName) > -1 &&
          pic.uploadIsfavorite
            .toString()
            .indexOf(this.filterFormData.uploadIsfavorite.toString()) > -1
        );
      });
      this.getFiltersData(); // 左侧filters数据
      this.pageChange(this.pageNum); // 数据分页 -> 当前页
      this.total = this.picListAll.length; // 数据总数
      this.loading = false;
    },
    // dialog - 左侧filters数据
    getFiltersData () {
      // 渲染左侧filters栏的数据
      this.filters.forEach(filter => {
        if (filter.key === 'all') {
          filter.total =
            this.galleryData.list.filter(pic => {
              return pic.uploadName.indexOf(this.filterFormData.uploadName) > -1
            }).length;
          this.galleryData.list.length;
        } else if (filter.key === 'uploadIsfavorite') {
          filter.total = 0;
          this.picListAll.forEach(pic => {
            pic.uploadIsfavorite && (filter.total += 1)
          });
        }
      });
    },
    // dialog - 页码跳转
    pageChange (pageNum) {
      this.pageNum = pageNum;
      this.picList = this.picListAll.slice(
        (this.pageNum - 1) * this.pageSize,
        this.pageNum * this.pageSize
      );
    },
    // dialog - 顶部搜索或按回车键
    searchFilter (filterFormData) {
      this.loading = true;
      this.filterFormData = filterFormData;
      this.pageNum = 1;
      this.refreshData();
    },
    // dialog - 左侧边栏被选中
    asideSelect (key) {
      this.pageNum = 1;
      switch (key) {
        case 'all':
          this.filterFormData.uploadIsfavorite = '';
          this.refreshData();
          break;
        case 'uploadIsfavorite':
          this.filterFormData.uploadIsfavorite = '1';
          this.refreshData();
          break;
      }
    },
    // dialog - 批量删除图片
    async picsDelete (selectList) {
      if (selectList.length === 0) {
        this.$message({
          message: "未选择图片",
          type: "error"
        });
        return false;
      }
      const res = await this.$confirm('确认删除？', '提示', {
        type: 'warning'
      }).catch(() => { });
      if (res === 'confirm') {
        // 前端虚拟批量删除操作 -> 给selectList里的每个pic做单独删除
        selectList.forEach(async pic => {
          // await deletePhoto(pic.uploadCode);
          const index = this.galleryData.list.indexOf(pic);
          this.galleryData.list.splice(index, 1);
        });
        this.getFiltersData();
        this.refreshData();
        this.getResultMessage('删除成功');
      }
    },
    // dialog - 删除单张图片
    async picDelete (pic) {
      const res = await this.$confirm('确定删除该图片？', '提示', {
        type: 'warning'
      }).catch(() => { });
      if (res === 'confirm') {
        // 前端虚拟删除操作 -> 根据pic的下标删除该pic
        const index = this.galleryData.list.indexOf(pic);
        this.galleryData.list.splice(index, 1);
        this.getFiltersData();
        this.refreshData();
        this.getResultMessage("删除成功");
      }
    },
    // dialog - 重命名图片
    async reName (pic) {
      this.$set(pic, 'uploadName', pic.uploadName);
      this.getResultMessage("修改成功");
    },
    // dialog - 用户收藏
    async insertFavor (pic) {
      this.$set(pic, 'uploadIsfavorite', 1);
      this.getFiltersData();
      this.getResultMessage("收藏成功");
    },
    // dialog - 用户取消收藏
    async deleteFavor (pic) {
      this.$set(pic, 'uploadIsfavorite', 0);
      this.getFiltersData();
      this.getResultMessage("取消成功");
    },
    // dialog - 批量上传图片
    picsUpload (files) {
      this.$message({
        message: '上传成功，f12可查看上传的图片',
        type: 'success'
      });
      console.log(files);
      const form = new FormData();
      form.append('file', files);
    },
    // dialog - 复制图片链接
    clipboardCopy () {
      this.$message({
        message: '图片链接复制成功',
        type: 'success',
        duration: 1500
      });
    },
    // dialog - 确认按钮
    confirm (galleryList) {
      this.visible = false;
      var selectPicName = '';
      if (galleryList.length !== 0) {
        galleryList.forEach(pic => {
          selectPicName += pic.uploadName + '，';
        });
        selectPicName = selectPicName.substring(0, selectPicName.length - 1);
        this.$message({
          message: '被选中的图片：' + selectPicName,
          type: 'success'
        });
      }
    },
    // 回显message数据
    getResultMessage (resultMessage) {
      this.$message({
        message: resultMessage,
        type: 'success'
      });
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
</style>
