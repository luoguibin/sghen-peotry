<template>
  <el-dialog
    :title="signUpValue ? '注册' : '登录'"
    :visible.sync="visible"
    :close-on-click-modal="false"
  >
    <el-form ref="ruleForm" :model="account" :rules="formRules" label-width="80px" autocomplete="off">
      <el-form-item label="账 号" prop="id">
        <el-input v-model.number="account.id" type="tel"></el-input>
      </el-form-item>

      <el-form-item label="昵 称" prop="name" v-if="signUpValue">
        <el-input v-model.trim="account.name"></el-input>
      </el-form-item>

      <el-form-item label="密 码" prop="pw">
        <el-input @keyup.native.enter="onLoginCreate" v-model="account.pw" show-password clearable></el-input>
      </el-form-item>

      <el-form-item label="重复密码" prop="pw2" v-if="signUpValue">
        <el-input @keyup.native.enter="onLoginCreate" v-model="account.pw2" show-password clearable></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click.stop="onLoginCreate"
          :loading="inRequest"
        >{{signUpValue ? "注册" : "登录"}}</el-button>
        <el-switch
          style="float: right; margin-top: 20px;"
          v-model="signUpValue"
          @change="signUpChange"
          active-color="#13ce66"
          active-text="注册"
        ></el-switch>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import { loginByAccount, createUser } from '@/api'

export default {
  name: 'login-dialog',
  data () {
    return {
      visible: false,
      signUpValue: false,
      inRequest: false,
      account: {
        id: null,
        name: '',
        pw: '',
        pw2: ''
      },
      formRules: {
        id: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: this.validateId, trigger: 'blur' }
        ],
        name: [
          { required: true, min: 1, message: '请输入昵称', trigger: 'blur' }
        ],
        pw: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        pw2: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 20,
            message: '长度在 6 到 20 个字符',
            trigger: 'blur'
          },
          { validator: this.validatePass2, trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    loginCount () {
      this.visible = true
    },
    visible (v) {
      if (v) {
        if (this.userInfo && this.userInfo.token) {
          this.checkDirect()
        }
      }
    }
  },
  computed: {
    ...mapState({
      loginCount: state => state.loginCount,
      userInfo: state => state.user
    })
  },
  created () {
    window.loginDialog = this
  },
  methods: {
    validateId (rule, value, callback) {
      if (!/^1[34578]\d{9}$/.test(value)) {
        callback(new Error('请输入11位手机号码'))
      } else {
        callback()
      }
    },
    validatePass2 (rule, value, callback) {
      if (value !== this.account.pw) {
        callback(new Error('两次密码不一致'))
      } else {
        callback()
      }
    },
    signUpChange () {
      this.$refs.ruleForm.clearValidate()
      this.inRequest = false
      if (this.signUpValue) {
        const account = this.account
        account.id = null
        account.name = ''
        account.pw = ''
        account.pw2 = ''
      }
    },

    checkDirect () {
      const query = this.$route.query
      const loginDirect = window.decodeURIComponent(query.login_direct || '')
      if (!loginDirect) {
        return
      }
      let temp = ''
      const object = this.userInfo
      for (const key in object) {
        if (object.hasOwnProperty(key)) {
          temp += '&' + key + '=' + object[key]
        }
      }
      temp = temp.substr(1)
      const fullPath = loginDirect + '?' + temp
      if (query.new) {
        window.open(fullPath, '_blank')
      } else {
        location.href = fullPath
      }
    },

    onLoginCreate () {
      this.$refs.ruleForm.validate(valid => {
        if (!valid) {
          this.$message.warning('请输入表单内容')
          return
        }

        this.inRequest = true
        const account = this.account
        let method, params, successMsg

        if (this.signUpValue) {
          method = createUser
          params = account
          successMsg = '注册成功'
        } else {
          method = loginByAccount
          params = { id: account.id, pw: account.pw }
        }

        method(params)
          .then(resp => {
            const userInfo = resp.data.data
            this.setUserInfo(userInfo)

            if (successMsg) {
              this.$message.success(successMsg)
            }
            this.visible = false
            this.signUpValue = false

            this.$nextTick(() => {
              this.checkDirect()
            })
          })
          .finally(() => {
            this.inRequest = false
          })
      })
    },
    ...mapActions({
      setUserInfo: 'setUser'
    })
  }
}
</script>
