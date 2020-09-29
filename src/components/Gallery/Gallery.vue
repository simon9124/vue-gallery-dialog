<template>
  <el-container class="gallery-container gallery">
    <el-container class="gallery-container">

      <!-- 左侧筛选 -->
      <el-aside width="15%"
                class="gallery-container-aside"
                v-if="filters.length>0">
        <el-menu default-active="0"
                 class="el-menu-vertical-demo"
                 @select="asideSelect">
          <template v-for="filter in filters">
            <el-menu-item :key="filter.key"
                          :index="filter.key">
              <li slot="title">{{ filter.label }}（{{ filter.total }}）</li>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <!-- 右侧内容 -->
      <el-main style="text-align:right">

        <!-- 顶部操作 -->
        <div class="gallery-list-header">
          <div class="gallery-list-search">
            <el-input v-model="filterFormData.uploadName"
                      placeholder="图片标题"
                      @keyup.native.enter="searchFilter()"></el-input>
            <el-button icon="el-icon-search"
                       size="mini"
                       type="primary"
                       @click="searchFilter()"
                       plain>搜索</el-button>
            <el-button size="mini"
                       type="danger"
                       icon="el-icon-delete"
                       plain
                       @click="picsDelete"
                       style="margin-left:5px">删除</el-button>
          </div>
          <el-upload class="upload-demo"
                     style="display:inline-block"
                     accept=".jpg,.png,.bmp,jpge,"
                     multiple
                     action=""
                     :http-request="()=>{}"
                     :limit="10"
                     :on-exceed="handleExceed"
                     :before-upload="picsUpload"
                     :show-file-list="false"
                     auto-upload>
            <el-button size="mini"
                       type="success">本地上传</el-button>
          </el-upload>
        </div>

        <!-- list列表 -->
        <el-row :gutter="20"
                class="gallery-list-row"
                v-loading="loading"
                element-loading-text="数据加载中"
                element-loading-spinner="el-icon-loading">
          <template v-for="(pic,i) in picList">
            <el-col :span="6"
                    :key="pic.value">
              <div class="gallery-list-col">

                <!-- 图片 -->
                <div class="gallery-list-col-img"
                     ref="imgBox"
                     :style="imgBox"
                     @click="picClick(pic)">
                  <img :src="pic.uploadLocalUrl">
                  <div class="gallery-list-col-mask"
                       v-show="pic.select">
                    <i class="el-icon-check"></i>
                  </div>

                  <!-- 图片放大 -->
                  <div v-if="bigPic"
                       class="gallery-list-col-glass">
                    <i class="el-icon-search"
                       @click.prevent.stop="picGlass(pic,i)"></i>
                  </div>

                </div>

                <!-- 编辑框 -->
                <div class="gallery-list-col-edit">
                  <span v-show="!pic.edit"
                        class="gallery-list-col-edit-picName"
                        @click="editShow(pic,i)">
                    <span>
                      {{ pic.uploadName }}
                      <i v-if="edit"
                         class="el-icon-edit"
                         style="font-size:12px;color:#409EFF" />
                    </span>
                  </span>
                  <el-input v-if="edit"
                            v-show="pic.edit"
                            ref="editInput"
                            v-model="pic.uploadName"
                            @keyup.native.enter="pic.edit=!pic.edit;reName(pic)"></el-input>
                  <el-button v-if="edit"
                             v-show="pic.edit"
                             icon="el-icon-check"
                             size="mini"
                             type="success"
                             class="gallery-list-button"
                             @click="reName(pic);pic.edit=!pic.edit"></el-button>
                  <el-button v-if="edit"
                             v-show="pic.edit"
                             icon="el-icon-close"
                             size="mini"
                             type="warning"
                             class="gallery-list-button"
                             @click="pic.uploadName=pic.uploadNameOrg;pic.edit = !pic.edit"></el-button>
                </div>

                <!-- 操作栏 -->
                <div class="gallery-list-col-operation">

                  <!-- 收藏 -->
                  <el-tooltip v-if="favorite"
                              v-show="pic.uploadIsfavorite"
                              content="取消收藏"
                              placement="top">
                    <el-button icon="el-icon-star-off"
                               size="mini"
                               type="warning"
                               class="gallery-list-button"
                               @click="deleteFavor(pic)"></el-button>
                  </el-tooltip>

                  <!-- 非收藏 -->
                  <el-tooltip v-if="favorite"
                              v-show="!pic.uploadIsfavorite"
                              content="收藏"
                              placement="top">
                    <el-button plain
                               icon="el-icon-star-off"
                               size="mini"
                               type="warning"
                               class="gallery-list-button"
                               @click="insertFavor(pic)"></el-button>
                  </el-tooltip>

                  <!-- 重命名 -->
                  <el-tooltip v-if="edit"
                              content="重命名"
                              placement="top">
                    <el-button plain
                               icon="el-icon-edit"
                               size="mini"
                               type="primary"
                               class="gallery-list-button"
                               @click="editShow(pic,i)"></el-button>
                  </el-tooltip>

                  <!-- 复制url -->
                  <el-tooltip v-if="copyLink"
                              content="复制"
                              placement="top">
                    <el-button plain
                               icon="el-icon-share"
                               size="mini"
                               type="success"
                               class="gallery-list-button"
                               v-clipboard:copy="pic.uploadLocalUrl"
                               v-clipboard:success="clipboardSuccess"></el-button>
                  </el-tooltip>

                  <!-- 删除 -->
                  <el-tooltip content="删除"
                              placement="top">
                    <el-button plain
                               icon="el-icon-delete"
                               size="mini"
                               type="danger"
                               class="gallery-list-button"
                               @click="picDelete(pic)"></el-button>
                  </el-tooltip>

                </div>

              </div>
            </el-col>
          </template>
        </el-row>

        <!-- 分页 -->
        <el-pagination @current-change="pageChange"
                       layout="total, prev, pager, next, jumper"
                       :page-size="pageSize"
                       :current-page="pageNum"
                       :pager-count="5"
                       :total="total">
        </el-pagination>

        <!-- 图片放大 -->
        <div class="gallery-list-bigMask"
             v-if="picBigShow && bigPic"
             @click.prevent.stop="bigUnShow"
             @mousewheel="bigZoom">
          <el-button class="gallery-list-bigMask-button gallery-list-bigMask-button-left"
                     type="info"
                     icon="el-icon-arrow-left"
                     @click.stop="bigLeft"></el-button>
          <el-button class="gallery-list-bigMask-button gallery-list-bigMask-button-right"
                     type="info"
                     icon="el-icon-arrow-right"
                     @click.stop="bigRight"></el-button>
          <img class="gallery-list-bigMask-img"
               :src="picUrl"
               ref="bigImage"
               @click.prevent.stop="bigClick">
          <a class="gallery-list-bigMask-text"
             @click="showOrgPic">查看原图</a>
        </div>

      </el-main>

    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Gallery',
  props: {
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
    // 原始总数据列表
    picListProps: {
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
      default: () => {
        return {
          uploadName: '',
          uploadIsfavorite: ''
        }
      }
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
      picList: [], // 图片list数据 - 当前页面
      selectList: [], // 图片list数据 - 被选中的
      imgBox: { // 动态图片style
        width: '100%',
        height: ''
      },
      screenWidth: document.documentElement.clientWidth, // 记录屏幕宽度默认值
      screenHeight: document.documentElement.clientHeight, // 记录屏幕高度默认值
      picBigShow: false, // 单张放大图片，默认隐藏
      picUrl: '', // 单张图片url（放大）
      index: 0 // 图片在当前页面的索引值
    };
  },
  watch: {
    picListProps: {
      deep: true,
      handler: function () {
        this.init();
      }
    }
  },
  mounted () {
    // 页面第一次加载
    this.init();
    // 挂在reisze 事件
    const that = this;
    window.onresize = () => {
      return (() => {
        window.screenWidth = document.documentElement.clientWidth;
        that.screenWidth = window.screenWidth;
        this.$nextTick(() => {
          const imgBox = this.$refs.imgBox;
          if (this.visible) {
            const wImgbox = imgBox[0].getBoundingClientRect().width;
            this.imgBox.height = 0.6 * wImgbox + 'px';
          }
        });
      })();
    };
  },
  methods: {
    // dialog初始化
    init () {
      this.picList = this.picListProps;
      // 数据加载完后，若有筛选到的数据 -> 获取imgBox的宽度，并设置其高度
      this.picList.length > 0 && this.$nextTick(() => {
        const imgBox = this.$refs.imgBox;
        // console.log(imgBox)
        if (this.visible) {
          const wImgbox = imgBox[0].getBoundingClientRect().width;
          // console.log(wImgbox)
          this.imgBox.height = 0.6 * wImgbox + 'px';
        }
      });
    },
    // 回调：左侧边栏被选中
    asideSelect (key) {
      this.$emit('aside-select', key)
    },
    // 回调：页码跳转
    pageChange (pageNum) {
      // 将前页每张图片select和edit重置为false
      this.picList.forEach(pic => {
        this.$set(pic, 'edit', false);
        this.$set(pic, 'select', false);
      });
      this.$emit('page-change', pageNum)
    },
    // 回调：顶部搜索或按回车键
    searchFilter () {
      // 对象是指针，因此直接 "改变" 对象的值并传给父组件
      this.$emit('search-filter', this.filterFormData)
    },
    // 回调：改变图片选中状态
    picClick (pic) {
      this.selectList = [];
      pic.select = !pic.select;
      this.picList.forEach(pic => {
        pic.select && this.selectList.push(pic);
      });
      this.$emit('pic-click', this.selectList);
    },
    // 回调：批量删除图片
    picsDelete () {
      this.$emit('pics-delete', this.selectList);
    },
    // 回调：删除单张图片
    picDelete (pic) {
      this.$emit('pic-delete', pic);
    },
    // 显示输入框
    editShow (pic, i) {
      this.edit && (pic.edit = !pic.edit);
      this.$nextTick(() => {
        this.$refs.editInput[i].focus();
        this.$set(pic, 'uploadNameOrg', pic.uploadName); // 为图片添加uploadNameOrg属性
      })
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
      const isJPG = files.type === 'image/jpeg' || 'image/png';
      !isJPG && this.$message.error('上传图片只能是 JPG/PNG 格式!');
      isJPG && this.$emit('pics-upload', files);
    },
    // 批量上传 - 最大文件数量限制
    handleExceed (files, fileList) {
      this.$message.warning(`最多选择 10 张图片`);
    },
    // 回调：复制图片链接
    clipboardSuccess () {
      this.$emit("clipboard-copy")
    },
    // 点击放大图片
    picGlass (pic, i) {
      this.index = i;
      this.picUrl = pic.uploadLocalUrl;
      this.picBigShow = true;
    },
    // 放大后的图片按钮 - 前一张
    bigLeft () {
      if (this.index > 0) {
        this.picUrl = this.picList[this.index - 1].uploadLocalUrl;
        this.index--;
      }
    },
    // 放大后的图片按钮 - 后一张
    bigRight () {
      if (this.index < this.pageSize - 1) {
        this.picUrl = this.picList[this.index + 1].uploadLocalUrl;
        this.index++;
      }
    },
    // 点击其他区域隐藏大图，"查看原图"按钮除外
    bigUnShow (e) {
      // console.log(e.target.className);
      e.target.className !== "gallery-list-bigMask-text" && (this.picBigShow = false)
    },
    // 查看原图
    showOrgPic () {
      window.open(this.picUrl, '_blank');
    },
    // 放大后滚动鼠标滚轴
    bigZoom () {
      // 获取当前页面的缩放比，若未设置zoom缩放比，则为默认100%，即1，原图大小
      var zoom = parseInt(this.$refs.bigImage.style.zoom) || 100;
      // event.wheelDelta：获取滚轮滚动值并将滚动值叠加给缩放比zoom
      // wheelDelta统一为±120，其中正数表示为向上滚动，负数表示向下滚动
      zoom += event.wheelDelta / 18;
      /* 最小范围 和 最大范围 的图片缩放尺度 */
      var bigImageHeight = this.$refs.bigImage.getBoundingClientRect().height * zoom / 100
      if (bigImageHeight >= this.screenHeight * 0.4 && bigImageHeight < this.screenHeight * 0.8) {
        this.$refs.bigImage.style.zoom = zoom + "%";
      }
      return false;
    },
    // 点击放大后的图片
    bigClick () {
      // console.log('图片被选中');
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../../styles/gallery.scss';
</style>
