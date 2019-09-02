<template>
  <el-dialog
    :title="createValue ? '创建诗词' : '更新诗词'"
    :visible.sync="visible"
    @opened="onDialogOpened"
    @closed="onDialogClosed"
    custom-class="peotry-create"
  >
    <el-form :model="newPeotry" :rules="formRules" ref="ruleForm" label-width="60px">
      <el-form-item label="选集" prop="sId">
        <el-select v-model="newPeotry.sId" placeholder="请选择">
          <el-option v-for="set in peotrySets" :key="set.id" :value="set.id" :label="set.name"></el-option>
        </el-select>
        <i class="el-icon-plus peotry-set-add" @click="addPeotrySet"></i>
      </el-form-item>

      <el-form-item label="标题" prop="title">
        <el-input placeholder="标题" v-model="newPeotry.title"></el-input>
      </el-form-item>

      <el-form-item label="内容" prop="content">
        <el-input
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 10}"
          maxlength="1000"
          placeholder="内容，不少于5个字符"
          v-model="newPeotry.content"
        ></el-input>
      </el-form-item>

      <el-form-item label="尾注" prop="end">
        <el-input type="textarea" placeholder="尾注" v-model="newPeotry.end"></el-input>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          @click.stop="onCreateUpdate"
          :loading="inRequest"
        >{{createValue ? '创建' : '更新'}}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import { mapState } from 'vuex'
import {
  queryPeotrySets,
  createPeotry,
  updatePeotry,
  createPoetrySet
} from '@/api'

export default {
  props: {
    showCreate: {
      required: true,
      type: Boolean,
      default: false
    },
    peotry: {
      type: Object
    }
  },
  data () {
    return {
      visible: false,
      createValue: true,
      inRequest: false,
      newPeotry: {
        sId: null,
        title: '',
        content: '',
        end: ''
      },
      setName: '',
      peotrySets: [],

      formRules: {
        sId: [{ required: true, message: '请选择选集', trigger: 'click' }],
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ],
        content: [
          { required: true, message: '请选输入诗词内容', trigger: 'change' },
          {
            min: 5,
            max: 1000,
            message: '长度在 5 到 1000 个字符',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  watch: {
    showCreate () {
      this.visible = this.showCreate
      if (this.visible) {
        this.getPeotrySets()
      }
    },
    peotry () {
      if (this.peotry) {
        this.visible = true
        this.createValue = false
        this.getPeotrySets()

        const peotry = this.peotry
        this.newPeotry = {
          id: peotry.id,
          uId: peotry.user && peotry.user.id,
          sId: peotry.set && peotry.set.id,
          title: peotry.title,
          content: peotry.content,
          end: peotry.end
        }
      } else {
        this.createValue = true
        this.newPeotry = {
          sId: null,
          title: '',
          content: '',
          end: ''
        }
      }
    }
  },
  computed: {
    ...mapState({
      userInfo: state => state.user
    })
  },
  mounted () {
    window.peotryCreate = this
  },
  methods: {
    getPeotrySets () {
      queryPeotrySets(this.userInfo.id).then(resp => {
        if (resp.data.code === 1000) {
          const data = resp.data
          this.peotrySets = data.data
        } else {
          this.$message(resp.data.msg)
        }
      })
    },

    onCreateUpdate () {
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          if (this.createValue) {
            this.onCreate()
          } else {
            this.onUpdate()
          }
        } else {
          this.$message('请输入表单内容')
        }
      })
    },

    onCreate () {
      this.inRequest = true
      const newPeotry = this.newPeotry
      const data = {
        uId: this.userInfo.id,
        ...newPeotry
      }
      createPeotry(data).then(resp => {
        if (resp.data.code === 1000) {
          this.$message('创建成功')
          this.$refs.ruleForm.resetFields()
          this.visible = false
        } else {
          this.$message(resp.data.msg)
        }
      })
    },

    onUpdate () {
      const peotry = this.newPeotry
      if (!peotry || !peotry.id) return
      this.inRequest = true
      updatePeotry({
        pId: peotry.id,
        uId: this.userInfo.id,
        sId: peotry.sId,
        title: peotry.title,
        content: peotry.content,
        end: peotry.end
      }).then(resp => {
        if (resp.data.code === 1000) {
          this.$message('保存成功')
          this.visible = false
        } else {
          this.$message(resp.data.msg)
        }
      })
    },

    setCreateChange () {},
    addPeotrySet () {
      this.$prompt('请输入选集名字', '创建选集', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(({ value }) => {
          const length = value.trim().length
          if (length <= 0) {
            this.$message('选集名称不能为空')
          } else if (length > 20) {
            this.$message('选集名称不能超过20个字符')
          } else {
            createPoetrySet({
              uId: this.userInfo.id,
              name: value
            }).then(resp => {
              if (resp.data.code === 1000) {
                this.$message('创建选集成功')
                this.getPeotrySets()
              } else {
                this.$message(resp.data.msg)
              }
            })
          }
        })
        .catch(() => {})
    },

    onDialogOpened () {
      this.inRequest = false
    },
    onDialogClosed () {
      this.$emit('on-close', this.createValue)
      this.createValue = true
      this.inRequest = false
    }
  }
}
</script>

<style lang="scss">
.peotry-create {
  width: 80%;
  max-width: 500px;
}

.peotry-set-add {
  margin-left: 10px;
  cursor: pointer;
  font-size: 20px;
}
</style>
