<template>
  <div class="peotry-header">
    <el-button v-if="!userInfo.token" class="float-right" type="text" @click="onShowLogin">登录~</el-button>

    <el-dropdown v-else class="float-right" @command="handleCommand" trigger="click">
      <span style="cursor: pointer;">
        <span class="el-dropdown-link" style="vertical-align: middle;">{{userInfo.name}}</span>
        <img :src="userInfo.iconUrl" style="width: 33px; vertical-align: middle;" />
      </span>
      <el-dropdown-menu>
        <el-dropdown-item command="personal">个人中心</el-dropdown-item>
        <el-dropdown-item command="peotry">创建诗词</el-dropdown-item>
        <el-dropdown-item command="logout">退出登录</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>

    <el-dialog title="个人信息" :visible.sync="showUser">
      <el-form label-width="60px">
        <el-form-item label="ID">
          <el-input disabled v-model="showUserInfo.id"></el-input>
        </el-form-item>

        <el-form-item label="昵称">
          <el-input v-model="showUserInfo.name"></el-input>
        </el-form-item>

        <el-form-item label="头像">
          <img :src="showUserInfo.iconUrl" style="max-width: 50px; vertical-align: top;" />
          <span>
            <el-button @click="onClickIconUpdate">更换</el-button>
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
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { updateUser, uploadFiles } from '@/api'
import { VueCropper } from 'vue-cropper'
import { resetUserIconUrl } from '@/common/util-icon'

export default {
  name: 'peotry-header',
  components: {
    'vue-cropper': VueCropper
  },
  data () {
    return {
      showUser: false,
      showUserInfo: {},

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

  created () {
    window.homeHeader = this
  },

  computed: {
    ...mapState({
      userInfo: state => state.user
    })
  },

  watch: {
    userInfo: {
      immediate: true,
      handler () {}
    }
  },

  methods: {
    handleCommand (key) {
      switch (key) {
        case 'peotry':
          this.showPeotryCreate()
          break
        case 'personal':
          this.showUser = true
          this.showUserInfo = JSON.parse(JSON.stringify(this.userInfo))
          break
        case 'logout':
          this.setUserInfo()
          break
        default:
          break
      }
    },

    onShowLogin () {
      this.showLogin()
    },

    onClickIconUpdate () {
      this.$refs.iconInput.click()
    },
    /**
     * 打开图片选择
     */
    onIconChange (e) {
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

    onSubmitCropper () {
      this.$refs.cropper.getCropBlob(data => {
        const file = new File([data], 'example.png', {
          type: 'image/png',
          lastModified: Date.now()
        })
        const formData = new FormData()
        formData.append('file', file)

        uploadFiles({ pathType: 'normal' }, formData)
          .then(resp => {
            if (resp.data.code !== 1000) {
              this.$message(resp.data.msg)
              return
            }

            const iconUrl = resp.data.data[0]
            updateUser({
              iconUrl,
              uId: this.userInfo.id
            }).then(resp => {
              if (resp.data.code === 1000) {
                this.$message('更新头像成功')
                const info = { ...this.userInfo, iconUrl: iconUrl }
                resetUserIconUrl(info)
                this.setUserInfo(info)
                this.iconDialogVisible = false
              } else {
                this.$message(resp.data.msg)
              }
            })
          })
          .catch(err => {
            console.log(err)
          })
      })
    },

    onUpdateUserInfo () {
      if (this.showUserInfo.name.length) {
        updateUser({
          name: this.showUserInfo.name,
          uId: this.userInfo.id
        }).then(resp => {
          if (resp.data.code === 1000) {
            this.$message('更新个人信息成功')
            const info = { ...this.userInfo, name: this.showUserInfo.name }
            this.setUserInfo(info)
            this.showUser = false
          } else {
            this.$message(resp.data.msg)
          }
        })
      } else {
        this.$message('名字不能为空')
      }
    },

    ...mapActions({
      setUserInfo: 'setUser',
      showLogin: 'showLogin',
      showPeotryCreate: 'showPeotryCreate'
    })
  }
}
</script>

<style lang="scss" scoped>
.peotry-header {
  height: 100%;

  .float-right {
    float: right;
    margin-top: 10px;
  }
}
</style>
