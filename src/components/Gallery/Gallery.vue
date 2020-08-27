<template>
  <div>
    <el-container class="gallery-container gallery">
      <el-container class="gallery-container">

        <!-- 左侧筛选 -->
        <el-aside width="15%"
                  class="gallery-container-aside">
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
              <!-- :placeholder="type === 'PhotoGallery'?'图片标题':'脚本标题'" -->
              <el-input v-model="filterFormData.uploadName"
                        @keyup.native.enter="refreshGallery()"></el-input>
              <el-button icon="el-icon-search"
                         size="mini"
                         type="primary"
                         @click="refreshGallery()"
                         plain>搜索
              </el-button>
              <el-button size="mini"
                         type="danger"
                         icon="el-icon-delete"
                         plain
                         @click="picsDelHandler"
                         style="margin-left:5px">删除</el-button>
            </div>
            <el-upload class="upload-demo"
                       accept=".jpg,.png,.bmp,jpge,"
                       multiple
                       action=""
                       :http-request="()=>{}"
                       :limit="10"
                       :on-exceed="handleExceed"
                       :before-upload="picsUpload"
                       :show-file-list="false"
                       auto-upload
                       style="display:inline-block">
              <el-button size="mini"
                         type="success">本地上传</el-button>
            </el-upload>
          </div>

          <!-- list列表 -->
          <el-row :gutter="20"
                  class="gallery-list-row">
            <template v-for="(pic,i) in picList">
              <el-col :span="6"
                      :key="pic.value">
                <div class="gallery-list-col">

                  <!-- 图片 -->
                  <div class="gallery-list-col-img"
                       ref="imgBox"
                       :style="imgBox"
                       @click="picClickHander(pic)">
                    <img :src="pic.uploadLocalUrl">
                    <div class="gallery-list-col-mask"
                         v-show="pic.select">
                      <i class="el-icon-check"></i>
                    </div>
                    <div class="gallery-list-col-glass">
                      <i class="el-icon-search"
                         @click.prevent.stop="picGlass(pic,i)"></i>
                    </div>
                  </div>

                  <!-- 编辑框 -->
                  <div class="gallery-list-col-edit">
                    <span v-show="!pic.edit"
                          class="gallery-list-col-edit-picName"
                          @click="pic.edit=!pic.edit">
                      <span>
                        {{ pic.uploadName }}
                        <i class="el-icon-edit"
                           style="font-size:12px;color:#409EFF" />
                      </span>
                    </span>
                    <el-input v-show="pic.edit"
                              v-model="pic.uploadName"
                              @keyup.native.enter="pic.edit=!pic.edit;picReName(pic)"></el-input>
                    <el-button v-show="pic.edit"
                               icon="el-icon-check"
                               size="mini"
                               type="success"
                               class="gallery-list-button"
                               @click="pic.edit=!pic.edit;picReName(pic)"></el-button>
                    <el-button v-show="pic.edit"
                               icon="el-icon-close"
                               size="mini"
                               type="warning"
                               class="gallery-list-button"
                               @click="pic.edit=!pic.edit"></el-button>
                  </div>

                  <!-- 操作栏 -->
                  <div class="gallery-list-col-operation">

                    <!-- 收藏 -->
                    <el-tooltip v-show="pic.uploadIsfavorite"
                                content="取消收藏"
                                placement="top">
                      <el-button icon="el-icon-star-off"
                                 size="mini"
                                 type="warning"
                                 class="gallery-list-button"
                                 @click="deleteFavor(pic)"></el-button>
                    </el-tooltip>

                    <!-- 非收藏 -->
                    <el-tooltip v-show="!pic.uploadIsfavorite"
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
                    <el-tooltip content="重命名"
                                placement="top">
                      <el-button plain
                                 icon="el-icon-edit"
                                 size="mini"
                                 type="primary"
                                 class="gallery-list-button"
                                 @click="pic.edit=true"></el-button>
                    </el-tooltip>

                    <!-- 复制url -->
                    <el-tooltip content="复制"
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
                                 @click="picDelHandler(pic)"></el-button>
                    </el-tooltip>

                  </div>

                </div>
              </el-col>
            </template>
          </el-row>

          <!-- 分页 -->
          <el-pagination @current-change="handlePageChange"
                         :page-size="pageSize"
                         :pager-count="5"
                         layout="total, prev, pager, next, jumper"
                         :total="picListAll.length">
          </el-pagination>

          <!-- 图片放大 -->
          <div class="gallery-list-bigMask"
               v-if="picBigShow"
               @click.prevent.stop="picBigShow=!picBigShow"
               @mousewheel="picBigZoom">
            <el-button class="gallery-list-bigMask-button gallery-list-bigMask-button-left"
                       type="info"
                       icon="el-icon-arrow-left"
                       @click.stop="picBigLeft"></el-button>
            <el-button class="gallery-list-bigMask-button gallery-list-bigMask-button-right"
                       type="info"
                       icon="el-icon-arrow-right"
                       @click.stop="picBigRight"></el-button>
            <img class="gallery-list-bigMask-img"
                 :src="picUrl"
                 @click.prevent.stop="picBigSelect">
            <!-- <a class="gallery-list-bigMask-text"
               @click="showOrgPic()">查看原图</a> -->
          </div>

        </el-main>

      </el-container>
    </el-container>
  </div>
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
    // 类型
    type: {
      type: String,
      default: 'PhotoGallery'
    },
    // 原始总数据列表
    picListOrg: {
      type: Array,
      default: () => []
    },
    // 初始化每页显示数量
    pageSize: {
      type: Number,
      default: 8
    }
  },
  data () {
    return {
      // 图片list数据 - 筛选后所有
      picListAll: [],
      // 图片list数据 - 当前页面
      picList: [],
      // 初始化页码
      pageNum: 1,
      // 筛选
      filterFormData: {
        uploadName: '',
        uploadIsfavorite: ''
      },
      // 左侧筛选栏
      filters: [
        { key: 'all', label: '全部', total: 0 },
        { key: 'favorites', label: '我的收藏', total: 0 }
      ],
      // 动态图片style
      imgBox: {
        width: '100%',
        height: ''
      },
      // 记录屏幕宽度默认值
      screenWidth: document.body.clientWidth,
      // 图片list数据 - 被选中的
      selectList: [],
      // 单张放大图片，默认隐藏
      picBigShow: false,
      // 单张图片url（放大）
      picUrl: '',
      // 图片在当前页面的索引值
      index: 0
    };
  },
  watch: {
    visible (value) {
      if (value) {
        this.init();
      } else {
        // this.pageNum = 1;
        this.filterFormData = {
          uploadName: '',
          uploadIsfavorite: ''
        };
      }
    },
    picListOrg: {
      deep: true,
      handler: function () {
        this.refreshGallery();
      }
    },
    filters: {
      deep: true,
      handler: function (val) {
        this.filters = val;
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
        window.screenWidth = document.body.clientWidth;
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
      // 根据业务类型查询结果列表
      if (this.type === 'PhotoGallery') {
        // 为每张图片添加select和edit属性
        this.picListOrg.map(pic => {
          this.$set(pic, 'edit', false);
          this.$set(pic, 'select', false);
          return pic;
        });
        // 数据筛选
        this.refreshGallery();
        // 数据加载完后，若有筛选到的数据 -> 获取imgBox的宽度，并设置其高度
        if (this.picList.length > 0) {
          this.$nextTick(() => {
            const imgBox = this.$refs.imgBox;
            // console.log(imgBox)
            if (this.visible) {
              const wImgbox = imgBox[0].getBoundingClientRect().width;
              // console.log(wImgbox)
              this.imgBox.height = 0.6 * wImgbox + 'px';
            }
          });
        }
      }
    },
    // 左侧filters栏数据
    getFiltersData () {
      // 计算总favourate数据
      var favoriteCount = 0;
      this.picListOrg.forEach(pic => {
        if (pic.uploadIsfavorite === 1) {
          favoriteCount += 1;
        }
      });
      // 渲染左侧filters栏的数据
      this.filters.forEach(filter => {
        if (filter.key === 'all') {
          filter.total = this.picListOrg.length;
        } else if (filter.key === 'favorites') {
          filter.total = favoriteCount;
        }
      });
    },
    // 根据条件筛选图片数据
    refreshGallery () {
      // 左侧filters栏数据
      this.getFiltersData();
      // 全部符合筛选条件的图片 -> 计总数用
      this.picListAll = this.picListOrg.filter(pic => {
        if (
          pic.uploadName.indexOf(this.filterFormData.uploadName) > -1 &&
          pic.uploadIsfavorite
            .toString()
            .indexOf(this.filterFormData.uploadIsfavorite.toString()) > -1
        ) {
          return pic;
        }
      });
      // 在页码要显示的图片
      this.picList = this.picListAll.slice(
        (this.pageNum - 1) * this.pageSize,
        this.pageNum * this.pageSize
      );
    },
    // 根据左侧边栏调用数据
    asideSelect (key) {
      switch (key) {
        case 'all':
          this.filterFormData.uploadIsfavorite = '';
          this.pageNum = 1;
          this.refreshGallery();
          break;
        case 'favorites':
          this.filterFormData.uploadIsfavorite = '1';
          this.pageNum = 1;
          this.refreshGallery();
          break;
      }
    },
    // 分页-跳页
    handlePageChange (pageNum) {
      this.pageNum = pageNum;
      this.refreshGallery();
    },
    // 改变图片选中状态
    picClickHander (pic) {
      this.selectList = [];
      pic.select = !pic.select;
      this.picList.map(pic => {
        if (pic.select === true) {
          // this.selectList.push(pic.uploadCode)
          this.selectList.push(pic);
        }
      });
      this.$emit('picClickHander', this.selectList);
    },
    // 批量删除图片
    picsDelHandler () {
      this.$emit('picsDelHandler', this.selectList);
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
      const isJPG = files.type === 'image/jpeg' || 'image/png';
      if (!isJPG) {
        this.$message.error('上传图片只能是 JPG/PNG 格式!');
      } else {
        this.$emit('picsUpload', files);
      }
    },
    // 批量上传 - 最大文件数量限制
    handleExceed (files, fileList) {
      this.$message.warning(`最多选择 10 张图片`);
    },
    // 复制图片链接
    clipboardSuccess () {
      this.$message({
        message: '图片链接复制成功',
        type: 'success',
        duration: 1500
      });
    },
    // 点击放大图片
    picGlass (pic, i) {
      // console.log(pic);
      this.index = i;
      this.picUrl = pic.uploadLocalUrl;
      this.picBigShow = true;
    },
    // 放大后的图片按钮 - 前一张
    picBigLeft () {
      if (this.index > 0) {
        this.picUrl = this.picList[this.index - 1].uploadLocalUrl;
        this.index--;
      }
    },
    // 放大后的图片按钮 - 后一张
    picBigRight () {
      if (this.index < this.pageSize - 1) {
        this.picUrl = this.picList[this.index + 1].uploadLocalUrl;
        this.index++;
      }
    },
    // 查看原图
    showOrgPic () {
      const url = 'https://' + this.picUrl;
      console.log(url);
      window.open(url, '_blank');
    },
    // 点击放大后的图片
    picBigSelect () {
      // console.log('图片被选中');
    },
    // 放大后滚动鼠标滚轴
    picBigZoom () {
      // console.log('1')
    }
  }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
@import '../../styles/gallery.scss';
</style>
