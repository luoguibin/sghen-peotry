<template>
  <div class="page-header">
    <el-button v-show="showBack" type="text" @click="$router.go(-1)">返回</el-button>

    <!-- 登陆或用户下拉菜单 -->
    <el-button v-if="!userInfo.token" class="float-right" type="text" @click="onShowLogin">登录~</el-button>
    <el-dropdown v-else class="float-right" @command="handleCommand" trigger="click">
      <span style="cursor: pointer;">
        <span class="el-dropdown-link" style="vertical-align: middle;">{{userInfo.name}}</span>
        <img :src="userInfo.iconUrl | user-icon" style="width: 33px; vertical-align: middle;" />
      </span>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in dropMenus"
          :key="item.command"
          :command="item.command"
        >{{item.name}}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <login-dialog></login-dialog>

    <!-- 个人信息对话框 -->
    <el-dialog title="个人信息" :visible.sync="showUser">
      <el-form label-width="60px">
        <el-form-item label="ID">
          <el-input disabled v-model="mUserInfo.id"></el-input>
        </el-form-item>

        <el-form-item label="昵称">
          <el-input v-model="mUserInfo.name"></el-input>
        </el-form-item>

        <el-form-item label="头像">
          <img :src="mUserInfo.iconUrl | user-icon" style="max-width: 50px; vertical-align: top;" />
          <span>
            <el-button type="text" @click="onClickIconUpdate">更换</el-button>
            <input
              type="file"
              ref="iconInput"
              accept="image/*"
              @change="onIconChange"
              v-show="false"
            />
          </span>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onUpdateUserInfo">更新信息</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <el-dialog title="头像更新" :visible.sync="iconDialogVisible">
      <vue-cropper
        ref="cropper"
        class="cropper"
        :img="option.img"
        :outputType="option.outputType"
        :info="option.info"
        :canMoveBox="option.canMoveBox"
        :fixedBox="option.fixedBox"
        :original="option.original"
        :autoCrop="option.autoCrop"
        :autoCropWidth="option.autoCropWidth"
        :autoCropHeight="option.autoCropHeight"
        :maxImgSize="option.maxImgSize"
      ></vue-cropper>
      <el-button @click="onSubmitCropper">更新</el-button>
    </el-dialog>

    <!-- 诗词创建 -->
    <peotry-create :showCreate="showCreate" :peotry="updatePeotry" @on-close="onPeotryClose">
    </peotry-create>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { updateUser, uploadFiles } from '@/api'
import { VueCropper } from 'vue-cropper'

import LoginDialog from '@/components/login-dialog'
import PeotryCreate from '@/components/peotry-create'

export default {
  name: 'page-header',
  components: {
    LoginDialog,
    VueCropper,
    PeotryCreate
  },
  data() {
    return {
      dropMenus: [
        {
          command: 'personal',
          name: '个人中心'
        },
        {
          command: 'my-peotry',
          name: '我的诗词'
        },
        {
          command: 'peotry',
          name: '创建诗词'
        },
        {
          command: 'logout',
          name: '退出登录'
        }
      ],

      showUser: false,
      mUserInfo: {},

      showCreate: false,
      updatePeotry: null,

      iconDialogVisible: false,
      option: {
        img: '',
        original: true, // 上传图片按照原始比例渲染
        outputType: 'png',
        fixedBox: true, // 固定截图框大小 不允许改变
        canMoveBox: false,
        autoCrop: true,
        autoCropWidth: 128, // 只有自动截图开启 宽度高度才生效
        autoCropHeight: 128,
        info: false, // 隐藏裁剪框大小信息
        maxImgSize: 300
      }
    }
  },

  created() {
    window.homeHeader = this
    if (this.$route.name === 'blank') {
      this.onShowLogin()
    }
  },

  computed: {
    ...mapState({
      userInfo: state => state.user,
      showBack: state => state.showBack,
      peotryOption: state => state.peotryOption
    })
  },

  watch: {
    /**
     * 监听诗词操作对象，是否新建还是编辑诗词
     */
    peotryOption: {
      deep: true,
      handler(e) {
        if (e.type === 'create') {
          this.updatePeotry = null
          this.showCreate = true
        } else if (e.type === 'update') {
          this.updatePeotry = JSON.parse(e.data)
          this.showCreate = true
        } else {
          this.showCreate = false
        }
      }
    },
    /**
     * 监听是否跳转空白页
     */
    '$route'() {
      if (this.$route.name === 'blank') {
        this.onShowLogin()
      }
    }
  },

  methods: {
    /**
     * 回调下拉菜单，分发操作
     */
    handleCommand(key) {
      switch (key) {
        case 'peotry':
          this.showCreate = true
          break
        case 'my-peotry':
          this.$router.push({ name: 'peotry-list', query: { userId: this.userInfo.id } })
          break
        case 'personal':
          this.showUser = true
          this.mUserInfo = JSON.parse(JSON.stringify(this.userInfo))
          break
        case 'logout':
          this.setUserInfo()
          break
        default:
          break
      }
    },

    /**
     * 回调当前诗词对话框关闭
     */
    onPeotryClose({ createValue, currentId }) {
      this.showCreate = false
      if (currentId) {
        this.setPeotryOption({ type: 'success', data: currentId })
      }
    },

    /**
     * 打开登陆界面
     */
    onShowLogin() {
      this.showLogin()
    },

    /**
     * 模拟点击开打图片选择
     */
    onClickIconUpdate() {
      this.$refs.iconInput.click()
    },
    /**
     * 回调图片选择
     */
    onIconChange(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) {
        return
      }

      const reader = new FileReader(file)
      reader.onload = e => {
        this.option.img = reader.result
        this.iconDialogVisible = true
      }
      reader.readAsDataURL(file)
    },

    /**
     * 回调图片裁剪、上传头像
     */
    onSubmitCropper() {
      this.$refs.cropper.getCropBlob(data => {
        const file = new File([data], 'user-icon.png', {
          type: 'image/png',
          lastModified: Date.now()
        })

        const formData = new FormData()
        formData.append('file', file)

        // 上传头像
        uploadFiles({ pathType: 'icon' }, formData).then(resp => {
          const iconUrl = resp.data.data[0]

          // 更新用户头信息
          updateUser({
            iconUrl,
            id: this.userInfo.id
          }).then(resp => {
            this.$message.success('更新头像成功')

            const info = { ...this.userInfo, iconUrl: iconUrl }
            this.setUserInfo(info)
            this.handleCommand('personal')
            this.iconDialogVisible = false
          })
        })
      })
    },

    /**
     * 更新个人信息
     */
    onUpdateUserInfo() {
      if (this.mUserInfo.name.length) {
        updateUser({
          name: this.mUserInfo.name,
          id: this.userInfo.id
        }).then(resp => {
          this.$message.success('更新个人信息成功')
          const info = { ...this.userInfo, name: this.mUserInfo.name }
          this.setUserInfo(info)
          this.showUser = false
        })
      } else {
        this.$message.warning('名字不能为空')
      }
    },

    ...mapActions({
      setUserInfo: 'setUser',
      showLogin: 'showLogin',
      setPeotryOption: 'setPeotryOption'
    })
  }
}
</script>

<style lang="scss" scoped>
.page-header {
  height: 60px;
  padding-top: 10px;
  box-sizing: border-box;

  .float-right {
    float: right;
  }

  .vue-cropper {
    min-height: 200px;
  }
}
</style>
